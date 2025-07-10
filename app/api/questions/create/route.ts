import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, push, set, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 필수 필드 검증
    if (!data.sessionId || !data.studentName || !data.text) {
      return NextResponse.json(
        { error: '세션 ID, 학생 이름, 질문 내용은 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // 질문 데이터 준비
    const questionData = {
      sessionId: data.sessionId,
      studentName: data.studentName,
      text: data.text,
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
    
    // 질문 저장
    const questionsRef = ref(db, `sessions/${data.sessionId}/questions`)
    const newQuestionRef = push(questionsRef)
    await set(newQuestionRef, questionData)
    
    // 질문 ID 반환
    return NextResponse.json({ 
      success: true, 
      questionId: newQuestionRef.key 
    })
  } catch (error) {
    console.error('질문 생성 오류:', error)
    return NextResponse.json(
      { error: '질문 생성에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}