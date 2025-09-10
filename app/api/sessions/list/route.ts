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
    
    // 타임아웃 설정 (8초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Sessions list API timeout')), 8000)
    })
    
    // Firebase 쿼리 실행
    const queryPromise = (async () => {
      // Firebase Admin SDK 사용
      const db = getAdminDatabase()
      if (!db) {
        console.error('Firebase Admin 데이터베이스 연결 실패')
        throw new Error('Firebase 데이터베이스 연결 실패')
      }
      
      // 세션 데이터 가져오기
      const sessionsRef = db.ref('sessions')
      console.log('Firebase 세션 데이터 조회 중...')
      
      const snapshot = await sessionsRef.once('value')
      console.log('Firebase 스냅샷 존재 여부:', snapshot.exists())
      
      if (!snapshot.exists()) {
        console.log('세션 데이터가 존재하지 않음')
        return []
      }
      
      const sessionsData = snapshot.val()
      console.log('Firebase에서 가져온 원본 데이터:', sessionsData)
      console.log('세션 키 목록:', Object.keys(sessionsData))
      
      // 세션 데이터 형식화 및 배열로 변환
      const allSessions = Object.entries(sessionsData).map(([sessionId, data]) => ({
        sessionId,
        ...(data as any)
      }))
      
      // 관리자 계정 체크 (judge@questiontalk.demo)
      const isAdmin = teacherId === 'MSMk1a3iHBfbLzLwwnwpFnwJjS63' // 관리자 UID
      
      console.log('관리자 여부:', isAdmin)
      
      // 관리자면 모든 세션 반환, 일반 교사면 자신의 세션만 반환
      const filteredSessions = isAdmin 
        ? allSessions 
        : allSessions.filter(session => session.teacherId === teacherId)
      
      console.log('필터링된 세션 배열:', filteredSessions)
      console.log('필터링된 세션 배열 길이:', filteredSessions.length)
      
      // 세션 정렬 (최신순) 및 제한 (성능 개선)
      filteredSessions.sort((a, b) => b.createdAt - a.createdAt)
      const limitedSessions = filteredSessions.slice(0, 100) // 최대 100개로 제한
      
      console.log('정렬된 세션 배열:', limitedSessions)
      
      return limitedSessions
    })()
    
    // 타임아웃과 쿼리 중 먼저 완료되는 것 반환
    const sessions = await Promise.race([queryPromise, timeoutPromise])
    
    console.log(`Firebase에서 가져온 세션 데이터:`, sessions)
    
    return NextResponse.json({ sessions })
  } catch (error) {
     console.error('세션 목록 조회 실패:', error)
     
     if (error instanceof Error && error.message === 'Sessions list API timeout') {
       console.log('세션 목록 API 타임아웃 - 빈 배열 반환')
       return NextResponse.json(
         { error: 'Request timeout', sessions: [] },
         { status: 200 } // 200으로 변경하여 클라이언트에서 정상 처리되도록
       )
     }
     
     return NextResponse.json(
       { error: 'Failed to fetch sessions', sessions: [] },
       { status: 200 } // 200으로 변경하여 클라이언트에서 정상 처리되도록
     )
   }
}