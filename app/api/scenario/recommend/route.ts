import { NextRequest, NextResponse } from 'next/server'

const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2500
}

// OpenAI API 호출 함수
async function callOpenAI(prompt: string) {
  console.log('🚀 AI 주제 추천 호출 시작...')
  
  if (!OPENAI_CONFIG.apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: '당신은 초등학교 토론 교육 전문가입니다. 초등토론교육모형의 철학과 4단계 과정을 완벽히 이해하고 있으며, 학생들의 비판적 사고력과 의사소통 능력을 향상시키는 토론 시나리오를 만들어냅니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ OpenAI 주제 추천 응답 성공')
    return data.choices[0].message.content
    
  } catch (error) {
    console.error('❌ OpenAI API 호출 실패:', error)
    throw error
  }
}

// 토론 목적별 특화 지침
function getPurposeSpecificTopicGuidelines(purpose: string) {
  const topicGuidelines: Record<string, string> = {
    '비판적 사고력 기르기': `
## 비판적 사고력 기르기에 특화된 주제 추천 지침:
- 논리적 근거와 반박이 명확히 필요한 주제를 선정해주세요
- 학생들이 "왜?"라는 질문을 던지게 하는 주제를 우선시해주세요
- 단순한 선호도가 아닌, 합리적 판단이 필요한 주제를 선택해주세요
- 찬성과 반대 모두에 논리적 근거가 충분한 주제를 추천해주세요`,

    '의사소통 능력 향상': `
## 의사소통 능력 향상에 특화된 주제 추천 지침:
- 학생들이 자신의 생각을 명확히 표현해야 하는 주제를 선정해주세요
- 상대방 의견을 경청하고 이해하는 것이 중요한 주제를 우선시해주세요
- 협상이나 타협이 가능한 여지가 있는 주제를 선택해주세요
- 다양한 표현 방식(설명, 설득, 질문 등)을 사용할 수 있는 주제를 추천해주세요`,

    '다양한 관점 이해하기': `
## 다양한 관점 이해하기에 특화된 주제 추천 지침:
- 서로 다른 입장이 명확히 존재하는 주제를 선정해주세요
- 문화적, 세대적, 사회적 차이가 반영될 수 있는 주제를 우선시해주세요
- 정답이 하나가 아닌, 여러 관점이 공존할 수 있는 주제를 선택해주세요
- 학생들이 "다른 사람은 어떻게 생각할까?"를 고민하게 하는 주제를 추천해주세요`,

    '민주적 의사결정 능력': `
## 민주적 의사결정 능력에 특화된 주제 추천 지침:
- 공동체의 규칙이나 결정과 관련된 주제를 선정해주세요
- 다수와 소수의 의견이 충돌할 수 있는 주제를 우선시해주세요
- 공정성과 절차의 중요성을 다룰 수 있는 주제를 선택해주세요
- 학생들이 "우리 모두에게 좋은 결정은 무엇일까?"를 고민하게 하는 주제를 추천해주세요`,

    '창의적 문제해결': `
## 창의적 문제해결에 특화된 주제 추천 지침:
- 기존의 방식에 대한 새로운 대안이 필요한 주제를 선정해주세요
- 혁신적이고 창의적인 아이디어를 요구하는 주제를 우선시해주세요
- "어떻게 하면 더 좋은 방법이 있을까?"를 고민하게 하는 주제를 선택해주세요
- 브레인스토밍과 아이디어 발산이 가능한 주제를 추천해주세요`
  }

  return topicGuidelines[purpose] || '선택된 토론 목적에 맞는 주제를 추천해주세요.'
}

