import { NextResponse } from 'next/server'
import { ref, query, orderByChild, equalTo, limitToLast, get } from 'firebase/database'
import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// API route는 동적으로 처리 필요
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // URL 매개변수에서 teacherId 추출 (Next.js 동적 처리를 위한 수정)
    const url = new URL(request.url || '', 'http://localhost')
    const teacherId = url.searchParams.get('teacherId')
    
    console.log('세션 목록 조회 시작... teacherId:', teacherId)
    
    // teacherId가 없으면 에러 반환
    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacherId is required' }, 
        { status: 400 }
      )
    }
    
    // 타임아웃 설정 (10초로 단축: 클라이언트 SDK 사용으로 성능 향상)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sessions list API timeout')), 10000)
    })
    
    // Firebase 쿼리 실행 - Client SDK 사용 (create API와 동일한 방식)
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
      
      // 관리자 계정 체크 (judge@questiontalk.demo)
      const isAdmin = teacherId === 'MSMk1a3iHBfbLzLwwnwpFnwJjS63' // 관리자 UID
      console.log('관리자 여부:', isAdmin)
      
      let snapshot
      if (isAdmin) {
        // 관리자: 최신 생성 순으로 최대 100개만 조회
        console.log('Firebase 세션 데이터 조회 중... (admin latest 100 by createdAt)')
        const sessionQuery = query(
          ref(db, 'sessions'),
          orderByChild('createdAt'),
          limitToLast(100)
        )
        snapshot = await get(sessionQuery)
      } else {
        // 일반 교사: 본인 세션만 조회 (teacherId 인덱스 기반)
        console.log('Firebase 세션 데이터 조회 중... (by teacherId)')
        const sessionQuery = query(
          ref(db, 'sessions'),
          orderByChild('teacherId'),
          equalTo(teacherId),
          limitToLast(100)
        )
        snapshot = await get(sessionQuery)
      }
      
      console.log('Firebase 스냅샷 존재 여부:', snapshot.exists())
      if (!snapshot.exists()) {
        console.log('세션 데이터가 존재하지 않음')
        return []
      }
      
      const sessionsData = snapshot.val() as Record<string, any> | null
      console.log('Firebase에서 가져온 원본 데이터(요약): keys=', sessionsData ? Object.keys(sessionsData).length : 0)
      
      // 세션 데이터 형식화 및 배열로 변환
      const allSessions = Object.entries(sessionsData || {}).map(([sessionId, data]) => ({
        sessionId,
        ...(data as any)
      }))
      
      // 정렬 (최신순) 및 안전한 createdAt 처리
      allSessions.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
      
      console.log('필터링/정렬 후 세션 수:', allSessions.length)
      return allSessions
    })()
    
    // 타임아웃과 쿼리 중 먼저 완료되는 것 반환
    const sessions = await Promise.race([queryPromise, timeoutPromise])
    
    console.log(`Firebase에서 가져온 세션 데이터:`, Array.isArray(sessions) ? sessions.slice(0, 3) : sessions)
    
    return NextResponse.json({ sessions: Array.isArray(sessions) ? sessions : [] })
  } catch (error) {
    console.error('세션 목록 조회 실패:', error)
    
    if (error instanceof Error && error.message === 'Sessions list API timeout') {
      console.log('세션 목록 API 타임아웃 - 빈 배열 반환')
      return NextResponse.json(
        { error: 'Request timeout', sessions: [] },
        { status: 200 } // 200으로 유지하여 클라이언트에서 정상 처리되도록
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch sessions', sessions: [] },
      { status: 200 } // 200으로 유지하여 클라이언트에서 정상 처리되도록
    )
  }
}