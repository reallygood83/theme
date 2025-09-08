import { NextRequest, NextResponse } from 'next/server'

interface ScenarioRequest {
  topic: string
  purpose: string
  grade: string
  timeLimit: number
  additionalInfo?: string
}

interface ScenarioResponse {
  success: boolean
  scenario?: {
    title: string
    topic: string
    purpose: string
    grade: string
    timeLimit: number
    background: string
    proArguments: string[]
    conArguments: string[]
    keyQuestions: string[]
    expectedOutcomes: string[]
    materials: string[]
    teacherTips: string
    keywords: string[]
    subject: string[]
    // 레거시 호환성을 위한 추가 필드들
    overview?: string
    objectives?: string[]
    preparation?: {
      materials: string[]
      setup: string
      roles: string[]
    }
    process?: {
      step: number
      name: string
      duration: number
      description: string
      activities: string[]
    }[]
    evaluation?: {
      criteria: string[]
      methods: string[]
      rubric: {
        excellent: string
        good: string
        needs_improvement: string
      }
    }
    extensions?: string[]
    references?: string[]
  }
  error?: string
  isOffline?: boolean
  fallbackReason?: string
}

// GPT-4o API 호출 함수 (참고 구현체 기반 고품질 버전)
async function callOpenAI(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 4000,
      messages: [{
        role: 'system',
        content: `당신은 초등학교 토론 교육 전문가이며, 한국의 초등토론교육모형을 바탕으로 체계적이고 완성도 높은 토론 시나리오를 설계하는 AI입니다.

🎯 **핵심 역할**:
- 초등학생(1-6학년)의 발달 단계에 맞는 토론 주제와 시나리오 설계
- 교육목적별 맞춤형 학습 활동과 평가 방안 제시
- 교사가 바로 활용할 수 있는 구체적이고 실용적인 가이드라인 제공

📚 **교육목적별 전문성**:
- **비판적 사고력**: 논리적 분석, 증거 기반 추론, 비판적 평가 능력 개발
- **의사소통 능력**: 명확한 표현, 효과적 경청, 건설적 대화 기술 향상  
- **다양한 관점 이해**: 관점 다양성, 공감 능력, 포용적 사고 개발
- **민주적 의사결정**: 합의 형성, 협력적 문제해결, 민주적 절차 체험
- **창의적 문제해결**: 혁신적 아이디어 창출, 대안적 사고, 창의적 접근

⚖️ **토론 시나리오 품질 기준**:
1. 찬성/반대 각 3개씩의 구체적이고 논리적인 논거 제시
2. 초등학생이 이해하기 쉬운 용어와 사례 활용
3. 실생활과 연관된 친근하고 흥미로운 주제 선정
4. 학년별 인지 발달 수준에 적합한 복잡도 조절
5. 교사 지도를 위한 구체적이고 실용적인 팁 제공

**반드시 완전한 JSON 형식으로만 응답하세요. 마크다운이나 추가 설명 없이 순수 JSON만 출력하세요.**`
      }, {
        role: 'user', 
        content: prompt
      }]
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 교육 목적별 가이드라인 생성
function getPurposeSpecificGuidelines(purpose: string) {
  const guidelines = {
    '비판적 사고력': {
      focus: '논리적 분석과 증거 기반 추론',
      activities: ['자료 분석', '논리적 오류 찾기', '근거 제시', '반박 연습'],
      evaluation: ['논증의 논리성', '증거의 적절성', '결론의 타당성']
    },
    '의사소통 능력': {
      focus: '효과적인 의사 표현과 경청',
      activities: ['명확한 주장 표현', '질문 기법', '요약 연습', '비언어적 소통'],
      evaluation: ['발표 명료성', '경청 자세', '상호작용 질']
    },
    '다양한 관점 이해': {
      focus: '다각적 사고와 공감 능력',
      activities: ['역할 교체', '관점 분석', '문화적 차이 탐구', '상황별 입장 변화'],
      evaluation: ['관점의 다양성', '공감 능력', '유연한 사고']
    },
    '민주적 의사결정': {
      focus: '합의 형성과 협력적 해결',
      activities: ['투표와 토의', '타협점 찾기', '규칙 만들기', '갈등 조정'],
      evaluation: ['참여도', '협력성', '합의 도출 능력']
    },
    '창의적 문제해결': {
      focus: '혁신적 아이디어와 실행력',
      activities: ['브레인스토밍', '아이디어 결합', '시나리오 창작', '대안 모색'],
      evaluation: ['창의성', '독창성', '실용성']
    }
  }
  
  return guidelines[purpose as keyof typeof guidelines] || guidelines['비판적 사고력']
}

// 시나리오 생성 프롬프트 생성 (참고 구현체 기반 고품질 버전)
function generateScenarioPrompt(topic: string, purpose: string, grade: string, timeLimit: number, additionalInfo?: string) {
  const guidelines = getPurposeSpecificGuidelines(purpose)
  
  return `초등학교 ${grade}학년을 위한 고품질 토론 시나리오를 생성해주세요.

**📋 기본 정보:**
- 토론 주제: "${topic}"
- 교육 목적: ${purpose}
- 대상 학년: ${grade}학년  
- 수업 시간: ${timeLimit}분
${additionalInfo ? `- 추가 고려사항: ${additionalInfo}` : ''}

**🎯 교육목적별 특화 가이드라인:**
- 중점 영역: ${guidelines.focus}
- 핵심 활동: ${guidelines.activities.join(', ')}
- 평가 요소: ${guidelines.evaluation.join(', ')}

**반드시 다음 JSON 형식으로만 응답해주세요:**
{
  "title": "토론 시나리오의 제목",
  "topic": "${topic}",
  "purpose": "${purpose}",
  "grade": "${grade}",
  "timeLimit": ${timeLimit},
  "background": "토론 주제에 대한 배경 설명 (2-3문단)",
  "proArguments": [
    "찬성 논거 1 - 구체적이고 초등학생이 이해할 수 있는 내용",
    "찬성 논거 2 - 실생활과 연관된 근거", 
    "찬성 논거 3 - 미래나 장기적 관점의 근거"
  ],
  "conArguments": [
    "반대 논거 1 - 구체적이고 초등학생이 이해할 수 있는 내용",
    "반대 논거 2 - 실생활과 연관된 근거",
    "반대 논거 3 - 현실적 어려움이나 단점"
  ],
  "keyQuestions": [
    "토론을 깊이 있게 진행할 핵심 질문 1",
    "토론을 깊이 있게 진행할 핵심 질문 2",
    "토론을 깊이 있게 진행할 핵심 질문 3"
  ],
  "expectedOutcomes": [
    "이 토론을 통해 기대되는 학습 효과 1",
    "이 토론을 통해 기대되는 학습 효과 2",
    "이 토론을 통해 기대되는 학습 효과 3"
  ],
  "materials": [
    "토론 진행에 필요한 자료나 준비물 1",
    "토론 진행에 필요한 자료나 준비물 2",
    "토론 진행에 필요한 자료나 준비물 3"
  ],
  "teacherTips": "교사가 토론을 효과적으로 진행하기 위한 구체적이고 실용적인 지도 팁 (3-4문단)",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "subject": ["관련 교과 1", "관련 교과 2"]
}

**⚖️ 토론 논거 요구사항:**
- 찬성 논거 3개: 각각 구체적이고 초등학생이 이해할 수 있는 실생활 사례 포함
- 반대 논거 3개: 각각 논리적이고 현실적인 어려움이나 단점을 명확히 제시
- 모든 논거는 ${grade}학년 수준에 맞는 어휘와 개념으로 구성

**🏫 초등토론교육모형 적용:**
1. 도입 단계: 흥미 유발과 배경지식 활성화
2. 전개 단계: 체계적 토론 진행과 논거 교환  
3. 정리 단계: 합의점 도출과 성찰 활동`
}

// 고품질 오프라인 시나리오 템플릿 (참고 구현체 기반)
function getOfflineScenarioTemplate(topic: string, purpose: string, grade: string, timeLimit: number) {
  const guidelines = getPurposeSpecificGuidelines(purpose)
  
  return {
    title: `${topic} 토론 시나리오`,
    topic,
    purpose,
    grade: `${grade}학년`,
    timeLimit,
    background: `'${topic}' 주제는 초등학생들의 일상생활과 밀접한 관련이 있으며, 다양한 관점에서 생각해볼 수 있는 흥미로운 토론 주제입니다. 이 토론을 통해 학생들은 ${purpose} 능력을 기르고, 서로의 의견을 존중하며 민주적 토론 문화를 경험할 수 있습니다.`,
    proArguments: [
      `${topic}의 긍정적인 측면과 우리에게 도움이 되는 점들을 생각해보세요`,
      `${topic}이 가져다주는 편리함이나 즐거움에 대해 이야기해보세요`, 
      `${topic}이 미래에 우리 생활을 더 좋게 만들 수 있는 방법을 생각해보세요`
    ],
    conArguments: [
      `${topic}으로 인해 생길 수 있는 문제점이나 어려움을 생각해보세요`,
      `${topic}의 부작용이나 우려되는 점들에 대해 이야기해보세요`,
      `${topic} 대신 다른 방법이 더 좋을 수 있는 이유를 생각해보세요`
    ],
    keyQuestions: [
      `${topic}에 대해 여러분은 어떻게 생각하나요?`,
      `${topic}의 좋은 점과 나쁜 점을 비교해보면 어떨까요?`,
      `${topic}에 대한 우리의 최종 결론은 무엇일까요?`
    ],
    expectedOutcomes: [
      `${purpose} 능력 향상을 통한 논리적 사고력 개발`,
      `다양한 관점을 이해하고 존중하는 태도 함양`,
      `자신의 의견을 명확하게 표현하는 의사소통 능력 향상`
    ],
    materials: [
      '토론 주제 관련 참고 자료',
      '찬성/반대 입장 정리 활동지', 
      '토론 평가 체크리스트',
      '타이머 및 토론 진행 도구'
    ],
    teacherTips: `${topic} 토론을 지도할 때는 모든 학생이 참여할 수 있도록 격려하고, 찬성과 반대 의견이 균형 있게 제시될 수 있도록 도와주세요. 학생들이 감정적으로 대립하지 않도록 토론 예절을 강조하고, 서로의 의견을 경청하는 분위기를 만드는 것이 중요합니다.`,
    keywords: [topic.split(' ').slice(0, 3)].flat().filter(k => k.length > 0),
    subject: ['국어', '사회', '도덕'].slice(0, 2)
  }
}

// JSON 응답 파싱 및 검증 (참고 구현체 기반 강화 버전)
function parseScenarioResponse(response: string, topic: string, purpose: string, grade: string, timeLimit: number) {
  try {
    console.log('🔍 JSON 파싱 시작:', response.substring(0, 200) + '...');
    
    // 다양한 JSON 형식 추출 시도
    let jsonData: any = null;
    
    // 1차: 순수 JSON 객체 확인
    if (response.trim().startsWith('{')) {
      jsonData = JSON.parse(response.trim());
    } 
    // 2차: 마크다운 코드 블록에서 JSON 추출
    else {
      const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonData = JSON.parse(codeBlockMatch[1]);
      } else {
        // 3차: 첫 번째와 마지막 중괄호 사이의 내용 추출
        const startIndex = response.indexOf('{');
        const endIndex = response.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonStr = response.substring(startIndex, endIndex + 1);
          jsonData = JSON.parse(jsonStr);
        }
      }
    }

    if (!jsonData) {
      throw new Error('JSON 데이터를 찾을 수 없습니다');
    }
    
    console.log('✅ JSON 파싱 성공:', Object.keys(jsonData));
    
    // 참고 구현체 형식에 맞는 필수 필드 검증
    const requiredFields = ['title', 'topic', 'background', 'proArguments', 'conArguments'];
    const missingFields = requiredFields.filter(field => !jsonData[field]);
    
    if (missingFields.length > 0) {
      console.warn(`필수 필드 누락: ${missingFields.join(', ')}. 오프라인 템플릿 사용`);
      return getOfflineScenarioTemplate(topic, purpose, grade, timeLimit);
    }

    // 배열 필드 검증 및 기본값 설정
    const arrayFields = ['proArguments', 'conArguments', 'keyQuestions', 'expectedOutcomes', 'materials', 'keywords', 'subject'];
    arrayFields.forEach(field => {
      if (!Array.isArray(jsonData[field])) {
        jsonData[field] = [];
      }
    });

    // 찬성/반대 논거가 3개씩 있는지 확인
    if (jsonData.proArguments.length < 3) {
      console.warn('찬성 논거가 3개 미만입니다');
    }
    if (jsonData.conArguments.length < 3) {
      console.warn('반대 논거가 3개 미만입니다');
    }
    
    console.log('✅ 시나리오 데이터 검증 완료');
    return jsonData;
    
  } catch (error) {
    console.error('❌ JSON 파싱 실패:', error);
    console.log('🔄 오프라인 템플릿으로 전환');
    return getOfflineScenarioTemplate(topic, purpose, grade, timeLimit);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { topic, purpose, grade, timeLimit, additionalInfo }: ScenarioRequest = await request.json()
    
    console.log('🎯 시나리오 생성 요청:', { topic, purpose, grade, timeLimit })
    
    // 입력 검증
    if (!topic?.trim()) {
      return NextResponse.json(
        { error: '토론 주제를 입력해주세요.' },
        { status: 400 }
      )
    }
    
    if (!purpose) {
      return NextResponse.json(
        { error: '교육 목적을 선택해주세요.' },
        { status: 400 }
      )
    }
    
    if (!grade) {
      return NextResponse.json(
        { error: '대상 학년을 선택해주세요.' },
        { status: 400 }
      )
    }
    
    if (!timeLimit || timeLimit < 20 || timeLimit > 200) {
      return NextResponse.json(
        { error: '수업 시간은 20분에서 200분 사이로 설정해주세요.' },
        { status: 400 }
      )
    }

    // OpenAI API 사용 가능 여부 확인
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API 키가 설정되지 않았습니다. 오프라인 모드로 동작합니다.')
      const offlineScenario = getOfflineScenarioTemplate(topic, purpose, grade, timeLimit)
      
      return NextResponse.json({
        success: true,
        scenario: offlineScenario,
        isOffline: true
      })
    }
    
    // AI를 통한 시나리오 생성 시도
    try {
      const prompt = generateScenarioPrompt(topic, purpose, grade, timeLimit, additionalInfo)
      console.log('📝 생성된 프롬프트 (요약):', prompt.substring(0, 200) + '...')
      
      console.log('🤖 OpenAI API 호출 시작...')
      const response = await callOpenAI(prompt)
      console.log('✅ OpenAI API 응답 받음')
      
      const scenario = parseScenarioResponse(response, topic, purpose, grade, timeLimit)
      
      console.log('🎉 시나리오 생성 완료!')
      
      return NextResponse.json({
        success: true,
        scenario,
        isOffline: false
      })
      
    } catch (apiError) {
      console.error('❌ OpenAI API 호출 실패:', apiError)
      console.log('🔄 오프라인 모드로 전환...')
      
      const offlineScenario = getOfflineScenarioTemplate(topic, purpose, grade, timeLimit)
      
      return NextResponse.json({
        success: true,
        scenario: offlineScenario,
        isOffline: true,
        fallbackReason: 'API 호출 실패'
      })
    }
    
  } catch (error) {
    console.error('❌ 시나리오 생성 중 오류 발생:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: '시나리오 생성 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// GET 요청으로 API 상태 확인
export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    status: 'active',
    features: {
      ai_generation: hasOpenAIKey ? 'available' : 'offline_only',
      offline_templates: 'available'
    },
    purposes: ['비판적 사고력', '의사소통 능력', '다양한 관점 이해', '민주적 의사결정', '창의적 문제해결'],
    grades: ['1', '2', '3', '4', '5', '6'],
    timeLimits: {
      min: 20,
      max: 200,
      recommended: [40, 60, 80, 100]
    },
    timestamp: new Date()
  })
}