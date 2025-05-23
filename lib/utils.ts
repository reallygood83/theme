// 랜덤 세션 코드 생성 함수 (영문 대문자 + 숫자 6자리)
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되기 쉬운 0, 1, I, O 제외
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}

// YouTube URL에서 비디오 ID 추출 함수
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // 다양한 YouTube URL 패턴에서 ID 추출
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}

// 세션 타입 정의
export interface Session {
  sessionId: string;
  title?: string;
  teacherId?: string;
  materialText?: string;
  materialUrl?: string;
  materials?: Array<{
    type: 'text' | 'youtube' | 'file';
    content?: string;
    url?: string;
    fileName?: string;
    fileUrl?: string;
  }>;
  keywords?: string[];
  accessCode: string;
  createdAt: number;
  updatedAt?: number;
  aiAnalysisResult?: {
    clusteredQuestions?: any[];
    recommendedAgendas?: any[];
    extractedTerms?: any[];
    isCustomized?: boolean;
  };
  questions?: Record<string, Question>;
  isDuplicated?: boolean;
  duplicatedFrom?: string;
}

// 질문 타입 정의
export interface Question {
  questionId: string;
  sessionId: string;
  studentName: string;
  text: string;
  createdAt: number;
  clusterId?: string;
}

// 용어 정의 타입
export interface TermDefinition {
  definitionId: string;
  sessionId: string;
  term: string;
  definition: string;
  studentGroup: string;
}

// 시간 포맷팅 함수
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

// 날짜 포맷팅 함수
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}