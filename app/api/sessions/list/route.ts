import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, get, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'

export async function GET() {
  try {
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
    
    // 세션 데이터 가져오기
    const sessionsRef = ref(db, 'sessions')
    console.log('Firebase 세션 데이터 조회 중...')
    
    const snapshot = await get(sessionsRef)
    console.log('Firebase 스냅샷 존재 여부:', snapshot.exists())
    
    if (!snapshot.exists()) {
      console.log('세션 데이터가 존재하지 않음')
      return NextResponse.json({ sessions: [] })
    }
    
    const sessionsData = snapshot.val()
    console.log('Firebase에서 가져온 원본 데이터:', sessionsData)
    console.log('세션 키 목록:', Object.keys(sessionsData))
    
    // 세션 데이터 형식화 및 배열로 변환
    const sessions = Object.entries(sessionsData).map(([sessionId, data]) => ({
      sessionId,
      ...(data as any)
    }))
    
    console.log('변환된 세션 배열:', sessions)
    console.log('세션 배열 길이:', sessions.length)
    
    // 세션 정렬 (최신순)
    sessions.sort((a, b) => b.createdAt - a.createdAt)
    
    console.log('정렬된 세션 배열:', sessions)
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('세션 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '세션 목록을 불러오는 중 오류가 발생했습니다.' }, 
      { status: 500 }
    )
  }
}