import { NextResponse } from 'next/server'
import { getAdminDatabase } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    // URL 매개변수에서 teacherId 추출
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    
    console.log('세션 목록 조회 시작... teacherId:', teacherId)
    
    // teacherId가 없으면 에러 반환
    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacherId is required' }, 
        { status: 400 }
      )
    }
    
    // 타임아웃 설정 (18초로 증가: Vercel 콜드스타트/네트워크 지연 보완)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sessions list API timeout')), 18000)
    })
    
    // Firebase 쿼리 실행 (필터링/정렬을 쿼리 단계에서 최대한 수행)
    const queryPromise = (async () => {
      console.log('🔥 Firebase Admin SDK 연결 시도...')
      
      // Firebase Admin SDK 사용 (연결 검증 강화)
      const db = getAdminDatabase()
      if (!db) {
        console.error('❌ Firebase Admin 데이터베이스 연결 실패 - null 반환')
        throw new Error('Firebase 데이터베이스 연결 실패')
      }
      
      console.log('✅ Firebase Admin SDK 연결 성공')
      
      // 연결 테스트 (빠른 확인)
      try {
        await db.ref('.info/connected').once('value')
        console.log('✅ Firebase 연결 상태 확인 완료')
      } catch (connectError) {
        console.error('⚠️ Firebase 연결 테스트 실패:', connectError)
        // 연결 실패해도 계속 진행 (fallback 시도)
      }
      
      // 관리자 계정 체크 (judge@questiontalk.demo)
      const isAdmin = teacherId === 'MSMk1a3iHBfbLzLwwnwpFnwJjS63' // 관리자 UID
      console.log('관리자 여부:', isAdmin)
      
      let snapshot
      if (isAdmin) {
        // 관리자: 최신 생성 순으로 최대 100개만 조회
        console.log('Firebase 세션 데이터 조회 중... (admin latest 100 by createdAt)')
        snapshot = await db
          .ref('sessions')
          .orderByChild('createdAt')
          .limitToLast(100)
          .once('value')
      } else {
        // 일반 교사: 본인 세션만 조회 (teacherId 인덱스 기반)
        console.log('Firebase 세션 데이터 조회 중... (by teacherId)')
        snapshot = await db
          .ref('sessions')
          .orderByChild('teacherId')
          .equalTo(teacherId)
          .limitToLast(100)
          .once('value')
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