// 오프라인 주제 생성 (백업)
function generateOfflineTopics(keyword: string) {
  console.log('📴 오프라인 모드: 내장 주제 생성')
  
  const templates: Record<string, any[]> = {
    '환경보호': [
      { 
        title: '일회용품 사용을 완전히 금지해야 한다', 
        description: '플라스틱 빨대, 컵 등 일회용품의 완전 금지에 대한 토론으로, 환경보호와 편의성 사이의 균형을 생각해볼 수 있습니다.',
        proView: '환경보호를 위해서는 불편함을 감수해야 합니다',
        conView: '완전히 금지하면 생활이 너무 불편해집니다'
      },
      { 
        title: '모든 학교에서 분리수거를 의무화해야 한다', 
        description: '학교 내 체계적인 분리수거 시스템 도입의 필요성에 대한 토론으로, 교육과 실천을 연결할 수 있습니다.',
        proView: '어릴 때부터 환경의식을 기르는 것이 중요합니다',
        conView: '학습에 집중하는 것이 더 우선되어야 합니다'
      },
      { 
        title: '자동차 대신 자전거 이용을 늘려야 한다', 
        description: '친환경 교통수단 활용을 통한 환경보호 방안으로, 개인의 선택과 사회적 책임을 고민해볼 수 있습니다.',
        proView: '건강도 지키고 환경도 보호하는 일석이조입니다',
        conView: '날씨나 거리 등 현실적인 제약이 너무 많습니다'
      }
    ],
    '인공지능': [
      { 
        title: 'AI가 사람의 일자리를 대체하는 것은 좋은 일이다', 
        description: '인공지능 기술 발전과 고용 시장의 변화에 대한 토론으로, 미래 사회의 변화를 예측해볼 수 있습니다.',
        proView: '사람은 더 창의적이고 의미있는 일에 집중할 수 있습니다',
        conView: '일자리를 잃은 사람들이 겪을 어려움이 더 큽니다'
      },
      { 
        title: '초등학생도 AI를 수업에서 사용해야 한다', 
        description: '교육 현장에서의 AI 도구 활용의 적절성에 대한 토론으로, 기술과 교육의 조화를 생각해볼 수 있습니다.',
        proView: '미래를 위해 AI 사용법을 일찍 배워야 합니다',
        conView: '기본 실력을 먼저 쌓는 것이 더 중요합니다'
      },
      { 
        title: 'AI 로봇이 반려동물을 대신할 수 있다', 
        description: '정서적 교감과 기술의 한계에 대한 토론으로, 진정한 관계의 의미를 탐구할 수 있습니다.',
        proView: '알레르기 걱정없이 안전하게 키울 수 있습니다',
        conView: '진짜 생명과의 교감을 대신할 수는 없습니다'
      }
    ],
    '스마트폰': [
      { 
        title: '초등학생의 스마트폰 사용을 금지해야 한다', 
        description: '어린이 스마트폰 사용의 장단점과 적절한 규제에 대한 토론으로, 디지털 시대의 교육 방향을 모색할 수 있습니다.',
        proView: '집중력과 사회성 발달을 위해 제한이 필요합니다',
        conView: '정보 접근과 소통을 위해 적절한 사용이 필요합니다'
      },
      { 
        title: '수업 시간에 스마트폰을 교육 도구로 활용해야 한다', 
        description: '디지털 기기의 교육적 활용 가능성에 대한 토론으로, 전통적 교육과 디지털 교육의 균형을 찾을 수 있습니다.',
        proView: '흥미롭고 효과적인 학습이 가능합니다',
        conView: '수업 집중도가 떨어지고 의존성이 생깁니다'
      },
      { 
        title: '스마트폰 사용 시간을 하루 1시간으로 제한해야 한다', 
        description: '건전한 디지털 습관 형성을 위한 시간 제한의 필요성에 대한 토론으로, 자기조절 능력을 기를 수 있습니다.',
        proView: '건강한 생활습관과 실제 체험을 위해 필요합니다',
        conView: '개인의 상황에 따라 유연하게 조절되어야 합니다'
      }
    ]
  }
  
  // 키워드에 맞는 템플릿 찾기
  for (const [key, topics] of Object.entries(templates)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      return topics
    }
  }
  
  // 일반적인 주제들
  return [
    { 
      title: `${keyword}에 대한 우리 학교의 새로운 규칙을 만들어야 한다`, 
      description: `${keyword}와 관련된 학교 규칙 제정의 필요성에 대한 토론입니다.`,
      proView: '명확한 규칙이 있어야 모두가 편안합니다',
      conView: '너무 많은 규칙은 자유를 제한합니다'
    },
    { 
      title: `${keyword} 교육을 의무화해야 한다`, 
      description: `${keyword} 관련 교육의 필요성과 의무화에 대한 토론입니다.`,
      proView: '모든 학생이 균등하게 배울 기회를 가져야 합니다',
      conView: '개인의 관심과 선택을 존중해야 합니다'
    },
    { 
      title: `${keyword}보다 다른 것이 더 중요하다`, 
      description: `${keyword}의 우선순위와 중요도에 대한 토론입니다.`,
      proView: '다양한 가치를 균형있게 고려해야 합니다',
      conView: `${keyword}가 현재 가장 시급한 문제입니다`
    }
  ]
}

