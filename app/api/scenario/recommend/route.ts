import { NextRequest, NextResponse } from 'next/server'
import { generateUpstageContent } from '@/lib/upstage'

const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2500
}

async function callAI(prompt: string) {
  console.log('🚀 AI 주제 추천 호출 시작...')
  
  // OpenAI API 시도
  if (OPENAI_CONFIG.apiKey && !process.env.UPSTAGE_API_KEY?.trim()) {
    try {
      return await callOpenAI(prompt)
    } catch (error) {
      console.log('OpenAI fallback 실패:', error)
    }
  }
  
  if (process.env.UPSTAGE_API_KEY?.trim()) {
    try {
      return await generateUpstageContent(prompt, OPENAI_CONFIG.maxTokens)
    } catch (error) {
      console.log('Upstage도 실패:', error)
      if (OPENAI_CONFIG.apiKey) {
        try {
          return await callOpenAI(prompt)
        } catch (fallbackError) {
          console.log('OpenAI fallback도 실패:', fallbackError)
        }
      }
    }
  }
  
  throw new Error('사용 가능한 AI API가 없습니다')
}

// OpenAI API 호출 함수
async function callOpenAI(prompt: string) {
  console.log('🚀 OpenAI API 호출...')
  
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
  
  const templates: Record<string, Array<{topic: string, description: string, pros: string[], cons: string[], difficulty: string, timeEstimate: number}>> = {
    '환경보호': [
      { 
        topic: '일회용품 사용을 완전히 금지해야 한다', 
        description: '플라스틱 빨대, 컵 등 일회용품의 완전 금지에 대한 토론으로, 환경보호와 편의성 사이의 균형을 생각해볼 수 있습니다.',
        pros: [
          '플라스틱 쓰레기가 줄어들어 바다 동물들이 안전해집니다',
          '재활용품을 사용하면서 환경보호 습관을 기를 수 있습니다',
          '지구온난화를 늦추는데 도움이 됩니다'
        ],
        cons: [
          '갑자기 모든 일회용품을 금지하면 생활이 너무 불편해집니다',
          '재활용품이 더 비싸서 가격 부담이 커집니다',
          '응급상황에서는 일회용품이 꼭 필요할 때가 있습니다'
        ],
        difficulty: '보통',
        timeEstimate: 40
      },
      { 
        topic: '모든 학교에서 분리수거를 의무화해야 한다', 
        description: '학교 내 체계적인 분리수거 시스템 도입의 필요성에 대한 토론으로, 교육과 실천을 연결할 수 있습니다.',
        pros: [
          '어릴 때부터 환경의식을 기르는 것이 중요합니다',
          '학교에서 배운 것을 집에서도 실천할 수 있습니다',
          '지구를 보호하는 작은 실천이 큰 변화를 만듭니다'
        ],
        cons: [
          '학습에 집중하는 것이 더 우선되어야 합니다',
          '분리수거 관리로 선생님들의 업무가 늘어납니다',
          '학생들이 복잡한 분리수거 방법을 제대로 따르기 어렵습니다'
        ],
        difficulty: '쉬움',
        timeEstimate: 40
      },
      { 
        topic: '자동차 대신 자전거 이용을 늘려야 한다', 
        description: '친환경 교통수단 활용을 통한 환경보호 방안으로, 개인의 선택과 사회적 책임을 고민해볼 수 있습니다.',
        pros: [
          '건강도 지키고 환경도 보호하는 일석이조입니다',
          '자전거를 타면 운동도 되고 돈도 절약됩니다',
          '교통 체증이 줄어들어 모두에게 좋습니다'
        ],
        cons: [
          '날씨나 거리 등 현실적인 제약이 너무 많습니다',
          '자전거 도로가 부족해서 위험할 수 있습니다',
          '무거운 짐을 들고 자전거를 타기는 힘듭니다'
        ],
        difficulty: '보통',
        timeEstimate: 40
      }
    ],
    '인공지능': [
      { 
        topic: 'AI가 사람의 일자리를 대체하는 것은 좋은 일이다', 
        description: '인공지능 기술 발전과 고용 시장의 변화에 대한 토론으로, 미래 사회의 변화를 예측해볼 수 있습니다.',
        pros: [
          '사람은 더 창의적이고 의미있는 일에 집중할 수 있습니다',
          'AI가 위험하고 힘든 일을 대신해서 사람이 더 안전해집니다',
          '반복적인 업무에서 해방되어 새로운 기술을 배울 수 있습니다'
        ],
        cons: [
          '일자리를 잃은 사람들이 겪을 어려움이 더 큽니다',
          'AI가 할 수 없는 일을 하기 위해 새로운 기술을 배우기 어렵습니다',
          '경제적 불평등이 더 심해질 수 있습니다'
        ],
        difficulty: '어려움',
        timeEstimate: 50
      },
      { 
        topic: '초등학생도 AI를 수업에서 사용해야 한다', 
        description: '교육 현장에서의 AI 도구 활용의 적절성에 대한 토론으로, 기술과 교육의 조화를 생각해볼 수 있습니다.',
        pros: [
          '미래를 위해 AI 사용법을 일찍 배워야 합니다',
          'AI가 개인별 맞춤 학습을 도와줄 수 있습니다',
          '복잡한 문제도 AI와 함께 해결할 수 있습니다'
        ],
        cons: [
          '기본 실력을 먼저 쌓는 것이 더 중요합니다',
          'AI에 의존하면 스스로 생각하는 능력이 약해집니다',
          '모든 학생이 AI 도구를 사용할 환경이 갖춰져 있지 않습니다'
        ],
        difficulty: '보통',
        timeEstimate: 40
      },
      { 
        topic: 'AI 로봇이 반려동물을 대신할 수 있다', 
        description: '정서적 교감과 기술의 한계에 대한 토론으로, 진정한 관계의 의미를 탐구할 수 있습니다.',
        pros: [
          '알레르기 걱정없이 안전하게 키울 수 있습니다',
          '24시간 언제든지 함께 있을 수 있어서 외롭지 않습니다',
          '먹이나 치료비 등 관리 비용이 들지 않습니다'
        ],
        cons: [
          '진짜 생명과의 교감을 대신할 수는 없습니다',
          '생명을 소중히 여기는 마음을 기를 수 없습니다',
          'AI 로봇은 예상치 못한 재미있는 행동을 하지 않습니다'
        ],
        difficulty: '보통',
        timeEstimate: 40
      }
    ],
    '스마트폰': [
      { 
        topic: '초등학생의 스마트폰 사용을 금지해야 한다', 
        description: '어린이 스마트폰 사용의 장단점과 적절한 규제에 대한 토론으로, 디지털 시대의 교육 방향을 모색할 수 있습니다.',
        pros: [
          '집중력과 사회성 발달을 위해 제한이 필요합니다',
          '친구들과 직접 만나서 놀면서 더 깊은 우정을 쌓을 수 있습니다',
          '스마트폰 중독이나 게임 중독을 예방할 수 있습니다'
        ],
        cons: [
          '정보 접근과 소통을 위해 적절한 사용이 필요합니다',
          '부모님과 연락하거나 응급상황에서 꼭 필요합니다',
          '디지털 시대에 뒤처지지 않기 위해 사용법을 배워야 합니다'
        ],
        difficulty: '쉬움',
        timeEstimate: 40
      },
      { 
        topic: '수업 시간에 스마트폰을 교육 도구로 활용해야 한다', 
        description: '디지털 기기의 교육적 활용 가능성에 대한 토론으로, 전통적 교육과 디지털 교육의 균형을 찾을 수 있습니다.',
        pros: [
          '흥미롭고 효과적인 학습이 가능합니다',
          '실시간으로 궁금한 것을 찾아보며 깊이 있게 배울 수 있습니다',
          '동영상이나 사진으로 더 쉽게 이해할 수 있습니다'
        ],
        cons: [
          '수업 집중도가 떨어지고 의존성이 생깁니다',
          '게임이나 SNS에 더 관심을 갖게 될 수 있습니다',
          '손으로 직접 쓰고 그리며 배우는 것이 더 중요합니다'
        ],
        difficulty: '보통',
        timeEstimate: 40
      },
      { 
        topic: '스마트폰 사용 시간을 하루 1시간으로 제한해야 한다', 
        description: '건전한 디지털 습관 형성을 위한 시간 제한의 필요성에 대한 토론으로, 자기조절 능력을 기를 수 있습니다.',
        pros: [
          '건강한 생활습관과 실제 체험을 위해 필요합니다',
          '공부나 운동, 독서 등 다른 중요한 일에 더 많은 시간을 쓸 수 있습니다',
          '눈 건강과 바른 자세를 지킬 수 있습니다'
        ],
        cons: [
          '개인의 상황에 따라 유연하게 조절되어야 합니다',
          '학습이나 창작 활동에 필요한 시간까지 제한될 수 있습니다',
          '친구들과 소통하거나 가족과 연락하는 시간이 부족해집니다'
        ],
        difficulty: '보통',
        timeEstimate: 40
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
      topic: `${keyword}에 대한 우리 학교의 새로운 규칙을 만들어야 한다`, 
      description: `${keyword}와 관련된 학교 규칙 제정의 필요성에 대한 토론으로, 규칙과 자유의 균형을 생각해볼 수 있습니다.`,
      pros: [
        '명확한 규칙이 있으면 모두가 편안하고 안전하게 생활할 수 있습니다',
        '공정하고 질서있는 학교 생활을 만들 수 있습니다',
        '갈등이나 문제상황을 미리 예방할 수 있습니다'
      ],
      cons: [
        '너무 많은 규칙은 학생들의 자유로운 활동을 제한합니다',
        '상황에 따라 유연하게 판단해야 할 때도 있습니다',
        '규칙을 지키기 위한 관리 부담이 늘어납니다'
      ],
      difficulty: '쉬움',
      timeEstimate: 40
    },
    { 
      topic: `${keyword} 교육을 의무화해야 한다`, 
      description: `${keyword} 관련 교육의 필요성과 의무화에 대한 토론으로, 교육의 평등성과 선택권을 고민해볼 수 있습니다.`,
      pros: [
        '모든 학생이 균등하게 배울 기회를 가져야 합니다',
        '미래 사회를 위해 필수적인 지식과 능력을 기를 수 있습니다',
        '체계적이고 전문적인 교육을 받을 수 있습니다'
      ],
      cons: [
        '학생들의 개인적인 관심과 선택권을 존중해야 합니다',
        '획일적인 교육보다는 다양성이 더 중요합니다',
        '의무교육으로 인한 부담과 스트레스가 생길 수 있습니다'
      ],
      difficulty: '보통',
      timeEstimate: 40
    },
    { 
      topic: `${keyword}보다 다른 것이 더 중요하다`, 
      description: `${keyword}의 우선순위와 중요도에 대한 토론으로, 가치의 우선순위를 판단하는 능력을 기를 수 있습니다.`,
      pros: [
        '다양한 가치를 균형있게 고려하는 것이 중요합니다',
        '한 가지만 중요하게 생각하면 다른 것들을 놓칠 수 있습니다',
        '상황에 따라 우선순위는 달라질 수 있습니다'
      ],
      cons: [
        `${keyword}가 현재 가장 시급하고 중요한 문제입니다`,
        '우선순위를 명확히 해야 효과적으로 해결할 수 있습니다',
        '여러 가지를 동시에 하면 집중력이 분산됩니다'
      ],
      difficulty: '어려움',
      timeEstimate: 50
    }
  ]
}

// JSON 응답 파싱
function parseTopicResponse(response: string, keyword: string) {
  console.log('🔍 AI 응답 파싱 시작:', response.substring(0, 200) + '...')
  
  try {
    // 응답에서 JSON 부분만 추출 (마크다운 코드 블록 제거)
    let cleanResponse = response.trim()
    if (cleanResponse.includes('```json')) {
      const jsonStart = cleanResponse.indexOf('```json') + 7
      const jsonEnd = cleanResponse.indexOf('```', jsonStart)
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd).trim()
    } else if (cleanResponse.includes('```')) {
      const jsonStart = cleanResponse.indexOf('```') + 3
      const jsonEnd = cleanResponse.indexOf('```', jsonStart)
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd).trim()
    }
    
    console.log('🧹 정제된 응답:', cleanResponse.substring(0, 100) + '...')
    
    // JSON 형태로 파싱 시도
    const parsed = JSON.parse(cleanResponse)
    console.log('✅ JSON 파싱 성공:', parsed)
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      const topics = parsed.map((topic, index) => {
        // 새로운 형식 (topic, pros[], cons[]) 또는 기존 형식 (title, proView, conView) 모두 지원
        const topicTitle = topic.topic || topic.title || `${keyword} 관련 토론 주제 ${index + 1}`
        const description = topic.description || '토론 주제에 대한 설명입니다.'
        
        // 찬성 논거 처리 - 배열이면 그대로, 문자열이면 배열로 변환
        let pros = []
        if (Array.isArray(topic.pros)) {
          pros = topic.pros
        } else if (topic.proView) {
          pros = [topic.proView]
        } else {
          pros = ['찬성 의견']
        }
        
        // 반대 논거 처리 - 배열이면 그대로, 문자열이면 배열로 변환
        let cons = []
        if (Array.isArray(topic.cons)) {
          cons = topic.cons
        } else if (topic.conView) {
          cons = [topic.conView]
        } else {
          cons = ['반대 의견']
        }
        
        return {
          topic: topicTitle,
          description: description,
          pros: pros,
          cons: cons,
          difficulty: topic.difficulty || '보통',
          timeEstimate: topic.timeEstimate || 40
        }
      })
      
      console.log(`🎯 ${topics.length}개의 주제 파싱 완료`)
      console.log('📋 각 주제별 논거 개수:', topics.map(t => ({ 
        topic: t.topic.substring(0, 20) + '...', 
        pros: t.pros.length, 
        cons: t.cons.length 
      })))
      
      return topics
    } else {
      console.warn('⚠️ 파싱된 데이터가 배열이 아니거나 비어있음:', parsed)
      throw new Error('응답 데이터 형식이 올바르지 않습니다')
    }
  } catch (error) {
    console.error('❌ JSON 파싱 실패:', error)
    console.log('🔄 오프라인 모드로 전환')
    
    // 파싱 실패 시 오프라인 주제 사용
    return generateOfflineTopics(keyword)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, purpose, grade } = await request.json()

    // 입력 검증 강화
    if (!keyword?.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: '키워드를 입력해주세요.',
          details: 'keyword 필드가 비어있거나 공백만 포함되어 있습니다.'
        },
        { status: 400 }
      )
    }

    if (!purpose?.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: '교육 목적을 선택해주세요.',
          details: 'purpose 필드가 비어있거나 공백만 포함되어 있습니다.'
        },
        { status: 400 }
      )
    }

    if (!grade?.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: '대상 학년을 선택해주세요.',
          details: 'grade 필드가 비어있거나 공백만 포함되어 있습니다.'
        },
        { status: 400 }
      )
    }

    console.log('📝 주제 추천 요청:', { keyword: keyword.trim(), purpose: purpose.trim(), grade: grade.trim() })

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
- **중요**: 찬성 논거(pros)와 반대 논거(cons)를 각각 3개씩 구체적으로 제시한다.

