import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, update, get, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'

export async function POST(request: Request) {
  try {
    const { sessionId, agendas } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    if (!agendas || !Array.isArray(agendas)) {
      return NextResponse.json(
        { error: '유효한 논제 데이터가 필요합니다.' }, 
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
    
    // 세션 존재 여부 확인
    const sessionRef = ref(db, `sessions/${sessionId}`)
    const snapshot = await get(sessionRef)
    
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: '해당 세션을 찾을 수 없습니다.' }, 
        { status: 404 }
      )
    }
    
    // AI 분석 결과에 논제 부분만 업데이트
    const sessionData = snapshot.val()
    
    // 이전 분석 결과가 있어야 함
    if (!sessionData.aiAnalysisResult) {
      return NextResponse.json(
        { error: 'AI 분석 결과가 없습니다. 먼저 분석을 실행해주세요.' }, 
        { status: 400 }
      )
    }
    
    // 기존 AI 분석 결과 복사
    const updatedAnalysisResult = {
      ...sessionData.aiAnalysisResult,
      recommendedAgendas: agendas,
      isCustomized: true,
      lastModified: Date.now()
    }
    
    // 논제 데이터 업데이트
    await update(ref(db, `sessions/${sessionId}`), {
      aiAnalysisResult: updatedAnalysisResult
    })
    
    return NextResponse.json({ 
      success: true,
      message: '논제가 성공적으로 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('논제 업데이트 오류:', error)
    return NextResponse.json(
      { error: '논제 업데이트에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}