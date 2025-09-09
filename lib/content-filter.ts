// 교육용 콘텐츠 필터링 시스템 - 초등학생 안전 보장

export interface ContentFilterResult {
  isAppropriate: boolean;
  reason?: string;
  severity: 'safe' | 'warning' | 'blocked';
  suggestedAlternative?: string;
}

// 부적절한 키워드 데이터베이스 (교육 환경 특화)
const INAPPROPRIATE_KEYWORDS = {
  // 성적 콘텐츠
  sexual: [
    '성', '섹스', '야한', '음란', '포르노', '성관계', '성행위', '성적', 
    '성인', '19금', 'sex', 'porn', '야동', '에로', '섹시', '벗', '나체',
    '몸', '가슴', '엉덩이', '성기', '자위', '오르가즘'
  ],
  
  // 자살/자해 관련
  suicide: [
    '자살', '자해', '죽고싶', '목숨', '투신', '목매', '자결', '번개탄',
    '농약', '독', '수면제', '칼', '리스트컷', '죽음', '사망', '상해',
    '자살방법', '죽는법', '투신하기'
  ],
  
  // 폭력/범죄
  violence: [
    '살인', '테러', '폭행', '강간', '납치', '협박', '폭력', '때리기',
    '칼', '총', '권총', '폭탄', '폭발', '마약', '도박', '도둑', '강도',
    '싸움', '패싸움', '집단폭행', '괴롱', '왕따', '학교폭력'
  ],
  
  // 혐오/차별
  hate: [
    '죽어', '꺼져', '바보', '멍청이', '병신', '또라이', '미친', '싸가지',
    '개', '새끼', '년', '놈', '지랄', '씨발', '좆', '존나', '닥쳐'
  ],
  
  // 정치적 편향 (초등교육 부적합)
  political: [
    '대통령욕', '정치인비방', '선거조작', '정치혐오', '극좌', '극우',
    '빨갱이', '토착왜구', '친일', '반미', '종북'
  ],
  
  // 종교적 편견
  religious: [
    '이단', '사교', '광신', '종교혐오', '무신론자', '종교전쟁'
  ]
};

// 교육적으로 민감한 주제 (경고 수준)
const SENSITIVE_TOPICS = [
  '종교', '정치', '성평등', '성소수자', '난민', '인종', '계급', '빈부격차',
  '전쟁', '분쟁', '환경파괴', '기후변화', '동물실험', '낙태', '안락사',
  '성형수술', '다이어트', '외모지상주의'
];

// 초등교육 적합한 대체 주제 제안
const EDUCATIONAL_ALTERNATIVES = {
  '성': '가족의 소중함',
  '자살': '생명의 소중함과 도움 요청하기',
  '폭력': '평화로운 갈등 해결 방법',
  '혐오': '서로 다름을 인정하고 존중하기',
  '정치': '민주주의와 투표의 중요성',
  '종교': '다양한 문화와 전통 이해하기'
};

// 주제 적절성 검사 (사전 필터링)
export function checkTopicAppropriateness(topic: string): ContentFilterResult {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // 1단계: 명백히 부적절한 키워드 검사
  for (const [category, keywords] of Object.entries(INAPPROPRIATE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedTopic.includes(keyword.toLowerCase())) {
        const categoryNames = {
          sexual: '성적 콘텐츠',
          suicide: '자해/자살 관련',
          violence: '폭력/범죄',
          hate: '혐오/욕설',
          political: '정치적 편향',
          religious: '종교적 편견'
        };
        
        return {
          isAppropriate: false,
          reason: `${categoryNames[category as keyof typeof categoryNames]} 내용이 포함되어 있습니다.`,
          severity: 'blocked',
          suggestedAlternative: findSuggestedAlternative(keyword)
        };
      }
    }
  }
  
  // 2단계: 민감한 주제 검사 (경고 수준)
  for (const sensitiveTopic of SENSITIVE_TOPICS) {
    if (normalizedTopic.includes(sensitiveTopic)) {
      return {
        isAppropriate: true, // 허용하되 신중한 처리
        reason: `민감한 주제입니다. 교육적 관점에서 신중하게 접근해주세요.`,
        severity: 'warning',
        suggestedAlternative: `'${sensitiveTopic}'에 대한 초등학생 수준의 교육적 접근`
      };
    }
  }
  
  // 3단계: 길이 및 형식 검사
  if (normalizedTopic.length < 2) {
    return {
      isAppropriate: false,
      reason: '검색 주제가 너무 짧습니다.',
      severity: 'blocked'
    };
  }
  
  if (normalizedTopic.length > 200) {
    return {
      isAppropriate: false,
      reason: '검색 주제가 너무 깁니다.',
      severity: 'blocked'
    };
  }
  
  // 4단계: 교육적 가치 평가
  const educationalValue = evaluateEducationalValue(normalizedTopic);
  if (educationalValue < 0.3) {
    return {
      isAppropriate: true,
      reason: '더 교육적인 관점으로 접근하면 좋겠습니다.',
      severity: 'warning',
      suggestedAlternative: enhanceEducationalValue(topic)
    };
  }
  
  return {
    isAppropriate: true,
    severity: 'safe'
  };
}

