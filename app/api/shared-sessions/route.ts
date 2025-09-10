import { NextRequest, NextResponse } from 'next/server'
import { realtimeSharedSessionService } from '@/lib/firebase/realtime-services'

// GET: 공유된 세션 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const grade = searchParams.get('grade')
    const keyword = searchParams.get('keyword')

    const sessions = await realtimeSharedSessionService.getSharedSessions({
      limit,
      offset,
      grade: grade || undefined,
      keyword: keyword || undefined
    })

    return NextResponse.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    console.error('공유 세션 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '공유 세션 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 세션 복사
export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json()

    if (!sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const result = await realtimeSharedSessionService.copySession(sessionId, userId)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('세션 복사 실패:', error)
    return NextResponse.json(
      { success: false, error: '세션 복사에 실패했습니다.' },
      { status: 500 }
    )
  }
}