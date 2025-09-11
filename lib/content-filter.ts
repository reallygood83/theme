// 교육용 콘텐츠 필터링 시스템 - 초등학생 안전 보장

export interface ContentFilterResult {
  isAppropriate: boolean;
  reason?: string;
  severity: 'safe' | 'warning' | 'blocked';
  suggestedAlternative?: string;
}

// 부적절한 키워드 데이터베이스 (교육 환경 특화) - 정밀 필터링
const INAPPROPRIATE_KEYWORDS = {
  // 성적 콘텐츠 (정밀 매칭 - 단일 '성' 문자 제거)
  sexual: [
    '섹스', '야한', '음란', '포르노', '성관계', '성행위', '성적 콘텐츠', '성적인', 
    '성인물', '19금', 'sex', 'porn', '야동', '에로', '섹시', '벗', '나체',
    '가슴', '엉덩이', '성기', '자위', '오르가즘', '야릇', '음탕',
    '발정', '섹드', '성추행', '성폭행', '강제추행', '치한', '몰카',
    '리벤지포르노', '딥페이크', '불법촬영', '스폰서', '원조교제',
    '성매매', '성노예', '성착취', '아동포르노', '미성년자성범죄',
    '조건만남', '성인용품', '러브호텔', '키스방', '안마방', '유흥업소'
  ],
  
  // 자살/자해 관련 (구체적 방법론만 차단)
  suicide: [
    '자살', '자해', '죽고싶', '투신', '목매', '자결', '번개탄',
    '농약중독', '리스트컷', '자살방법', '죽는법', '투신하기', '목을매다', '손목긋기', 
    '뛰어내리기', '자살사이트', '동반자살', '극단선택', '생을마감',
    '죽고싶어', '살기싫어', '세상이싫어', '자살충동', '죽음의유혹',
    '이별편지', '유서', '자살예고', 'suicide', '자결각오', '생에마침표', '인생포기'
  ],
  
  // 폭력/범죄 (교육적 맥락 고려하여 완화)
  violence: [
    '살인', '테러', '폭행', '강간', '납치', '협박', '폭력', '때리기',
    '권총', '폭탄', '폭발', '마약제조', '도둑', '강도',
    '싸움', '패싸움', '집단폭행', '괴롱', '왕따', '학교폭력', '가정폭력',
    '아동학대', '성폭력', '데이트폭력', '스토킹', '보복', '린치',
    '흉기', '무기', '칼부림', '총기난사', '대량살상', '학살', '고문',
    '인질', '감금', '불법구속', '유괴', '갈취', '공갈',
    '조직폭력', '일진', '집단따돌림', '사이버폭력', '디지털성범죄'
  ],
  
  // 혐오/차별/욕설 (교육적 맥락 고려하여 완화)
  hate: [
    '죽어', '꺼져', '바보', '멍청이', '병신', '또라이', '싸가지',
    '새끼', '년', '놈', '지랄', '씨발', '좆', '존나', '닥쳐',
    '븅신', '개새끼', '개년', '개놈', '쓰레기', '인간말종',
    '돌대가리', '썅', '시발', '염병', '엿먹어', '뒤져',
    '좆까', '개소리', '헛소리', '개빡', '미친새끼', '병신새끼',
    '또라이새끼', '호로자식', '개자식', '쌍놈', '쌍년',
    '니거', '쪽바리', '짱깨', '똥개', '쥐새끼', '벌레', '구더기'
  ],
  
  // 정치적 편향 (강화)
  political: [
    '대통령욕', '정치인비방', '선거조작', '정치혐오', '극좌', '극우',
    '빨갱이', '토착왜구', '친일', '반미', '종북', '태극기부대',
    '촛불세력', '정치깡패', '독재자', '파시스트', '공산주의자',
    '민족반역자', '매국노', '간첩', '빨치산', '친중', '친북',
    '수구꼴통', '진보좌빨', '보수꼴통', '민주화세력', '유신세력'
  ],
  
  // 종교적 편견 (강화)
  religious: [
    '이단', '사교', '광신', '종교혐오', '무신론자', '종교전쟁',
    '사탄', '악마숭배', '컬트', '종교사기', '목사사기', '신부사기',
    '종교광신도', '맹신', '미신', '사이비종교', '종교분쟁',
    '십자군전쟁', '종교테러', '무슬림테러', '기독교근본주의'
  ],

  // 신규 추가: 도박/중독
  gambling: [
    '도박', '카지노', '바카라', '포커', '슬롯머신', '경마', '경륜',
    '로또', '복권', '불법도박', '온라인도박', '토토', '사다리게임',
    '바둑이', '홀덤', '빙고', '룰렛', '도박중독', '사행성게임'
  ],

  // 범죄 조장 (구체적 방법론만 차단)
  criminal: [
    '폭탄제조법', '마약제조법', '위조지폐제작', '해킹방법', '바이러스제작법',
    '불법복제방법', '신용카드사기수법', '보이스피싱수법', '전화사기방법',
    '인터넷사기수법', '피싱사이트제작', '랜섬웨어제작', '사기수법'
  ]
};

