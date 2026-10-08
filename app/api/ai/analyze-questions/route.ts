import { NextResponse } from 'next/server'
import { get, ref, update } from 'firebase/database'
import { getFirebaseDatabase } from '@/lib/firebase'
import { describeDatabaseError } from '@/lib/database-error'
import { clusterQuestions, recommendAgendas, extractKeyTerms, UpstageError } from '@/lib/upstage'

export const dynamic = 'force-dynamic'

function readQuestions(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export async function POST(request: Request) {
  try {
    let data: { sessionId?: unknown; questions?: unknown; keywords?: string[] }
    try {
      data = await request.json()
    } catch {
      return NextResponse.json(
        { error: '요청 본문을 읽을 수 없습니다.' },
        { status: 400 }
      )
    }
    const questions = readQuestions(data?.questions)
    const sessionId = typeof data?.sessionId === 'string' ? data.sessionId.trim() : ''

    if (!sessionId || questions.length < 3) {
      return NextResponse.json(
        { error: '세션 ID와 최소 3개 이상의 질문이 필요합니다.' },
        { status: 400 }
      )
    }

    const clusteringResult = await clusterQuestions(questions)
    const agendasResult = await recommendAgendas(clusteringResult.clusters, data.keywords || [])

    let termsResult: { terms: Array<{ term: string; description: string }> } = { terms: [] }
    if (agendasResult.agendas && agendasResult.agendas.length > 0) {
      termsResult = await extractKeyTerms(agendasResult.agendas[0].agendaTitle)
    }

    const aiAnalysisResult = {
      clusteredQuestions: clusteringResult.clusters,
      recommendedAgendas: agendasResult.agendas,
      extractedTerms: termsResult.terms,
    }

    const database = getFirebaseDatabase()
    if (!database) {
      return NextResponse.json(
        { error: '분석 결과를 저장할 데이터베이스에 연결하지 못했습니다.' },
        { status: 503 }
      )
    }

    const sessionRef = ref(database, `sessions/${sessionId}`)
    const sessionSnapshot = await get(sessionRef)
    if (!sessionSnapshot.exists()) {
      return NextResponse.json(
        { error: '분석 결과를 저장할 세션을 찾지 못했습니다.' },
        { status: 404 }
      )
    }

    await update(sessionRef, { aiAnalysisResult })

    return NextResponse.json({
      success: true,
      result: aiAnalysisResult,
    })
  } catch (error) {
    console.error('AI 분석 오류:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof UpstageError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    const databaseError = describeDatabaseError(error, '질문 분석에 실패했습니다.')
    return NextResponse.json(
      { error: databaseError.error },
      { status: databaseError.status }
    )
  }
}
