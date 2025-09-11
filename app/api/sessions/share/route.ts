import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref, get, set, push } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

const db = getDatabase()

export async function POST(request: NextRequest) {
  try {
    console.log('세션 공유 API 요청 시작')
    
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('공유할 세션 ID:', sessionId)

    // 원본 세션 데이터 가져오기
    const sessionRef = ref(db, `sessions/${sessionId}`)
    const sessionSnapshot = await get(sessionRef)

    if (!sessionSnapshot.exists()) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const sessionData = sessionSnapshot.val()
    console.log('원본 세션 데이터 조회 완료:', sessionData.title || '제목없음')

    // 공유용 세션 데이터 생성 (학생 데이터 제외)
    const sharedSessionData = {
      // 기본 정보
      title: sessionData.title || '제목 없음',
      materialText: sessionData.materialText,
      materialUrl: sessionData.materialUrl,
      materials: sessionData.materials || [],
      keywords: sessionData.keywords || [],
      
      // 공유 메타데이터
      originalSessionId: sessionId,
      originalTeacherId: sessionData.teacherId,
      teacherName: sessionData.teacherName || '익명',
      sharedAt: Date.now(),
      
      // 통계 초기화
      viewCount: 0,
      importCount: 0,
      likeCount: 0,
      
      // 학생 데이터는 완전 제외
      // questions, aiAnalysisResult, studentData 등은 포함하지 않음
    }

    // 공유 세션 저장
    const sharedSessionsRef = ref(db, 'sharedSessions')
    const newSharedSessionRef = push(sharedSessionsRef)
    
    await set(newSharedSessionRef, sharedSessionData)
    
    const shareId = newSharedSessionRef.key
    console.log('세션 공유 완료, 공유 ID:', shareId)

    return NextResponse.json({
      success: true,
      shareId,
      message: '세션이 성공적으로 공유되었습니다.'
    })

  } catch (error) {
    console.error('세션 공유 중 오류 발생:', error)
    return NextResponse.json(
      { error: '세션 공유 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}