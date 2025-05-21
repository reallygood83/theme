import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, update } from 'firebase/database'
import { clusterQuestions, recommendAgendas, extractKeyTerms } from '@/lib/gemini'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 필수 필드 검증
    if (!data.sessionId || !data.questions || !Array.isArray(data.questions) || data.questions.length < 3) {
      return NextResponse.json(
        { error: '세션 ID와 최소 3개 이상의 질문이 필요합니다.' }, 
        { status: 400 }
      )
    }
    
    // AI 분석 실행
    // 1. 질문 유목화
    const clusteringResult = await clusterQuestions(data.questions)
    
    // 2. 논제 추천
    const agendasResult = await recommendAgendas(clusteringResult.clusters, data.keywords || [])
    
    // 3. 주요 용어 추출 (첫 번째 논제 기준)
    let termsResult = { terms: [] }
    if (agendasResult.agendas && agendasResult.agendas.length > 0) {
      termsResult = await extractKeyTerms(agendasResult.agendas[0].agendaTitle)
    }
    
    // 분석 결과 저장
    const aiAnalysisResult = {
      clusteredQuestions: clusteringResult.clusters,
      recommendedAgendas: agendasResult.agendas,
      extractedTerms: termsResult.terms
    }
    
    // 데이터베이스에 결과 저장
    const sessionRef = ref(database, `sessions/${data.sessionId}`)
    await update(sessionRef, { aiAnalysisResult })
    
    // 결과 반환
    return NextResponse.json({ 
      success: true, 
      result: aiAnalysisResult
    })
  } catch (error) {
    console.error('AI 분석 오류:', error)
    return NextResponse.json(
      { error: '질문 분석에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}