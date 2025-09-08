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
    topic: string
    purpose: string
    grade: string
    timeLimit: number
    overview: string
    objectives: string[]
    preparation: {
      materials: string[]
      setup: string
      roles: string[]
    }
    process: {
      step: number
      name: string
      duration: number
      description: string
      activities: string[]
    }[]
    evaluation: {
      criteria: string[]
      methods: string[]
      rubric: {
        excellent: string
        good: string
        needs_improvement: string
      }
    }
    extensions: string[]
    references: string[]
  }
  error?: string
}

// OpenAI API 호출 함수
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
      max_tokens: 3000,
      messages: [{
        role: 'system',
        content: `당신은 초등학교 토론 교육 전문가입니다. 학생들의 발달 단계에 맞는 체계적인 토론 시나리오를 설계해주세요.
        
다음 교육 목적별 특성을 반영해야 합니다:
- 비판적 사고력: 정보를 분석하고 논리적 추론 능력 향상
- 의사소통 능력: 효과적인 표현과 경청 기술 개발
- 다양한 관점 이해: 다른 시각에서 문제를 바라보는 능력
- 민주적 의사결정: 합의 형성과 협력적 문제 해결
- 창의적 문제해결: 혁신적 아이디어 도출과 적용

반드시 JSON 형식으로 응답하세요.`
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

// 시나리오 생성 프롬프트 생성
function generateScenarioPrompt(topic: string, purpose: string, grade: string, timeLimit: number, additionalInfo?: string) {
  const guidelines = getPurposeSpecificGuidelines(purpose)
  
  return `초등학교 ${grade}학년을 위한 토론 시나리오를 생성해주세요.

**기본 정보:**
- 토론 주제: "${topic}"
- 교육 목적: ${purpose}
- 대상 학년: ${grade}학년
- 수업 시간: ${timeLimit}분
${additionalInfo ? `- 추가 고려사항: ${additionalInfo}` : ''}

**교육 목적별 가이드라인:**
- 중점 영역: ${guidelines.focus}
- 주요 활동: ${guidelines.activities.join(', ')}
- 평가 요소: ${guidelines.evaluation.join(', ')}

다음 JSON 형식으로 상세한 토론 시나리오를 작성해주세요:

{
  "topic": "토론 주제",
  "purpose": "교육 목적",
  "grade": "학년",
  "timeLimit": 수업시간(분),
  "overview": "시나리오 개요 (2-3문장)",
  "objectives": ["학습 목표 1", "학습 목표 2", "학습 목표 3"],
  "preparation": {
    "materials": ["준비물 1", "준비물 2"],
    "setup": "교실 배치 및 환경 설정",
    "roles": ["역할 1", "역할 2"]
  },
  "process": [
    {
      "step": 1,
      "name": "단계명",
      "duration": 분,
      "description": "단계 설명",
      "activities": ["활동 1", "활동 2"]
    }
  ],
  "evaluation": {
    "criteria": ["평가 기준 1", "평가 기준 2"],
    "methods": ["평가 방법 1", "평가 방법 2"],
    "rubric": {
      "excellent": "우수 기준",
      "good": "보통 기준", 
      "needs_improvement": "개선 필요 기준"
    }
  },
  "extensions": ["심화 활동 1", "심화 활동 2"],
  "references": ["참고 자료 1", "참고 자료 2"]
}`
}

// 오프라인 시나리오 템플릿
function getOfflineScenarioTemplate(topic: string, purpose: string, grade: string, timeLimit: number) {
  const guidelines = getPurposeSpecificGuidelines(purpose)
  
  return {
    topic,
    purpose,
    grade,
    timeLimit,
    overview: `'${topic}'에 대한 ${purpose} 중심의 토론 활동입니다. 학생들이 다양한 관점에서 주제를 탐구하고 토론을 통해 깊이 있는 사고력을 기를 수 있도록 설계되었습니다.`,
    objectives: [
      `${topic}에 대한 기본 지식을 습득한다`,
      `다양한 관점에서 ${topic}를 분석할 수 있다`,
      `자신의 의견을 논리적으로 표현할 수 있다`,
      `타인의 의견을 존중하며 건설적인 토론에 참여한다`
    ],
    preparation: {
      materials: ['토론 주제 자료', '찬반 근거 카드', '평가 체크리스트', '타이머'],
      setup: '모둠별 대면 배치, 칠판에 주제와 규칙 게시, 충분한 발표 공간 확보',
      roles: ['사회자', '찬성 측', '반대 측', '관찰자']
    },
    process: [
      {
        step: 1,
        name: '도입 및 준비',
        duration: Math.ceil(timeLimit * 0.2),
        description: '토론 주제 소개 및 규칙 안내, 역할 분담',
        activities: ['주제 설명', '토론 규칙 확인', '모둠 편성', '자료 배포']
      },
      {
        step: 2,
        name: '입장 정리',
        duration: Math.ceil(timeLimit * 0.3),
        description: '찬반 근거 수집 및 주장 준비',
        activities: ['자료 분석', '근거 정리', '주장 구성', '역할별 준비']
      },
      {
        step: 3,
        name: '토론 진행',
        duration: Math.ceil(timeLimit * 0.4),
        description: '체계적인 토론 진행',
        activities: ['입장 발표', '상호 질의응답', '재반박', '자유 토론']
      },
      {
        step: 4,
        name: '정리 및 평가',
        duration: Math.ceil(timeLimit * 0.1),
        description: '토론 결과 정리 및 소감 공유',
        activities: ['결론 도출', '소감 발표', '상호 평가', '교사 피드백']
      }
    ],
    evaluation: {
      criteria: guidelines.evaluation,
      methods: ['관찰 평가', '동료 평가', '자기 평가', '포트폴리오 평가'],
      rubric: {
        excellent: '논리적이고 창의적인 사고를 바탕으로 적극적으로 참여하며 타인을 존중하는 자세를 보임',
        good: '자신의 의견을 분명히 표현하고 기본적인 토론 예절을 지킴',
        needs_improvement: '소극적 참여 또는 토론 규칙을 잘 지키지 못함'
      }
    },
    extensions: [
      '온라인 토론 게시판 활용하여 지속적인 의견 교환',
      '다른 학급과의 교류 토론 진행',
      '토론 결과를 바탕으로 한 프로젝트 활동',
      '학부모 대상 토론 발표회 개최'
    ],
    references: [
      '초등 토론 교육 가이드라인',
      '학년별 토론 주제 모음집',
      `${topic} 관련 교육 자료`,
      '토론 평가 루브릭'
    ]
  }
}

// JSON 응답 파싱 및 검증
function parseScenarioResponse(response: string, topic: string, purpose: string, grade: string, timeLimit: number) {
  try {
    // JSON 형식 추출
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('JSON 형식을 찾을 수 없습니다. 오프라인 템플릿 사용');
      return getOfflineScenarioTemplate(topic, purpose, grade, timeLimit);
    }

    const scenario = JSON.parse(jsonMatch[0]);
    
    // 필수 필드 검증
    const requiredFields = ['topic', 'overview', 'objectives', 'process'];
    for (const field of requiredFields) {
      if (!scenario[field]) {
        console.warn(`필수 필드 ${field}가 없습니다. 오프라인 템플릿 사용`);
        return getOfflineScenarioTemplate(topic, purpose, grade, timeLimit);
      }
    }
    
    return scenario;
  } catch (error) {
    console.error('JSON 파싱 실패:', error);
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