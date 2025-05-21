import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 키는 환경 변수에서 가져옵니다.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Gemini API 인스턴스 생성
const genAI = new GoogleGenerativeAI(apiKey);

// Gemini 모델 (Flash 모델)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// 텍스트 생성을 위한 프로 모델 (번역 등 텍스트 작업에 적합)
const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// 질문 유목화 (Clustering) 함수
export async function clusterQuestions(questions: string[]) {
  try {
    const prompt = `
다음은 학생들이 토론 주제에 대해 작성한 질문 목록입니다. 
이 질문들을 내용의 유사성에 따라 3-5개 그룹으로 묶고, 
각 그룹의 핵심 내용을 요약한 뒤, '이 그룹의 질문들은 내용이 유사하여 함께 논의하거나 하나의 질문으로 합쳐볼 수 있습니다.'라는 안내를 추가해주세요.

응답은 JSON 형식으로 다음 구조를 따라주세요:
{
  "clusters": [
    {
      "clusterId": "1",
      "clusterTitle": "그룹 요약 제목",
      "clusterSummary": "그룹에 포함된 질문들의 공통 주제 요약",
      "questions": ["질문1", "질문2", ...],
      "combinationGuide": "이 그룹의 질문들은 내용이 유사하여 함께 논의하거나 하나의 질문으로 합쳐볼 수 있습니다."
    },
    ... 더 많은 클러스터
  ]
}

질문 목록:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // JSON 형식 추출
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      return { clusters: [] };
    }
  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    return { clusters: [] };
  }
}

// 논제 추천 함수
export async function recommendAgendas(clusters: any[], keywords: string[] = []) {
  try {
    // 클러스터 요약 생성
    const clusterSummaries = clusters.map((cluster, i) => 
      `그룹 ${i+1}: ${cluster.clusterTitle} - ${cluster.clusterSummary}`
    ).join('\n');

    const keywordsText = keywords.length > 0 
      ? `추가 키워드: ${keywords.join(', ')}` 
      : '추가 키워드 없음';

    const prompt = `
다음 질문 그룹들과 핵심 키워드를 참고하여, 초등학생들이 토론하기 좋은 논제 2-3개를 추천하고, 
각 논제를 추천하는 간략한 이유를 한두 문장으로 설명해주세요. 
논제는 명확하고 간결해야 하며, 찬반 토론이 가능해야 합니다.

응답은 JSON 형식으로 다음 구조를 따라주세요:
{
  "agendas": [
    {
      "agendaId": "1",
      "agendaTitle": "토론 논제 문장",
      "reason": "이 논제를 추천하는 이유 (1-2문장)",
      "type": "찬반형" (또는 다른 적절한 토론 유형)
    },
    ... 더 많은 논제
  ]
}

${clusterSummaries}

${keywordsText}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // JSON 형식 추출
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      return { agendas: [] };
    }
  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    return { agendas: [] };
  }
}

// 주요 용어 추출 함수
export async function extractKeyTerms(agenda: string) {
  try {
    const prompt = `
다음 토론 논제에서 핵심이 되는 주요 용어 2-3개를 추출해주세요. 
이 용어들은 학생들이 토론 전에 의미를 명확히 해야 할 단어들입니다.

응답은 JSON 형식으로 다음 구조를 따라주세요:
{
  "terms": [
    {
      "term": "용어1",
      "description": "이 용어가 논제에서 중요한 이유에 대한 짧은 설명"
    },
    ... 더 많은 용어
  ]
}

논제: "${agenda}"
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // JSON 형식 추출
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
      return { terms: [] };
    }
  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    return { terms: [] };
  }
}

// 일반 텍스트 생성 함수 (번역 등의 용도)
export async function translateText(prompt: string): Promise<string> {
  try {
    const result = await proModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API 텍스트 생성 오류:', error);
    throw error;
  }
}