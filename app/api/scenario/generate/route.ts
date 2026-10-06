import { NextRequest, NextResponse } from 'next/server'
import { generateUpstageContent } from '@/lib/upstage'

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

async function callScenarioAI(prompt: string) {
  if (process.env.UPSTAGE_API_KEY?.trim()) {
    try {
      const upstagePrompt = `초등학교 토론 교육 전문가로서 아래 요청에 맞는 완성도 높은 시나리오를 작성하고, 반드시 완전한 JSON만 반환해주세요.\n\n${prompt}`
      return await generateUpstageContent(upstagePrompt, 4000)
    } catch (error) {
      console.error('Upstage API 호출 실패:', error)
    }
  }
  if (process.env.OPENAI_API_KEY) return callOpenAI(prompt)
  throw new Error('사용 가능한 AI API가 없습니다')
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

// 시나리오 생성 프롬프트 생성 (참고 구현체 기반 최고 품질 버전)
function generateScenarioPrompt(topic: string, purpose: string, grade: string, timeLimit: number, additionalInfo?: string) {
  const guidelines = getPurposeSpecificGuidelines(purpose)
  
  return `# 역할: 초등학생을 위한 전문 토론 시나리오 설계자
# 목표: 초등토론교육모형의 '다름'과 '공존'을 핵심으로 하는 체계적인 토론 시나리오를 생성한다.

## 📋 시나리오 생성 요청
토론 주제: "${topic}"
수업 목적: ${purpose}
대상 학년: ${grade}학년
수업 시간: ${timeLimit}분
${additionalInfo ? `추가 고려사항: ${additionalInfo}` : ''}

## 🎯 교육목적별 특화 지침:
### ${purpose} 중심 접근법
- **중점 영역**: ${guidelines.focus}
- **핵심 활동**: ${guidelines.activities.join(', ')}
- **평가 요소**: ${guidelines.evaluation.join(', ')}

## ⚖️ 필수 준수 사항:
- 반드시 초등학생 수준에 적합한 토론 시나리오를 구성한다.
- 학생들이 자신과 다른 의견을 가진 사람들의 입장도 이해할 수 있도록 설계한다.
- 찬성/반대 입장이 분명하게 나뉠 수 있는 구조로 구성한다.
- 학생들의 일상생활이나 학교생활과 관련된 내용을 포함한다.
- 사회적, 윤리적 사고를 촉진하는 요소를 포함한다.
- 각 논점이 초등학생들이 이해하고 표현할 수 있는 수준이어야 한다.

## 📝 시나리오 구성 요소 (모든 필드 필수):

1. **title**: 토론의 명확하고 간결한 주제 (예: "학교에 휴대폰을 가지고 오는 것의 찬반")
2. **topic**: 토론 주장 형식으로 구체적 표현 (예: "초등학생은 학교에 휴대폰을 가지고 와야 한다 vs 가지고 오면 안 된다")
3. **background**: 토론 배경 설명 (300자 내외) - 왜 이 주제가 중요한지, 어떤 상황에서 발생한 이슈인지 초등학생 눈높이에 맞춰 설명
4. **proArguments**: 찬성측 주요 논점 정확히 3가지 (배열) - 각 논점은 초등학생이 이해하고 주장할 수 있는 구체적이고 현실적인 근거
5. **conArguments**: 반대측 주요 논점 정확히 3가지 (배열) - 각 논점은 초등학생이 이해하고 주장할 수 있는 구체적이고 현실적인 근거
6. **keyQuestions**: 학생들이 고려해야 할 핵심 질문 8개 (배열) - 토론 주제 관련 질문 5개 + 토론 목적 관련 질문 3개로 구성. 각 질문은 학생들의 깊은 사고를 유도하고 토론 참여도를 높이는 내용
7. **expectedOutcomes**: 기대 학습 성과 4-5개 (배열) - 학생들이 이 토론을 통해 얻게 될 구체적 역량과 성장 포인트
8. **materials**: 토론에 필요한 준비물 목록 (배열) - 교실에서 실제 사용 가능한 교구나 자료
9. **teacherTips**: 교사용 지도 팁 (300자 내외) - 선택된 토론 목적에 특화된 수업 진행 가이드
10. **keywords**: 주요 키워드 최대 5개 (배열) - 토론과 관련된 핵심 개념
11. **subject**: 관련 교과목 최대 3개 (배열) - 예: ["사회", "도덕", "국어"]
12. **grade**: 추천 학년 (예: "${grade}학년")
13. **purpose**: 토론 목적 ("${purpose}")
14. **timeLimit**: 수업시간(숫자: ${timeLimit})

** 중요: teacherTips와 keyQuestions는 선택된 토론 목적(${purpose})에 맞춰 특화된 내용으로 구성해야 합니다. **

## 📋 JSON 응답 형식 (필수):
다음과 같은 완전한 JSON 형식으로 정확히 응답해주세요:

{
  "title": "토론 시나리오의 명확한 제목",
  "topic": "${topic}",
  "purpose": "${purpose}",
  "grade": "${grade}학년",
  "timeLimit": ${timeLimit},
  "background": "토론 주제에 대한 상세한 배경 설명으로, 왜 이 주제가 중요한지와 학생들이 관심을 가질 수 있는 이유를 포함한 300자 내외의 설명입니다. 초등학생이 이해할 수 있는 언어로 작성하며, 실생활과의 연관성을 강조합니다.",
  "proArguments": [
    "찬성 논거 1: 구체적이고 초등학생이 직접 경험할 수 있는 상황을 바탕으로 한 논리적 근거",
    "찬성 논거 2: 실생활과 밀접한 관련이 있으며 학생들이 쉽게 이해할 수 있는 실용적 근거",
    "찬성 논거 3: 미래 지향적이거나 장기적 관점에서의 이점을 제시하는 근거"
  ],
  "conArguments": [
    "반대 논거 1: 구체적이고 초등학생이 직접 경험할 수 있는 문제점을 바탕으로 한 논리적 근거",
    "반대 논거 2: 실생활에서 발생할 수 있는 현실적 어려움이나 부작용에 대한 근거",
    "반대 논거 3: 대안적 방법이나 다른 선택의 우수성을 제시하는 근거"
  ],
  "keyQuestions": [
    "토론 주제와 관련하여 학생들이 깊이 생각해볼 수 있는 핵심 질문 1",
    "토론 주제와 관련하여 학생들이 깊이 생각해볼 수 있는 핵심 질문 2",
    "토론 주제와 관련하여 학생들이 깊이 생각해볼 수 있는 핵심 질문 3",
    "토론 주제와 관련하여 학생들이 깊이 생각해볼 수 있는 핵심 질문 4",
    "토론 주제와 관련하여 학생들이 깊이 생각해볼 수 있는 핵심 질문 5",
    "${purpose}와 관련된 교육목적 달성을 위한 핵심 질문 1",
    "${purpose}와 관련된 교육목적 달성을 위한 핵심 질문 2",
    "${purpose}와 관련된 교육목적 달성을 위한 핵심 질문 3"
  ],
  "expectedOutcomes": [
    "이 토론을 통해 학생들이 얻게 될 구체적인 학습 효과 1",
    "이 토론을 통해 학생들이 얻게 될 구체적인 학습 효과 2",
    "이 토론을 통해 학생들이 얻게 될 구체적인 학습 효과 3",
    "이 토론을 통해 학생들이 얻게 될 구체적인 학습 효과 4"
  ],
  "materials": [
    "토론 진행을 위해 실제 교실에서 사용할 수 있는 준비물 1",
    "토론 진행을 위해 실제 교실에서 사용할 수 있는 준비물 2",
    "토론 진행을 위해 실제 교실에서 사용할 수 있는 준비물 3"
  ],
  "teacherTips": "교사가 이 토론을 효과적으로 지도하기 위한 구체적이고 실용적인 팁으로, ${purpose} 목적 달성을 위한 특화된 지도 방법과 주의사항, 학생 참여 유도 전략 등을 포함한 300자 내외의 상세한 가이드입니다.",
  "keywords": ["토론의 핵심 키워드1", "토론의 핵심 키워드2", "토론의 핵심 키워드3", "토론의 핵심 키워드4", "토론의 핵심 키워드5"],
  "subject": ["관련 교과 1", "관련 교과 2"]
}

## 🏫 초등토론교육모형 3단계 구조 반영:
1. **도입 단계**: 흥미 유발과 배경지식 활성화를 위한 요소 포함
2. **전개 단계**: 체계적 토론 진행과 논거 교환을 위한 구체적 가이드
3. **정리 단계**: 합의점 도출과 성찰 활동을 위한 마무리 방안

**주의**: 응답을 반드시 완전한 JSON 형식으로만 제공해야 합니다. 외부 마크다운이나 추가 설명 없이 오직 JSON 객체만 반환해주세요.`
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

    // 배열 필드 정규화: 문자열/객체로 온 경우에도 안전하게 string[]으로 변환
    const arrayFields = ['proArguments', 'conArguments', 'keyQuestions', 'expectedOutcomes', 'materials', 'keywords', 'subject'];

    const normalizeToArray = (value: any): string[] => {
      try {
        // 이미 배열이면 문자열로 캐스팅 후 트림
        if (Array.isArray(value)) {
          return value.map((v) => String(v).trim()).filter(Boolean);
        }
        // 문자열인 경우 JSON 배열 문자열일 수 있으니 우선 파싱 시도
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              return parsed.map((v: any) => String(v).trim()).filter(Boolean);
            }
          }
          // 불릿/쉼표/세미콜론/줄바꿈 기반 스플릿
          return trimmed
            .split(/\r?\n|\u2022|•|^- |- |\d+\.\s|,\s|,|;|\|/gm)
            .map((s) => s.trim())
            .filter(Boolean);
        }
        // 객체인 경우 값 모아 배열화
        if (value && typeof value === 'object') {
          return Object.values(value)
            .map((v) => String(v).trim())
            .filter(Boolean);
        }
      } catch (e) {
        console.warn('배열 필드 정규화 중 예외:', e);
      }
      return [];
    };

    arrayFields.forEach((field) => {
      jsonData[field] = normalizeToArray(jsonData[field]);
    });

    // 찬성/반대 논거가 3개씩 있는지 확인 (경고 로그만)
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

    if (!process.env.UPSTAGE_API_KEY?.trim() && !process.env.OPENAI_API_KEY) {
      console.warn('⚠️ AI API 키가 설정되지 않았습니다. 오프라인 모드로 동작합니다.')
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
      
      console.log('🤖 AI 시나리오 생성 API 호출 시작...')
      const response = await callScenarioAI(prompt)
      console.log('✅ AI 시나리오 생성 API 응답 받음')
      
      const scenario = parseScenarioResponse(response, topic, purpose, grade, timeLimit)
      
      console.log('🎉 시나리오 생성 완료!')
      
      return NextResponse.json({
        success: true,
        scenario,
        isOffline: false
      })
      
    } catch (apiError) {
      console.error('❌ AI 시나리오 생성 API 호출 실패:', apiError)
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
  const hasAIProvider = Boolean(process.env.UPSTAGE_API_KEY?.trim() || process.env.OPENAI_API_KEY)
  
  return NextResponse.json({
    status: 'active',
    features: {
      ai_generation: hasAIProvider ? 'available' : 'offline_only',
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
