import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, remove, get, set, getDatabase, Database } from 'firebase/database'
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
    console.log('삭제할 세션 경로:', `sessions/${sessionId}`)
    
    // 먼저 세션이 존재하는지 확인
    const snapshot = await get(sessionRef)
    console.log('삭제 전 세션 존재 여부:', snapshot.exists())
    
    if (!snapshot.exists()) {
      console.log('삭제하려는 세션이 존재하지 않음:', sessionId)
      return NextResponse.json({ 
        error: '삭제하려는 세션을 찾을 수 없습니다.' 
      }, { status: 404 })
    }
    
    console.log('삭제 전 세션 데이터:', snapshot.val())
    
    // 두 가지 방법으로 삭제 시도
    try {
      // 방법 1: remove() 사용
      await remove(sessionRef)
      console.log('remove() 메서드로 삭제 시도 완료')
    } catch (removeError) {
      console.error('remove() 삭제 실패, set(null) 시도:', removeError)
      // 방법 2: set(null) 사용 (대안)
      await set(sessionRef, null)
      console.log('set(null) 메서드로 삭제 시도 완료')
    }
    
    // 삭제 후 다시 확인
    const afterSnapshot = await get(sessionRef)
    console.log('삭제 후 세션 존재 여부:', afterSnapshot.exists())
    
    if (afterSnapshot.exists()) {
      console.error('삭제 후에도 세션이 여전히 존재함')
      return NextResponse.json({ 
        error: '세션 삭제가 완료되지 않았습니다.' 
      }, { status: 500 })
    }
    
    console.log('Firebase에서 세션 삭제 완료 확인:', sessionId)
    
    // 추가 확인: 전체 세션 목록에서 해당 세션이 없는지 재확인
    const allSessionsRef = ref(db, 'sessions')
    const allSessionsSnapshot = await get(allSessionsRef)
    
    if (allSessionsSnapshot.exists()) {
      const allSessions = allSessionsSnapshot.val()
      if (allSessions[sessionId]) {
        console.error('전체 세션 목록에서 여전히 세션이 발견됨:', sessionId)
        return NextResponse.json({ 
          error: '세션 삭제 확인에 실패했습니다.' 
        }, { status: 500 })
      }
    }
    
    console.log('세션 삭제 완료 및 확인 완료:', sessionId)
    
    return NextResponse.json({ 
      success: true,
      message: '세션이 성공적으로 삭제되었습니다.',
      deletedSessionId: sessionId
    })
  } catch (error) {
    console.error('세션 삭제 오류:', error)
    return NextResponse.json(
      { error: '세션 삭제에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}