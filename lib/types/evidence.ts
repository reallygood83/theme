// 근거자료 검색 관련 타입 정의

export interface EvidenceResult {
  id: string
  type: '뉴스 기사' | '유튜브 영상' | '기타'
  title: string
  content: string
  source: string
  url: string
  reliability?: number
  publishedDate?: string
  author?: string
  summary?: string
  tags?: string[]
  videoData?: YouTubeVideoData
}

export interface YouTubeVideoData {
  snippet: {
    title: string
    description: string
    thumbnails: {
      default?: { url: string; width: number; height: number }
      medium?: { url: string; width: number; height: number }
      high?: { url: string; width: number; height: number }
    }
    channelTitle: string
    publishedAt: string
    categoryId: string
  }
  statistics?: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
  id: {
    videoId: string
  }
}

export interface EvidenceSearchParams {
  topic: string
  stance: 'positive' | 'negative'
  types: EvidenceType[]
}

export interface EvidenceSearchResponse {
  evidences: EvidenceResult[]
  totalCount: number
  searchQuery: string
  timestamp: Date
}

export interface EvidenceSearchRequest {
  topic: string
  stance: string
  selectedTypes: string[]
}

export type EvidenceType = '뉴스 기사' | '유튜브 영상' | '기타'

export interface EvidenceProgress {
  step: number
  totalSteps: number
  message: string
  isComplete: boolean
}

export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export interface YouTubeSearchResponse {
  items: YouTubeVideoData[]
  nextPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
}

export interface EvidenceSession {
  id: string
  sessionId: string
  topic: string
  stance: string
  results: EvidenceResult[]
  createdAt: Date
  createdBy: string
  searchParams: EvidenceSearchParams
}

// 원본 프로그램과 동일한 진행 단계
export const EVIDENCE_SEARCH_STEPS = [
  { text: '주제 분석 중...', icon: '🎯' },
  { text: '자료 유형 확인 중...', icon: '📋' },
  { text: '관련 근거자료 검색 중...', icon: '🔍' },
  { text: '신뢰성 검증 중...', icon: '✅' },
  { text: '결과 정리 중...', icon: '📊' }
] as const

// 근거자료 유형 필터 (뉴스와 유튜브만 지원)
export const EVIDENCE_TYPES = [
  { value: '뉴스 기사', label: '📰 뉴스 기사', color: '#3b82f6' },
  { value: '유튜브 영상', label: '🎥 유튜브 영상', color: '#ef4444' }
] as const

// 신뢰도 등급 계산 함수
export function getReliabilityGrade(reliability: number): {
  grade: string
  color: string
  backgroundColor: string
  description: string
} {
  if (reliability >= 90) {
    return {
      grade: 'A+',
      color: '#065f46',
      backgroundColor: '#d1fae5',
      description: '매우 신뢰할 수 있음'
    }
  } else if (reliability >= 80) {
    return {
      grade: 'A',
      color: '#047857',
      backgroundColor: '#dcfce7',
      description: '신뢰할 수 있음'
    }
  } else if (reliability >= 70) {
    return {
      grade: 'B',
      color: '#ca8a04',
      backgroundColor: '#fef3c7',
      description: '보통 신뢰도'
    }
  } else if (reliability >= 60) {
    return {
      grade: 'C',
      color: '#c2410c',
      backgroundColor: '#fed7aa',
      description: '주의 깊게 검토 필요'
    }
  } else {
    return {
      grade: 'D',
      color: '#dc2626',
      backgroundColor: '#fecaca',
      description: '추가 검증 필요'
    }
  }
}