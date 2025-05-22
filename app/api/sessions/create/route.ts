import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, push, set, get, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 필수 필드 검증
    if (!data.accessCode) {
      return NextResponse.json(
        { error: '세션 코드는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // 세션 데이터 준비
    const sessionData = {
      title: data.title || '제목 없음',
      materialText: data.materialText || '',
      materialUrl: data.materialUrl || '',
      keywords: data.keywords || [],
      accessCode: data.accessCode,
      createdAt: data.createdAt || Date.now()
    }
    
    // Firebase 라이브러리가 정상적으로 초기화되었는지 확인
    let db: Database | null = database;
    
    // Firebase 환경 변수 확인 및 필요시 재초기화
    if (!db) {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
          (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
            ? `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` 
            : undefined)
      };
      
      if (!firebaseConfig.databaseURL) {
        return NextResponse.json(
          { error: 'Firebase 설정이 완료되지 않았습니다. 환경 변수를 확인하세요.' }, 
          { status: 500 }
        );
      }
      
      const app = initializeApp(firebaseConfig);
      db = getDatabase(app);
    }
    
    // 세션 생성
    const sessionsRef = ref(db, 'sessions')
    const newSessionRef = push(sessionsRef)
    
    console.log('세션 생성 시도:', {
      sessionId: newSessionRef.key,
      sessionData
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
    console.error('세션 생성 오류:', error)
    return NextResponse.json(
      { error: '세션 생성에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}