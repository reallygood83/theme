import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'

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
    const body = await request.json()
    const { topic, content, studentName, studentId, classId, sessionCode } = body

    console.log('토론 의견 제출 요청:', { topic, content, studentName, studentId, classId, sessionCode })

    // 필수 필드 검증
    if (!topic || !content || !studentName || !studentId) {
      console.log('필수 필드 누락:', { topic: !!topic, content: !!content, studentName: !!studentName, studentId: !!studentId })
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const db = getDatabase()
    
    // 기존 session_participants와 동일한 패턴 사용
    let targetPath = 'session_opinions' // 기본 경로
    
    if (classId) {
      // 세션ID(classId)별로 의견 저장 - session_participants와 동일한 구조
      targetPath = `session_opinions/${classId}`
    }
    
    const opinionsRef = ref(db, targetPath)
    const newOpinionRef = push(opinionsRef)

    const opinionData = {
      topic: topic.trim(),
      content: content.trim(),
      studentName,
      studentId,
      classId: classId || '',
      sessionCode: sessionCode || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      referenceCode: `DEBATE_${Date.now()}_${studentId.slice(-4)}`
    }

    console.log('의견 저장 시도:', { path: targetPath, data: opinionData })

    await set(newOpinionRef, opinionData)

    console.log('✅ 의견 저장 성공')

    return NextResponse.json({
      success: true,
      message: '토론 의견이 성공적으로 제출되었습니다.',
      data: {
        _id: newOpinionRef.key,
        ...opinionData
      }
    })

  } catch (error) {
    console.error('토론 의견 제출 오류:', error)
    return NextResponse.json(
      { success: false, error: '토론 의견 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}