JSON 형식으로 다음과 같이 응답해주세요:
[
  {
    "topic": "토론 주제 1",
    "description": "이 주제가 좋은 토론 주제인 이유와 어떤 점을 생각해볼 수 있는지 간단한 설명",
    "pros": [
      "찬성 논거 1 - 구체적이고 초등학생이 이해할 수 있는 내용",
      "찬성 논거 2 - 실생활과 연관된 근거",
      "찬성 논거 3 - 미래나 장기적 관점의 근거"
    ],
    "cons": [
      "반대 논거 1 - 구체적이고 초등학생이 이해할 수 있는 내용",
      "반대 논거 2 - 실생활과 연관된 근거",
      "반대 논거 3 - 현실적 어려움이나 단점"
    ],
    "difficulty": "쉬움|보통|어려움",
    "timeEstimate": 40
  }
]

JSON 형식만 출력하세요. 바깥에 Markdown이나 설명 텍스트를 추가하지 마세요.`

    try {
      console.log('🤖 AI API 호출 시작...')
      const response = await callAI(prompt)
      console.log('📥 AI 응답 수신 완료')
      
      const topics = parseTopicResponse(response, keyword.trim())
      
      // 응답 데이터 검증
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        console.warn('⚠️ AI가 유효한 주제를 생성하지 못함, 오프라인 모드로 전환')
        throw new Error('AI 응답에서 유효한 주제를 찾을 수 없습니다')
      }
      
      console.log(`✅ ${topics.length}개의 주제 생성 성공`)
      return NextResponse.json({
        success: true,
        topics,
        isOffline: false,
        metadata: {
          keyword: keyword.trim(),
          purpose: purpose.trim(),
          grade: grade.trim(),
          generatedAt: new Date().toISOString()
        }
      })
      
    } catch (error) {
      console.log('🔄 AI API 실패, 오프라인 모드로 전환:', error instanceof Error ? error.message : error)
      
      try {
        const offlineTopics = generateOfflineTopics(keyword.trim())
        
        if (!offlineTopics || offlineTopics.length === 0) {
          throw new Error('오프라인 주제 생성도 실패했습니다')
        }
        
        console.log(`📴 오프라인 모드: ${offlineTopics.length}개의 주제 제공`)
        return NextResponse.json({
          success: true,
          topics: offlineTopics,
          isOffline: true,
          fallbackReason: error instanceof Error ? error.message : 'AI API 호출 실패',
          metadata: {
            keyword: keyword.trim(),
            purpose: purpose.trim(),
            grade: grade.trim(),
            generatedAt: new Date().toISOString()
          }
        })
      } catch (offlineError) {
        console.error('❌ 오프라인 모드도 실패:', offlineError)
        throw new Error('주제 생성에 완전히 실패했습니다')
      }
    }

  } catch (error) {
    console.error('주제 추천 API 오류:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '토론 주제 추천에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}
