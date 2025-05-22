import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, remove, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'

export async function DELETE(request: Request) {
  try {
    const { sessionId } = await request.json()
    
    // 필수 필드 검증
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
          { error: 'Firebase 설정이 완료되지 않았습니다.' }, 
          { status: 500 }
        );
      }
      
      const app = initializeApp(firebaseConfig);
      db = getDatabase(app);
    }
    
    // 세션 삭제
    const sessionRef = ref(db, `sessions/${sessionId}`)
    
    console.log('세션 삭제 시도:', sessionId)
    
    await remove(sessionRef)
    
    console.log('세션 삭제 완료:', sessionId)
    
    return NextResponse.json({ 
      success: true,
      message: '세션이 성공적으로 삭제되었습니다.'
    })
  } catch (error) {
    console.error('세션 삭제 오류:', error)
    return NextResponse.json(
      { error: '세션 삭제에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}