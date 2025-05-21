import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, push, set } from 'firebase/database'
import { generateContent } from '@/lib/gemini'

// 학생용 AI 논제 추천 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, topic, description, studentName, studentGroup } = body
    
    if (!sessionId || !topic || !studentName || !studentGroup) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }
    
    // Gemini 모델을 사용하여 토론 논제 생성
    const prompt = `
당신은 학생들의 토론 활동을 돕는 AI 교육 도우미입니다. 
학생들이 제안한 주제에 맞는 좋은 토론 논제 3개를 생성해주세요.

주제: ${topic}
${description ? `추가 설명: ${description}` : ''}

다음 형식으로 응답해 주세요:
{
  "recommendedAgendas": [
    {
      "agendaTitle": "논제 제목 (질문 형태로)",
      "reason": "이 논제를 추천하는 이유 (2-3문장)",
      "type": "논제 유형 (찬반형, 원인탐구형, 문제해결형, 가치판단형 중 하나)"
    },
    // 나머지 논제들...
  ]
}

생성할 때 다음 사항을 고려하세요:
1. 논제는 찬성과 반대 입장이 명확하게 나뉠 수 있어야 합니다.
2. 연령대에 적합하고 이해하기 쉬운 언어로 작성하세요.
3. 모호한 표현을 피하고 한 문장으로 명확하게 표현하세요.
4. 각 논제는 서로 다른 관점이나 측면을 다루도록 하세요.
5. 다양한 유형의 논제를 포함하세요.

JSON 형식만 반환하세요. 추가 설명이나 다른 텍스트는 포함하지 마세요.
`
    
    // AI 모델에 질문 전송 및 응답 받기
    const response = await generateContent(prompt)
    
    if (!response || !response.trim()) {
      return NextResponse.json(
        { error: 'AI 응답을 생성하는 데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    // JSON 응답 파싱
    let parsedResponse
    try {
      // JSON 문자열만 추출하기 위한 처리
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : response
      parsedResponse = JSON.parse(jsonString)
    } catch (error) {
      console.error('JSON 파싱 오류:', error)
      console.log('원본 응답:', response)
      return NextResponse.json(
        { error: 'AI 응답을 파싱하는 데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    // 생성된 논제를 데이터베이스에 저장
    if (database && parsedResponse.recommendedAgendas) {
      try {
        const studentAgendasRef = ref(database, `sessions/${sessionId}/studentAgendas`)
        const newAgendaRef = push(studentAgendasRef)
        
        await set(newAgendaRef, {
          recommendedAgendas: parsedResponse.recommendedAgendas,
          topic,
          description: description || '',
          studentName,
          studentGroup,
          createdAt: Date.now()
        })
      } catch (dbError) {
        console.error('데이터베이스 저장 오류:', dbError)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      ...parsedResponse
    })
    
  } catch (error) {
    console.error('AI 논제 추천 API 오류:', error)
    return NextResponse.json(
      { error: '논제 추천 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}