// 정밀한 키워드 매칭 (오탐지 방지, 속도 최적화)
function isKeywordMatch(text: string, keyword: string): boolean {
  // 2글자 이하 키워드는 단어 경계 검사
  if (keyword.length <= 2) {
    // 한글 단어 경계: 공백, 문장부호, 문자열 시작/끝
    const wordBoundaryRegex = new RegExp(`(?:^|[\\s.,!?;:()\\[\\]{}]|$)${keyword}(?:[\\s.,!?;:()\\[\\]{}]|$)`);
    return wordBoundaryRegex.test(text);
  }
  
  // 3글자 이상 키워드는 포함 검사 (기존 방식 유지)
  return text.includes(keyword);
}

// 교육적으로 민감한 주제 (경고 수준)
const SENSITIVE_TOPICS = [
  '종교', '정치', '성평등', '성소수자', '난민', '인종', '계급', '빈부격차',
  '전쟁', '분쟁', '환경파괴', '기후변화', '동물실험', '낙태', '안락사',
  '성형수술', '다이어트', '외모지상주의'
];

// 초등교육 적합한 대체 주제 제안
const EDUCATIONAL_ALTERNATIVES = {
  '성적': '건전한 인간관계와 가족의 소중함',
  '자살': '생명의 소중함과 도움 요청하기',
  '폭력': '평화로운 갈등 해결 방법',
  '혐오': '서로 다름을 인정하고 존중하기',
  '정치': '민주주의와 투표의 중요성',
  '종교': '다양한 문화와 전통 이해하기'
};

// 주제 적절성 검사 (사전 필터링) - 단순화된 필터링
export function checkTopicAppropriateness(topic: string): ContentFilterResult {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // 부적절한 키워드 검사 (단어 경계 검사로 오탐지 방지)
  for (const [category, keywords] of Object.entries(INAPPROPRIATE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (isKeywordMatch(normalizedTopic, keyword.toLowerCase())) {
        const categoryNames = {
          sexual: '성적 콘텐츠',
          suicide: '자해/자살 관련',
          violence: '폭력/범죄',
          hate: '혐오/욕설',
          political: '정치적 편향',
          religious: '종교적 편견',
          gambling: '도박/사행성',
          criminal: '범죄 조장'
        };
        
        console.log(`🚫 부적절한 키워드 감지: "${keyword}" in "${topic}"`);
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

// 검색 결과 후처리 필터링 (단순화)
export function filterSearchResults(results: any[]): any[] {
  return results.filter(result => {
    // 제목과 내용에서 부적절한 키워드 검사
    const contentToCheck = `${result.title} ${result.content} ${result.summary || ''}`.toLowerCase();
    
    // 부적절한 키워드 포함 시 제외 (단어 경계 검사로 오탐지 방지)
    for (const keywords of Object.values(INAPPROPRIATE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (isKeywordMatch(contentToCheck, keyword.toLowerCase())) {
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

// 대체 주제 찾기 (개선된 매칭)
function findSuggestedAlternative(inappropriateKeyword: string): string {
  // 정확한 키워드 매칭으로 대체 주제 찾기
  for (const [key, alternative] of Object.entries(EDUCATIONAL_ALTERNATIVES)) {
    if (inappropriateKeyword.toLowerCase().includes(key.toLowerCase())) {
      return alternative;
    }
  }
  
  // 카테고리별 기본 대체 주제
  if (inappropriateKeyword.includes('성적') || inappropriateKeyword.includes('섹스')) {
    return '건전한 인간관계와 가족의 소중함';
  }
  if (inappropriateKeyword.includes('폭력') || inappropriateKeyword.includes('싸움')) {
    return '평화로운 갈등 해결과 소통 방법';
  }
  if (inappropriateKeyword.includes('도박') || inappropriateKeyword.includes('사행성')) {
    return '건전한 여가활동과 취미생활';
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