// JSON 응답 파싱
function parseTopicResponse(response: string, keyword: string) {
  try {
    let jsonStr = response.trim()
    
    // 마크다운 코드 블록 제거
    if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
      if (match) {
        jsonStr = match[1]
      }
    }
    
    const topics = JSON.parse(jsonStr)
    
    if (Array.isArray(topics) && topics.length === 3) {
      console.log('✅ JSON 파싱 성공:', topics)
      return topics
    } else {
      throw new Error('잘못된 JSON 형식')
    }
  } catch (error) {
    console.error('JSON 파싱 실패:', error)
    console.log('원본 응답:', response)
    
    // 파싱 실패 시 오프라인 주제 사용
    return generateOfflineTopics(keyword)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, purpose } = await request.json()

    if (!keyword?.trim()) {
      return NextResponse.json(
        { error: '키워드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 목적별 특화 지침 생성
    let purposeInstruction = ''
    if (purpose?.trim()) {
      purposeInstruction = `\n선택된 토론 목적: "${purpose}"\n${getPurposeSpecificTopicGuidelines(purpose)}\n`
    }

    const prompt = `# 역할: 초등학교 학생들을 위한 토론 주제 추천 도우미
# 목표: 학생들의 학습 수준과 관심사에 적합한 토론 주제를 추천하되, 초등 토론 수업 모형의 '다름'과 '공존'에 초점을 맞춘 주제를 제안한다.

키워드: "${keyword}"${purposeInstruction}

# 지침:
- 반드시 정확히 3개의 토론 주제를 추천한다.
- 초등학생 수준에 적합한 토론 주제를 추천한다 (너무 어렵거나 전문적인 주제는 피한다).
- 학생들이 자신과 다른 의견을 가진 사람들의 입장도 이해할 수 있는 주제를 선정한다.
- 찬성/반대 입장이 분명하게 나뉠 수 있는 주제를 선정한다.
- 학생들의 일상생활이나 학교생활과 관련된 주제를 포함시킨다.
- 사회적, 윤리적 사고를 촉진하는 주제를 포함한다.
- 제안하는 각 주제에 대해 그 주제가 왜 좋은 토론 주제인지 간단히 설명한다.

JSON 형식으로 다음과 같이 응답해주세요:
[
  {
    "title": "토론 주제 1",
    "description": "이 주제가 좋은 토론 주제인 이유와 어떤 점을 생각해볼 수 있는지 간단한 설명",
    "proView": "찬성 측 관점을 한 문장으로 요약",
    "conView": "반대 측 관점을 한 문장으로 요약"
  }
]

JSON 형식만 출력하세요. 바깥에 Markdown이나 설명 텍스트를 추가하지 마세요.`

    try {
      const response = await callOpenAI(prompt)
      const topics = parseTopicResponse(response, keyword)
      
      return NextResponse.json({
        success: true,
        topics
      })
      
    } catch (error) {
      console.log('🔄 OpenAI 실패, 오프라인 모드 사용')
      const offlineTopics = generateOfflineTopics(keyword)
      
      return NextResponse.json({
        success: true,
        topics: offlineTopics,
        offline: true
      })
    }

  } catch (error) {
    console.error('주제 추천 API 오류:', error)
    return NextResponse.json(
      { error: '주제 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}