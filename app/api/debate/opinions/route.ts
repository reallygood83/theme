import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'
import { realtimeNotificationService } from '@/lib/firebase/realtime-services'

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Firebase 앱 초기화
if (!getApps().length) {
  initializeApp(firebaseConfig)
}

// 토론 의견 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const sessionCode = searchParams.get('sessionCode')

    console.log('의견 조회 요청:', { studentId, sessionCode })

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: '학생 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const opinions: any[] = []

    try {
      // 세션별 의견 조회 시도
      if (sessionCode) {
        const sessionOpinionsRef = ref(db, `session-opinions/${sessionCode}`)
        const sessionQuery = query(sessionOpinionsRef, orderByChild('studentId'), equalTo(studentId))
        const sessionSnapshot = await get(sessionQuery)
        
        if (sessionSnapshot.exists()) {
          sessionSnapshot.forEach((childSnapshot) => {
            opinions.push({
              _id: childSnapshot.key,
              ...childSnapshot.val()
            })
          })
        }
      }

      // 기본 경로에서도 조회
      const opinionsRef = ref(db, 'debate-opinions')
      const studentOpinionsQuery = query(opinionsRef, orderByChild('studentId'), equalTo(studentId))
      const snapshot = await get(studentOpinionsQuery)

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          opinions.push({
            _id: childSnapshot.key,
            ...childSnapshot.val()
          })
        })
      }

    } catch (queryError) {
      console.log('쿼리 실행 중 오류 (권한 문제일 수 있음):', queryError)
      // 권한 문제가 있을 경우 빈 배열 반환
    }

    // 최신순으로 정렬
    opinions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    console.log(`조회된 의견 수: ${opinions.length}`)

    return NextResponse.json({
      success: true,
      data: { opinions }
    })

  } catch (error) {
    console.error('토론 의견 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '토론 의견 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 토론 의견 제출 (POST)
export async function POST(request: NextRequest) {
  try {
    console.log('🔥 POST 요청 시작')
    
    const body = await request.json()
    const { topic, content, studentName, studentId, classId, sessionCode } = body

    console.log('토론 의견 제출 요청:', { topic, content, studentName, studentId, classId, sessionCode })

    // 필수 필드 검증
    if (!topic || !content || !studentName || !studentId || !sessionCode) {
      console.log('필수 필드 누락:', { 
        topic: { value: topic, exists: !!topic }, 
        content: { value: content, exists: !!content }, 
        studentName: { value: studentName, exists: !!studentName }, 
        studentId: { value: studentId, exists: !!studentId }, 
        sessionCode: { value: sessionCode, exists: !!sessionCode }
      })
      return NextResponse.json(
        { 
          success: false, 
          error: '필수 정보(토론 주제, 내용, 학생명, 학생ID, 세션코드)가 누락되었습니다.',
          missingFields: {
            topic: !topic,
            content: !content,
            studentName: !studentName,
            studentId: !studentId,
            sessionCode: !sessionCode
          }
        },
        { status: 400 }
      )
    }

    console.log('🔥 Firebase 연결 시도 중...')
    let db
    try {
      db = getDatabase()
      console.log('✅ Firebase 데이터베이스 연결 성공')
    } catch (dbError) {
      console.error('❌ Firebase 데이터베이스 연결 실패:', dbError)
      return NextResponse.json(
        { success: false, error: 'Firebase 데이터베이스 연결에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 🔥 핵심: sessionCode → sessionId, teacherId 변환
    console.log('🔍 세션 코드로 세션 및 교사 정보 조회 중:', sessionCode)
    
    const sessionsRef = ref(db, 'sessions')
    const sessionsSnapshot = await get(sessionsRef)
    
    if (!sessionsSnapshot.exists()) {
      console.log('❌ 세션 데이터가 존재하지 않음')
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const sessions = sessionsSnapshot.val()
    let targetSession = null
    let sessionId = null
    let teacherId = null

    // sessionCode 또는 accessCode로 세션 찾기
    console.log(`🔍 ${sessionCode} 코드로 세션 검색 중...`)
    for (const [id, session] of Object.entries(sessions)) {
      const currentSessionCode = (session as any).sessionCode
      const currentAccessCode = (session as any).accessCode
      const sessionTitle = (session as any).title
      const sessionTeacherId = (session as any).teacherId
      
      console.log(`세션 ${id}: 제목="${sessionTitle}", sessionCode=${currentSessionCode || 'undefined'}, accessCode=${currentAccessCode || 'undefined'}, teacherId=${sessionTeacherId || 'undefined'}`)
      
      // sessionCode 또는 accessCode 중 하나라도 일치하면 찾은 것으로 간주
      if (currentSessionCode === sessionCode || currentAccessCode === sessionCode) {
        targetSession = session
        sessionId = id
        teacherId = sessionTeacherId
        console.log(`✅ 매칭된 세션 발견: ${id} (teacherId: ${teacherId})`)
        break
      }
    }

    if (!targetSession || !sessionId || !teacherId) {
      console.log(`❌ ${sessionCode} 코드에 해당하는 세션 또는 교사 정보 없음`)
      return NextResponse.json(
        { success: false, error: '잘못된 세션 코드이거나 교사 정보가 없습니다.' },
        { status: 404 }
      )
    }

    // 🔥 핵심: debate_opinions/${sessionId} 경로에 저장 (교사가 조회하는 경로와 동일)
    const targetPath = `debate_opinions/${sessionId}`
    
    console.log('🔥 Firebase 레퍼런스 생성 중...', targetPath)
    let opinionsRef, newOpinionRef
    try {
      opinionsRef = ref(db, targetPath)
      newOpinionRef = push(opinionsRef)
      console.log('✅ Firebase 레퍼런스 생성 성공')
    } catch (refError) {
      console.error('❌ Firebase 레퍼런스 생성 실패:', refError)
      return NextResponse.json(
        { success: false, error: 'Firebase 레퍼런스 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    const opinionData = {
      topic: topic.trim(),
      content: content.trim(),
      studentName,
      studentId,
      classId: classId || '',
      sessionCode: sessionCode,
      sessionId: sessionId,          // 🔥 추가: 세션 ID
      teacherId: teacherId,          // 🔥 추가: 교사 ID (핵심!)
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),  // teacher API가 기대하는 필드
      referenceCode: `DEBATE_${Date.now()}_${studentId.slice(-4)}`
    }

    console.log('🔥 의견 저장 시도:', { path: targetPath, data: opinionData })

    await set(newOpinionRef, opinionData)
    console.log('✅ 의견 저장 성공')

    // 🔥 실시간 알림 생성 - 교사에게 새 토론 의견 알림
    try {
      console.log('🔔 교사 알림 생성 중...', { teacherId, studentName })
      
      await realtimeNotificationService.create({
        teacherId: teacherId,
        title: '새로운 토론 의견이 제출되었습니다',
        message: `${studentName} 학생이 "${topic.slice(0, 30)}${topic.length > 30 ? '...' : ''}" 주제에 대한 의견을 제출했습니다.`,
        type: 'info',
        isRead: false,
        actionUrl: `/teacher/debate`,
        metadata: {
          opinionId: newOpinionRef.key,
          sessionId: sessionId,
          studentName: studentName,
          topic: topic,
          submittedAt: opinionData.submittedAt
        }
      })
      
      console.log('✅ 교사 알림 생성 완료')
    } catch (notificationError) {
      console.error('⚠️ 알림 생성 실패 (의견 저장은 성공):', notificationError)
      // 알림 실패는 전체 프로세스를 중단시키지 않음
    }

    return NextResponse.json({
      success: true,
      message: '토론 의견이 성공적으로 제출되었습니다.',
      data: {
        _id: newOpinionRef.key,
        ...opinionData
      }
    })

  } catch (error) {
    console.error('❌ 토론 의견 제출 전체 오류:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('❌ 오류 상세 정보:', {
      name: errorName,
      message: errorMsg,
      stack: errorStack,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { 
        success: false, 
        error: '토론 의견 제출 중 오류가 발생했습니다.',
        details: errorMsg 
      },
      { status: 500 }
    )
  }
}