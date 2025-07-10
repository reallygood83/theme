import { NextResponse } from 'next/server'
import { ref, push, set } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'

export async function POST(request: Request) {
  try {
    console.log('=== 세션 생성 API 시작 ===')
    console.log('환경변수 확인:', {
      FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    })
    
    const data = await request.json()
    console.log('받은 데이터:', data)
    
    // 필수 필드 검증
    if (!data.accessCode) {
      console.log('❌ 세션 코드 누락')
      return NextResponse.json(
        { error: '세션 코드는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // 세션 데이터 준비 - 다중 자료 지원
    const sessionData = {
      title: data.title || '제목 없음',
      teacherId: data.teacherId || '', // 교사 ID 추가
      materials: data.materials || [], // 다중 자료 배열
      keywords: data.keywords || [],
      accessCode: data.accessCode,
      createdAt: data.createdAt || Date.now(),
      // 기존 데이터와의 호환성을 위해 첫 번째 자료 정보도 저장
      materialText: data.materials?.[0]?.type === 'text' ? data.materials[0].content : '',
      materialUrl: data.materials?.[0]?.type === 'youtube' ? data.materials[0].url : ''
    }
    
    // Firebase Client SDK로 간단하게 처리
    console.log('Firebase 연결 중...')
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    };
    
    // Firebase 앱 초기화
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getDatabase(app);
    console.log('✅ Firebase 연결 완료')
    
    // 세션 생성
    const sessionsRef = ref(db, 'sessions')
    const newSessionRef = push(sessionsRef)
    
    console.log('세션 생성 시도:', {
      sessionId: newSessionRef.key,
      teacherId: sessionData.teacherId,
      title: sessionData.title
    })
    
    await set(newSessionRef, sessionData)
    console.log('✅ 세션 생성 완료:', newSessionRef.key)
    
    return NextResponse.json({ 
      success: true, 
      sessionId: newSessionRef.key 
    })
  } catch (error) {
    console.error('❌ 세션 생성 오류 상세:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    return NextResponse.json(
      { 
        error: '세션 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}