// 검색 결과 후처리 필터링
export function filterSearchResults(results: any[]): any[] {
  return results.filter(result => {
    // 제목과 내용에서 부적절한 키워드 검사
    const contentToCheck = `${result.title} ${result.content} ${result.summary || ''}`.toLowerCase();
    
    // 부적절한 키워드 포함 시 제외
    for (const keywords of Object.values(INAPPROPRIATE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (contentToCheck.includes(keyword.toLowerCase())) {
          console.log(`🚫 부적절한 콘텐츠 필터링: "${result.title}" - 키워드: ${keyword}`);
          return false;
        }
      }
    }
    
    // URL 안전성 검사
    if (result.url && !isUrlSafe(result.url)) {
      console.log(`🚫 안전하지 않은 URL 필터링: ${result.url}`);
      return false;
    }
    
    return true;
  });
}

// URL 안전성 검사
function isUrlSafe(url: string): boolean {
  const unsafeDomains = [
    'pornhub.com', 'xvideos.com', 'redtube.com', // 성인 사이트
    '4chan.org', '8chan.org', // 혐오 사이트
    'suicide.org', 'depression.org' // 자해 관련 (교육적 맥락 제외)
  ];
  
  const lowerUrl = url.toLowerCase();
  return !unsafeDomains.some(domain => lowerUrl.includes(domain));
}

// 교육적 가치 평가 (0-1 점수)
function evaluateEducationalValue(topic: string): number {
  const educationalKeywords = [
    '교육', '학습', '배움', '지식', '이해', '탐구', '연구', '분석', '토론',
    '과학', '역사', '문화', '예술', '문학', '수학', '환경', '건강', '안전',
    '우정', '협력', '존중', '배려', '나눔', '봉사', '인권', '평등', '정의'
  ];
  
  let score = 0.5; // 기본 점수
  
  for (const keyword of educationalKeywords) {
    if (topic.includes(keyword)) {
      score += 0.1;
    }
  }
  
  return Math.min(score, 1.0);
}

// 교육적 가치 향상 제안
function enhanceEducationalValue(topic: string): string {
  return `'${topic}'을 초등학생 관점에서 어떻게 이해하고 배울 수 있을까요?`;
}

// 대체 주제 찾기
function findSuggestedAlternative(inappropriateKeyword: string): string {
  for (const [key, alternative] of Object.entries(EDUCATIONAL_ALTERNATIVES)) {
    if (inappropriateKeyword.includes(key)) {
      return alternative;
    }
  }
  return '안전하고 교육적인 주제로 검색해보세요.';
}

// 교사용 콘텐츠 리포트 생성
export function generateContentReport(topic: string, filterResult: ContentFilterResult): string {
  if (filterResult.severity === 'safe') {
    return `✅ 교육적으로 적합한 주제입니다.`;
  }
  
  if (filterResult.severity === 'warning') {
    return `⚠️ 주의: ${filterResult.reason}\n💡 제안: ${filterResult.suggestedAlternative}`;
  }
  
  return `🚫 차단: ${filterResult.reason}\n💡 대안: ${filterResult.suggestedAlternative}`;
}

// 학생용 안내 메시지 생성
export function generateStudentMessage(filterResult: ContentFilterResult): string {
  if (filterResult.severity === 'blocked') {
    return `죄송해요. 이 주제는 초등학생에게 적합하지 않아요. 다른 주제로 검색해보세요! 💡 추천: ${filterResult.suggestedAlternative}`;
  }
  
  if (filterResult.severity === 'warning') {
    return `이 주제는 조금 어려울 수 있어요. 선생님과 함께 생각해보는 건 어떨까요? 😊`;
  }
  
  return '';
}