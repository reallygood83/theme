// 근거자료 검색 관련 타입 정의

export interface EvidenceResult {
  id: string
  type: '뉴스 기사' | '학술 자료' | '통계 자료' | '유튜브 영상' | '기타'
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

export type EvidenceType = '뉴스 기사' | '학술 자료' | '통계 자료' | '유튜브 영상' | '기타'

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

// 원본과 동일한 자료 유형 필터
export const EVIDENCE_TYPES = [
  { value: '뉴스 기사', label: '📰 뉴스 기사', color: '#3b82f6' },
  { value: '학술 자료', label: '📚 학술 자료', color: '#10b981' },
  { value: '통계 자료', label: '📊 통계 자료', color: '#f59e0b' },
  { value: '유튜브 영상', label: '🎥 유튜브 영상', color: '#ef4444' }
] as const