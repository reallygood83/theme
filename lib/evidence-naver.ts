// 네이버 뉴스 기반 안정적 근거자료 검색 시스템 (교육용)

import { EvidenceResult, YouTubeVideoData } from './types/evidence'

// 네이버 뉴스 API 설정
const NAVER_NEWS_CONFIG = {
  baseUrl: 'https://openapi.naver.com/v1/search/news.json',
  display: 10,
  sort: 'sim' // 정확도 순
}

// 교육용 유튜브 채널 화이트리스트
const EDUCATIONAL_YOUTUBE_CHANNELS = [
  'EBS 초등', 'EBS교육', 'KBS 교육', 'YTN 사이언스',
  '과학쿠키', '안될과학', '북튜브', '교육부',
  '초등학교', '교육청', '어린이TV', '키즈'
]

// 부적절한 콘텐츠 키워드
const INAPPROPRIATE_KEYWORDS = [
  '19금', '성인', '도박', '술', '담배', '폭력', '욕설', 
  '혐오', '자살', '마약', '성적', '섹스', '음란', '야한',
  '불법', '해킹', '사기', '협박'
]

/**
 * 네이버 뉴스 검색 (안정적 대안)
 */
export async function searchNaverNews(
  query: string, 
  stance: string = 'neutral'
): Promise<EvidenceResult[]> {
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    console.warn('[경고] 네이버 API 키가 설정되지 않았습니다.')
    return []
  }

  try {
    // 교육 친화적 검색 쿼리 생성
    const educationalQuery = generateEducationalQuery(query, stance)
    
    const response = await fetch(
      `${NAVER_NEWS_CONFIG.baseUrl}?query=${encodeURIComponent(educationalQuery)}&display=${NAVER_NEWS_CONFIG.display}&sort=${NAVER_NEWS_CONFIG.sort}`,
      {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
        },
        signal: AbortSignal.timeout(10000) // 10초 타임아웃
      }
    )

    if (!response.ok) {
      throw new Error(`네이버 API 오류: ${response.status}`)
    }

    const data = await response.json()
    
    // 교육적 필터링 적용
    const filteredResults = data.items
      .filter((item: any) => isEducationallyAppropriate(item))
      .slice(0, 5)
      .map((item: any, index: number) => ({
        id: `naver-news-${index}`,
        type: '뉴스 기사',
        title: cleanHtml(item.title),
        content: cleanHtml(item.description),
        source: extractSource(item.link),
        url: item.originallink || item.link,
        publishedDate: formatDate(item.pubDate),
        reliability: 85,
        summary: cleanHtml(item.description).substring(0, 100) + '...',
        author: ''
      }))

    console.log(`[성공] 네이버 뉴스 ${filteredResults.length}개 검색 완료`)
    return filteredResults

  } catch (error) {
    console.error('[오류] 네이버 뉴스 검색 실패:', error)
    return []
  }
}

/**
 * 교육용 YouTube 검색 (품질 강화)
 */
export async function searchEducationalYouTube(
  query: string,
  maxResults: number = 10
): Promise<EvidenceResult[]> {
  if (!process.env.YOUTUBE_API_KEY) {
    console.warn('[경고] YouTube API 키가 설정되지 않았습니다.')
    return []
  }

  try {
    // 교육 채널 우선 검색
    const educationalQueries = [
      `${query} 초등학생`,
      `${query} 교육`,
      `EBS ${query}`,
      `어린이 ${query}`
    ]

    const results: EvidenceResult[] = []

    for (const searchQuery of educationalQueries.slice(0, 2)) {
      const cleanQuery = sanitizeQuery(searchQuery)
      
      const params = new URLSearchParams({
        part: 'snippet',
        q: cleanQuery,
        type: 'video',
        maxResults: '5',
        order: 'relevance',
        regionCode: 'KR',
        relevanceLanguage: 'ko',
        videoDuration: 'medium', // 4-20분 영상만
        videoDefinition: 'any',
        key: process.env.YOUTUBE_API_KEY!
      })

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (!response.ok) continue

      const data = await response.json()
      
      if (data.items) {
        for (const video of data.items) {
          if (results.length >= maxResults) break
          
          if (isEducationalVideo(video)) {
            results.push({
              id: `youtube-${results.length}`,
              type: '유튜브 영상',
              title: video.snippet.title,
              content: video.snippet.description.substring(0, 200) + '...',
              source: video.snippet.channelTitle,
              url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
              publishedDate: video.snippet.publishedAt.split('T')[0],
              reliability: calculateEducationalScore(video),
              summary: video.snippet.title,
              author: video.snippet.channelTitle
            })
          }
        }
      }
    }

    console.log(`[성공] 교육용 YouTube ${results.length}개 검색 완료`)
    return results

  } catch (error) {
    console.error('[오류] YouTube 검색 실패:', error)
    return []
  }
}

/**
 * 통합 안전 검색 함수
 */
