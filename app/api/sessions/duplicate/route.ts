import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, get, push, set, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'
import { generateSessionCode } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID는 필수입니다.' }, 
        { status: 400 }
      )
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
    
    // 원본 세션 데이터 가져오기
    const originalSessionRef = ref(db, `sessions/${sessionId}`)
    const snapshot = await get(originalSessionRef)
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: '복제할 세션을 찾을 수 없습니다.' }, 
        { status: 404 }
      )
    }
    
    const originalSession = snapshot.val()
    
    // 새 세션 데이터 준비
    const newSessionCode = generateSessionCode()
    const newSessionData = {
      title: originalSession.title ? `${originalSession.title} (복사본)` : '제목 없음 (복사본)',
      materials: originalSession.materials || [], // 다중 자료 복제
      materialText: originalSession.materialText || '',
      materialUrl: originalSession.materialUrl || '',
      keywords: originalSession.keywords || [],
      accessCode: newSessionCode,
      createdAt: Date.now(),
      isDuplicated: true,
      duplicatedFrom: sessionId
    }
    
    // 새 세션 생성
    const sessionsRef = ref(db, 'sessions')
    const newSessionRef = push(sessionsRef)
    await set(newSessionRef, newSessionData)
    
    return NextResponse.json({ 
      success: true, 
      sessionId: newSessionRef.key,
      sessionCode: newSessionCode
    })
  } catch (error) {
    console.error('세션 복제 오류:', error)
    return NextResponse.json(
      { error: '세션 복제에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}