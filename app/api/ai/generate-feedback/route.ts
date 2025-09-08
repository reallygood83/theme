import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { topic, content, teacherFeedback } = await request.json()

    if (!topic || !content) {
      return NextResponse.json(
        { success: false, error: '토론 주제와 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
다음은 학생이 제출한 토론 의견과 교사의 피드백입니다.

**토론 주제:** ${topic}

**학생 의견:**
${content}

**교사 피드백:**
${teacherFeedback || '(교사 피드백 없음)'}

위 내용을 바탕으로 학생에게 도움이 될 수 있는 추가적인 AI 피드백을 작성해주세요.

**피드백 작성 지침:**
1. 교사 피드백을 보완하는 내용으로 작성 (중복 최소화)
2. 학생의 사고력 향상에 도움이 되는 질문이나 관점 제시
3. 토론 역량 강화를 위한 구체적이고 실용적인 조언
4. 격려와 동기부여가 포함된 따뜻한 톤
5. 200-400자 내외의 적절한 길이

한국어로 답변해주세요.
`

    const result = await model.generateContent(prompt)
    const feedback = result.response.text().trim()

    return NextResponse.json({
      success: true,
      feedback
    })
  } catch (error) {
    console.error('Error generating AI feedback:', error)
    return NextResponse.json(
      { success: false, error: 'AI 피드백 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}