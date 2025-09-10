import { NextRequest, NextResponse } from 'next/server'
import { ref, push, set, getDatabase } from 'firebase/database'
import { initializeApp } from 'firebase/app'

// Firebase 초기화 함수
function initializeFirebase() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }

  const app = initializeApp(firebaseConfig)
  return getDatabase(app)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sessionId, 
      sessionCode,
      studentName, 
      studentGroup, 
      selectedAgenda, 
      position, 
      opinionText 
    } = body

    // 입력 검증
    if (!sessionId || !sessionCode || !studentName || !studentGroup || 
        !selectedAgenda || !position || !opinionText) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!['agree', 'disagree'].includes(position)) {
      return NextResponse.json(
        { success: false, error: '올바르지 않은 입장입니다.' },
        { status: 400 }
      )
    }

    // Firebase 데이터베이스 초기화
    const database = initializeFirebase()
    
    // 토론 의견 데이터 구조
    const opinionData = {
      sessionId,
      sessionCode,
      studentName: studentName.trim(),
      studentGroup: studentGroup.trim(),
      selectedAgenda: selectedAgenda.trim(),
      position,
      opinionText: opinionText.trim(),
      createdAt: Date.now(),
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: request.headers.get('user-agent') || 'unknown',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    }

    // Firebase에 토론 의견 저장
    const opinionsRef = ref(database, `sessions/${sessionId}/debateOpinions`)
    const newOpinionRef = push(opinionsRef)
    await set(newOpinionRef, opinionData)

    console.log('토론 의견 API 제출 성공:', {
      opinionId: newOpinionRef.key,
      sessionCode,
      studentName,
      studentGroup,
      position
    })

    return NextResponse.json({
      success: true,
      message: '토론 의견이 성공적으로 제출되었습니다.',
      opinionId: newOpinionRef.key,
      data: {
        sessionCode,
        studentName,
        studentGroup,
        selectedAgenda,
        position,
        createdAt: opinionData.createdAt
      }
    })

  } catch (error) {
    console.error('토론 의견 제출 API 오류:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '토론 의견 제출 중 서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}