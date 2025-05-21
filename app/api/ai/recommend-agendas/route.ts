import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, push, set, get } from 'firebase/database'
import { generateContent } from '@/lib/gemini'

// 학생용 AI 논제 추천 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // 요청 파라미터 추출
    const { sessionId, topic, description, studentName, studentGroup, useQuestions = false } = body
    
    if (!sessionId || (!topic && !useQuestions) || !studentName || !studentGroup) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }
    
    // 학생들의 질문 수집 (useQuestions가 true인 경우)
    let studentQuestions: string[] = []
    if (useQuestions && database) {
      try {
        const questionsRef = ref(database, `sessions/${sessionId}/questions`)
        const snapshot = await get(questionsRef)
        
        if (snapshot.exists()) {
          const questionsData = snapshot.val()
          const questionsList = Object.values(questionsData)
          
          // 질문 텍스트만 추출
          studentQuestions = questionsList.map((q: any) => q.text || '').filter(Boolean)
        }
      } catch (error) {
        console.error('질문 데이터 로드 오류:', error)
      }
    }
    
    // Gemini 모델을 사용하여 토론 논제 생성
    let prompt = '';
    
    if (useQuestions && studentQuestions.length > 0) {
      // 학생 질문 기반 프롬프트 (질문이 있고 useQuestions가 true인 경우)
      prompt = `
당신은 학생들의 토론 활동을 돕는 AI 교육 도우미입니다.
학생들이 수업에서 제출한 질문들을 분석하여 그들이 가장 관심을 갖고 있는 주제에 대한 토론 논제 3개를 생성해주세요.

${topic ? `주제: ${topic}` : ''}
${description ? `추가 설명: ${description}` : ''}

학생들의 질문 목록:
${studentQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}

1. 위 질문들을 분석하여 학생들이 가장 관심을 가지고 있는 주제와 논점을 파악하세요.
2. 학생들의 질문에서 나타난 관심사와 궁금증을 반영한 토론 논제를 생성하세요.
3. 질문에서 드러난 다양한 관점과 쟁점을 고려하세요.

다음 형식으로 응답해 주세요:
{
  "questionAnalysis": "학생들의 질문에서 발견한 주요 관심사와 패턴에 대한 간략한 설명 (2-3문장)",
  "recommendedAgendas": [
    {
      "agendaTitle": "논제 제목 (질문 형태로)",
      "reason": "이 논제를 추천하는 이유와 어떤 학생 질문에서 영감을 얻었는지 (2-3문장)",
      "type": "논제 유형 (찬반형, 원인탐구형, 문제해결형, 가치판단형 중 하나)"
    },
    // 나머지 논제들...
  ]
}
`;
    } else {
      // 일반 주제 기반 프롬프트 (질문이 없거나 useQuestions가 false인 경우)
      prompt = `
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
`;
    }
    
    // 두 프롬프트 모두에 적용되는 공통 가이드라인
    prompt += `
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
      // JSON 문자열만 추출하기 위한 더 강화된 처리
      // 여러 형식의 JSON 추출 패턴 시도
      let jsonString = response;
      
      // 첫 번째 시도: 코드 블록 내 JSON 추출 (```json ... ```)
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonString = codeBlockMatch[1];
      } 
      // 두 번째 시도: 중괄호로 둘러싸인 전체 텍스트
      else {
        const jsonObjectMatch = response.match(/(\{[\s\S]*\})/);
        if (jsonObjectMatch && jsonObjectMatch[1]) {
          jsonString = jsonObjectMatch[1];
        }
      }
      
      console.log('파싱 시도할 JSON 문자열 길이:', jsonString.length);
      console.log('파싱 시도할 JSON 문자열 일부:', jsonString.substring(0, 100) + '...');
      const parsedData = JSON.parse(jsonString);
      
      // 타입 안전성을 위해 필요한 필드를 가진 새 객체로 명시적 변환
      parsedResponse = {
        recommendedAgendas: parsedData.recommendedAgendas || [],
        questionAnalysis: parsedData.questionAnalysis
      };
      
      // 필요한 필드 확인 및 기본값 제공
      if (!parsedResponse.recommendedAgendas.length && useQuestions && studentQuestions.length > 0) {
        // 질문 기반 프롬프트에서는 recommendedAgendas가 필수
        throw new Error('응답에 recommendedAgendas 필드가 없습니다');
      }
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      console.log('원본 응답:', response);
      
      // 응답 포맷 재시도: 직접 JSON 구조 생성
      try {
        // AI 응답이 구조화되지 않은 경우 강제로 형식 맞추기 시도
        const lines = response.split('\n').filter(line => line.trim() !== '');
        
        // 기본 구조 생성 (타입 단언 사용)
        parsedResponse = {
          recommendedAgendas: [],
          questionAnalysis: undefined
        } as { 
          recommendedAgendas: any[]; 
          questionAnalysis?: string;
        };
        
        // 질문 분석이 있을 경우 (첫 줄이 제목이 아닌 경우)
        if (useQuestions && lines.length > 0 && !lines[0].includes('논제') && !lines[0].includes('?')) {
          parsedResponse.questionAnalysis = lines[0];
        }
        
        // 나머지 텍스트에서 논제 추출 시도
        let currentAgenda: { agendaTitle: string; reason: string; type: string } | null = null;
        for (const line of lines) {
          if (line.includes('논제') || line.includes('?')) {
            if (currentAgenda) {
              parsedResponse.recommendedAgendas.push(currentAgenda);
            }
            currentAgenda = {
              agendaTitle: line.trim(),
              reason: '',
              type: '찬반형' // 기본값
            };
          } else if (currentAgenda && !currentAgenda.reason && line.trim()) {
            currentAgenda.reason = line.trim();
          } else if (currentAgenda && currentAgenda.reason && (line.includes('찬반') || line.includes('원인') || line.includes('문제') || line.includes('가치'))) {
            currentAgenda.type = line.trim();
          }
        }
        
        // 마지막 논제 추가
        if (currentAgenda) {
          parsedResponse.recommendedAgendas.push(currentAgenda);
        }
        
        if (parsedResponse.recommendedAgendas.length === 0) {
          throw new Error('논제를 추출할 수 없습니다');
        }
      } catch (fallbackError) {
        console.error('응답 복구 시도 실패:', fallbackError);
        return NextResponse.json(
          { error: 'AI 응답을 파싱하는 데 실패했습니다.' },
          { status: 500 }
        );
      }
    }
    
    // 생성된 논제를 데이터베이스에 저장
    if (database && parsedResponse.recommendedAgendas) {
      try {
        const studentAgendasRef = ref(database, `sessions/${sessionId}/studentAgendas`)
        const newAgendaRef = push(studentAgendasRef)
        
        // 저장할 데이터 구성
        const dataToSave: {
          recommendedAgendas: any[];
          topic: any;
          description: string;
          studentName: any;
          studentGroup: any;
          createdAt: number;
          questionAnalysis?: string;
        } = {
          recommendedAgendas: parsedResponse.recommendedAgendas,
          topic,
          description: description || '',
          studentName,
          studentGroup,
          createdAt: Date.now()
        };
        
        // 질문 분석 결과가 있으면 추가
        if (parsedResponse.questionAnalysis) {
          dataToSave.questionAnalysis = parsedResponse.questionAnalysis;
        }
        
        console.log('저장할 논제 데이터 구조:', 
          JSON.stringify({
            agendasCount: parsedResponse.recommendedAgendas.length,
            hasQuestionAnalysis: !!parsedResponse.questionAnalysis,
            firstAgendaTitle: parsedResponse.recommendedAgendas[0]?.agendaTitle || '없음'
          })
        );
        
        // 데이터베이스에 저장
        await set(newAgendaRef, dataToSave);
        console.log('논제 저장 완료 - 경로:', `sessions/${sessionId}/studentAgendas/${newAgendaRef.key}`);
      } catch (dbError) {
        console.error('데이터베이스 저장 오류:', dbError)
      }
    } else {
      console.warn('저장할 논제가 없거나 데이터베이스 연결 실패');
    }
    
    // 응답 로깅 및 반환
    console.log('응답 성공 - 논제 개수:', parsedResponse.recommendedAgendas?.length || 0);
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