import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, update, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { sessionId, ...updateData } = data
    
    // 필수 필드 검증
    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // 업데이트할 데이터 준비
    const sessionUpdateData: any = {
      title: updateData.title || '제목 없음',
      keywords: updateData.keywords || [],
      updatedAt: Date.now()
    }
    
    // materials 배열이 있으면 사용, 없으면 이전 형식 사용
    if (updateData.materials && Array.isArray(updateData.materials)) {
      sessionUpdateData.materials = updateData.materials
      // 이전 형식 필드 제거
      sessionUpdateData.materialText = null
      sessionUpdateData.materialUrl = null
    } else {
      // 이전 형식 유지 (backward compatibility)
      sessionUpdateData.materialText = updateData.materialText || ''
      sessionUpdateData.materialUrl = updateData.materialUrl || ''
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
    
    // 세션 업데이트
    const sessionRef = ref(db, `sessions/${sessionId}`)
    
    console.log('세션 수정 시도:', {
      sessionId,
      updateData: sessionUpdateData
    })
    
    await update(sessionRef, sessionUpdateData)
    
    console.log('세션 수정 완료:', sessionId)
    
    return NextResponse.json({ 
      success: true,
      message: '세션이 성공적으로 수정되었습니다.'
    })
  } catch (error) {
    console.error('세션 수정 오류:', error)
    return NextResponse.json(
      { error: '세션 수정에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}