import { NextRequest, NextResponse } from 'next/server'
import { realtimeSharedScenarioService } from '@/lib/firebase/realtime-services'

// GET: 공유된 시나리오 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const grade = searchParams.get('grade')
    const keyword = searchParams.get('keyword')

    const scenarios = await realtimeSharedScenarioService.getSharedScenarios({
      limit,
      offset,
      grade: grade || undefined,
      keyword: keyword || undefined
    })

    return NextResponse.json({
      success: true,
      data: scenarios
    })
  } catch (error) {
    console.error('공유 시나리오 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '공유 시나리오 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 시나리오 복사
export async function POST(request: NextRequest) {
  try {
    const { scenarioId, userId } = await request.json()

    if (!scenarioId || !userId) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const result = await realtimeSharedScenarioService.copyScenario(scenarioId, userId)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('시나리오 복사 실패:', error)
    return NextResponse.json(
      { success: false, error: '시나리오 복사에 실패했습니다.' },
      { status: 500 }
    )
  }
}