import { NextResponse } from 'next/server'
import { get, push, ref, set } from 'firebase/database'
import { getFirebaseDatabase } from '@/lib/firebase'
import {
  storeDebateOpinion,
  validateDebateOpinionSubmission,
} from '@/lib/debate-opinion-submission'

export const dynamic = 'force-dynamic'

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

    const database = getFirebaseDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: '의견 저장 서비스를 사용할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.' },
        { status: 503 }
      )
    }

    const result = await storeDebateOpinion({
      readSession: async (sessionId) => {
        const snapshot = await get(ref(database, `sessions/${sessionId}`))
        return snapshot.val()
      },
      writeOpinion: async (sessionId, opinion) => {
        const opinionRef = push(ref(database, `sessions/${sessionId}/debateOpinions`))
        await set(opinionRef, opinion)
        return opinionRef.key ?? ''
      },
    }, validation.data)

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: '토론 의견이 성공적으로 제출되었습니다.',
      opinionId: result.opinionId,
    })
  } catch (error) {
    console.error('토론 의견 제출 API 오류:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { success: false, error: '토론 의견 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
