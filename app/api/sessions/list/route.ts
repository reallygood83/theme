import { NextResponse } from 'next/server'
import { getAdminDatabase } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    // URL 매개변수에서 teacherId 추출
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    
    console.log('요청된 teacherId:', teacherId)
    
    // teacherId가 없으면 에러 반환
    if (!teacherId) {
      console.log('teacherId가 제공되지 않음')
      return NextResponse.json(
        { error: '교사 ID가 필요합니다.' }, 
        { status: 400 }
      )
    }
    
    // Firebase Admin SDK 사용
    const db = getAdminDatabase()
    if (!db) {
      console.error('Firebase Admin 데이터베이스 연결 실패')
      return NextResponse.json(
        { error: 'Firebase 데이터베이스 연결 실패' }, 
        { status: 500 }
      )
    }
    
    // 세션 데이터 가져오기
    const sessionsRef = db.ref('sessions')
    console.log('Firebase 세션 데이터 조회 중...')
    
    const snapshot = await sessionsRef.once('value')
    console.log('Firebase 스냅샷 존재 여부:', snapshot.exists())
    
    if (!snapshot.exists()) {
      console.log('세션 데이터가 존재하지 않음')
      return NextResponse.json({ sessions: [] })
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
    
    // 세션 정렬 (최신순)
    filteredSessions.sort((a, b) => b.createdAt - a.createdAt)
    
    console.log('정렬된 세션 배열:', filteredSessions)
    
    return NextResponse.json({ sessions: filteredSessions })
  } catch (error) {
    console.error('세션 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '세션 목록을 불러오는 중 오류가 발생했습니다.' }, 
      { status: 500 }
    )
  }
}