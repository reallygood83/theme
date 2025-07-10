import { NextResponse } from 'next/server'
import { ref, push, set, get, getDatabase, Database } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'

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
    
    // 서버사이드에서 Firebase 직접 초기화
    console.log('Firebase 설정 준비 중...')
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    };
    
    console.log('Firebase 설정 확인:', {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      databaseURL: firebaseConfig.databaseURL
    })
    
    // 필수 설정 확인
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
      console.log('❌ Firebase 필수 설정 누락')
      return NextResponse.json(
        { error: 'Firebase 설정이 불완전합니다.' }, 
        { status: 500 }
      );
    }
    
    // Firebase 앱 초기화 (중복 방지)
    console.log('Firebase 앱 초기화 중...')
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ 새 Firebase 앱 초기화 완료')
    } else {
      app = getApps()[0];
      console.log('✅ 기존 Firebase 앱 사용')
    }
    
    // Database 인스턴스 생성
    const db = getDatabase(app);
    console.log('✅ Firebase Database 연결 완료')
    
    // 세션 생성
    const sessionsRef = ref(db, 'sessions')
    const newSessionRef = push(sessionsRef)
    
    console.log('세션 생성 시도:', {
      sessionId: newSessionRef.key,
      teacherId: sessionData.teacherId,
      title: sessionData.title,
      materialsCount: sessionData.materials.length
    })
    
    await set(newSessionRef, sessionData)
    
    console.log('Firebase에 세션 저장 완료:', newSessionRef.key)
    
    // 저장 후 다시 확인
    const savedSessionRef = ref(db, `sessions/${newSessionRef.key}`)
    const savedSnapshot = await get(savedSessionRef)
    
    if (savedSnapshot.exists()) {
      console.log('저장 확인 성공:', savedSnapshot.val())
    } else {
      console.error('저장 확인 실패: 세션이 Firebase에서 조회되지 않음')
    }
    
    console.log('세션 생성 완료:', newSessionRef.key)
    
    // 세션 ID 반환
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