import { NextResponse } from 'next/server'
import { ref, get, push, set } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { generateSessionCode } from '@/lib/utils'

// API route는 동적으로 처리 필요
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('=== 세션 복제 API 시작 ===')
    
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      console.log('❌ 세션 ID 누락')
      return NextResponse.json(
        { error: '세션 ID는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    console.log('📋 복제할 세션 ID:', sessionId)
    
    // 타임아웃 설정 (10초)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Session duplicate API timeout')), 10000)
    })

    const queryPromise = (async () => {
      console.log('🔥 Firebase Client SDK 연결 시도...')
      
      // 환경 변수 확인
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
      }
      
      console.log('환경변수 확인:', {
        FIREBASE_API_KEY: !!firebaseConfig.apiKey,
        FIREBASE_PROJECT_ID: firebaseConfig.projectId,
        FIREBASE_DATABASE_URL: firebaseConfig.databaseURL
      })
      
      // 필수 환경 변수 검증
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
        throw new Error('Firebase 환경 변수 누락: API key, Project ID, Database URL이 필요합니다.')
      }
      
      // Firebase 앱 초기화
      let app
      let db
      try {
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig)
        } else {
          app = getApps()[0]
        }
        
        db = getDatabase(app)
        console.log('✅ Firebase Client SDK 연결 성공')
      } catch (initError) {
        console.error('❌ Firebase 초기화 실패:', initError)
        throw new Error(`Firebase 초기화 실패: ${initError instanceof Error ? initError.message : String(initError)}`)
      }
      
      return { db }
    })()
    
    // 타임아웃과 쿼리 중 먼저 완료되는 것 반환
    const { db } = await Promise.race([queryPromise, timeoutPromise])
    
    // 원본 세션 데이터 가져오기
    console.log('🔍 원본 세션 데이터 조회 중...')
    const originalSessionRef = ref(db, `sessions/${sessionId}`)
    const snapshot = await get(originalSessionRef)
    
    if (!snapshot.exists()) {
      console.log('❌ 복제할 세션을 찾을 수 없음')
      return NextResponse.json(
        { error: '복제할 세션을 찾을 수 없습니다.' }, 
        { status: 404 }
      )
    }
    
    const originalSession = snapshot.val()
    console.log('✅ 원본 세션 데이터 조회 성공:', originalSession.title)
    
    // 새 세션 데이터 준비
    const newSessionCode = generateSessionCode()
    const newSessionData = {
      title: originalSession.title ? `${originalSession.title} (복사본)` : '제목 없음 (복사본)',
      teacherId: originalSession.teacherId || '', // 교사 ID 복제
      materials: originalSession.materials || [], // 다중 자료 복제
      materialText: originalSession.materialText || '',
      materialUrl: originalSession.materialUrl || '',
      keywords: originalSession.keywords || [],
      accessCode: newSessionCode,
      createdAt: Date.now(),
      isDuplicated: true,
      duplicatedFrom: sessionId
    }
    
    console.log('🆕 새 세션 데이터 준비 완료:', {
      title: newSessionData.title,
      accessCode: newSessionCode,
      teacherId: newSessionData.teacherId
    })
    
    // 새 세션 생성
    const sessionsRef = ref(db, 'sessions')
    const newSessionRef = push(sessionsRef)
    await set(newSessionRef, newSessionData)
    
    console.log('✅ 세션 복제 완료:', newSessionRef.key)
    
    return NextResponse.json({ 
      success: true, 
      sessionId: newSessionRef.key,
      sessionCode: newSessionCode
    })
    
  } catch (error) {
    console.error('세션 복제 오류:', error)
    
    if (error instanceof Error && error.message === 'Session duplicate API timeout') {
      console.log('세션 복제 API 타임아웃')
      return NextResponse.json(
        { error: 'Request timeout', message: '세션 복제 요청이 시간 초과되었습니다.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: '세션 복제에 실패했습니다.', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    )
  }
}