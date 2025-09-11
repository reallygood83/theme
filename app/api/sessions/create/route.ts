import { NextResponse } from 'next/server'
import admin from 'firebase-admin'

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  })
}

export async function POST(request: Request) {
  try {
    console.log('=== 세션 생성 API 시작 (Admin SDK) ===')
    console.log('환경변수 확인:', {
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY
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
    
    // Firebase Admin SDK로 데이터베이스 접근
    console.log('Firebase Admin SDK로 연결 중...')
    const db = admin.database()
    console.log('✅ Firebase Admin SDK 연결 완료')
    
    // 세션 생성
    const sessionsRef = db.ref('sessions')
    const newSessionRef = sessionsRef.push()
    
    console.log('세션 생성 시도:', {
      sessionId: newSessionRef.key,
      teacherId: sessionData.teacherId,
      title: sessionData.title
    })
    
    await newSessionRef.set(sessionData)
    console.log('✅ 세션 생성 완료:', newSessionRef.key)
    
    // Firebase 마이그레이션: 알림 시스템은 향후 Firebase 기반으로 재구현 예정
    console.log('세션 생성 완료 - 교사ID:', sessionData.teacherId)
    
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