export async function safeEvidenceSearch(
  topic: string,
  stance: string,
  types: string[]
): Promise<EvidenceResult[]> {
  console.log(`[시작] 안전 검색: ${topic} (${stance})`)
  
  const results: EvidenceResult[] = []
  
  try {
    // 1. 네이버 뉴스 검색 (안정적)
    if (types.includes('뉴스 기사')) {
      const newsResults = await searchNaverNews(topic, stance)
      results.push(...newsResults)
    }

    // 2. 교육용 YouTube 검색 (품질 강화)
    if (types.includes('유튜브 영상')) {
      const youtubeResults = await searchEducationalYouTube(topic, 5)
      results.push(...youtubeResults)
    }

    // 3. 교육적 적절성 최종 검증
    const safeResults = results.filter(result => 
      isSafeForEducation(result) && hasEducationalValue(result)
    )

    console.log(`[완료] 안전 검색: ${safeResults.length}개 결과`)
    return safeResults.slice(0, 10) // 최대 10개

  } catch (error) {
    console.error('[오류] 안전 검색 실패:', error)
    return []
  }
}

// === 헬퍼 함수들 ===

function generateEducationalQuery(query: string, stance: string): string {
  const baseQuery = query.replace(/[.?!]/g, '').trim()
  
  if (stance === 'positive') {
    return `${baseQuery} 장점 효과 교육`
  } else if (stance === 'negative') {
    return `${baseQuery} 문제점 단점 우려`
  }
  
  return `${baseQuery} 교육 초등`
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractSource(url: string): string {
  try {
    const domain = new URL(url).hostname
    const sourceMap: { [key: string]: string } = {
      'chosun.com': '조선일보',
      'donga.com': '동아일보', 
      'joongang.co.kr': '중앙일보',
      'hani.co.kr': '한겨레',
      'khan.co.kr': '경향신문',
      'ytn.co.kr': 'YTN',
      'kbs.co.kr': 'KBS',
      'mbc.co.kr': 'MBC',
      'sbs.co.kr': 'SBS'
    }
    
    for (const [domain_key, source] of Object.entries(sourceMap)) {
      if (domain.includes(domain_key)) return source
    }
    
    return domain
  } catch {
    return '출처 불명'
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

function isEducationallyAppropriate(item: any): boolean {
  const text = (item.title + item.description).toLowerCase()
  
  // 부적절한 키워드 검사
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (text.includes(keyword)) {
      console.log(`[필터링] 부적절한 콘텐츠: ${item.title}`)
      return false
    }
  }
  
  return true
}

function sanitizeQuery(query: string): string {
  return query
    .replace(/[^가-힣a-zA-Z0-9\s]/g, ' ') // 특수문자 제거
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 80) // 길이 제한
}

function isEducationalVideo(video: any): boolean {
  const title = video.snippet.title.toLowerCase()
  const channelTitle = video.snippet.channelTitle.toLowerCase()
  
  // 교육 채널 확인
  const isEducationalChannel = EDUCATIONAL_YOUTUBE_CHANNELS.some(channel =>
    channelTitle.includes(channel.toLowerCase())
  )
  
  // 교육 키워드 확인
  const educationalKeywords = [
    '교육', '학습', '초등', '어린이', '학교', 
    '선생님', '수업', '공부', '설명', '알려주는'
  ]
  
  const hasEducationalKeywords = educationalKeywords.some(keyword =>
    title.includes(keyword) || channelTitle.includes(keyword)
  )
  
  // 부적절한 콘텐츠 확인
  const hasInappropriateContent = INAPPROPRIATE_KEYWORDS.some(keyword =>
    title.includes(keyword) || channelTitle.includes(keyword)
  )
  
  return (isEducationalChannel || hasEducationalKeywords) && !hasInappropriateContent
}

function calculateEducationalScore(video: any): number {
  let score = 70 // 기본 점수
  
  const title = video.snippet.title.toLowerCase()
  const channelTitle = video.snippet.channelTitle.toLowerCase()
  
  // 교육 채널 보너스
  if (EDUCATIONAL_YOUTUBE_CHANNELS.some(channel => 
    channelTitle.includes(channel.toLowerCase())
  )) {
    score += 20
  }
  
  // 교육 키워드 보너스
  if (title.includes('교육') || title.includes('학습')) score += 10
  if (title.includes('초등') || title.includes('어린이')) score += 10
  
  return Math.min(score, 95) // 최대 95점
}

function isSafeForEducation(result: EvidenceResult): boolean {
  const text = (result.title + result.content).toLowerCase()
  
  return !INAPPROPRIATE_KEYWORDS.some(keyword => text.includes(keyword))
}

function hasEducationalValue(result: EvidenceResult): boolean {
  const text = (result.title + result.content).toLowerCase()
  
  const educationalIndicators = [
    '교육', '학습', '학생', '학교', '선생님', '수업',
    '연구', '조사', '분석', '통계', '정부', '기관',
    '전문가', '교수', '박사', '연구소'
  ]
  
  return educationalIndicators.some(indicator => text.includes(indicator))
}