import { NextResponse } from 'next/server'
import { getAdminDatabase } from '@/lib/firebase-admin'
import {
  sessionMatchesCode,
  validateDebateOpinionSubmission,
} from '@/lib/debate-opinion-submission'

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: '요청 본문을 읽을 수 없습니다.' },
        { status: 400 }
      )
    }

    const validation = validateDebateOpinionSubmission(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { data } = validation
    const database = getAdminDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: '의견 저장 서비스를 사용할 수 없습니다.' },
        { status: 503 }
      )
    }

    const sessionSnapshot = await database.ref(`sessions/${data.sessionId}`).once('value')
    if (!sessionMatchesCode(sessionSnapshot.val(), data.sessionCode)) {
      return NextResponse.json(
        { success: false, error: '세션 코드가 올바르지 않습니다.' },
        { status: 404 }
      )
    }

    const opinionData = {
      ...data,
      createdAt: Date.now(),
      timestamp: new Date().toISOString(),
    }

    const newOpinionRef = database.ref(`sessions/${data.sessionId}/debateOpinions`).push()
    await newOpinionRef.set(opinionData)

    return NextResponse.json({
      success: true,
      message: '토론 의견이 성공적으로 제출되었습니다.',
      opinionId: newOpinionRef.key,
    })
  } catch (error) {
    console.error('토론 의견 제출 API 오류:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { success: false, error: '토론 의견 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
