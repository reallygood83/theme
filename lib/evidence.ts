// 근거자료 검색 관련 유틸리티 함수들 (원본 프로그램 완전 복제)

import { EvidenceResult, YouTubeVideoData, PerplexityResponse, YouTubeSearchResponse } from './types/evidence'

// 원본 프로그램과 동일한 설정
const PERPLEXITY_CONFIG = {
  model: 'sonar-pro',
  baseUrl: 'https://api.perplexity.ai/chat/completions'
}

const YOUTUBE_CONFIG = {
  baseUrl: 'https://www.googleapis.com/youtube/v3/search',
  maxResults: 30
}

// CORS 프록시 목록 (원본과 동일)
const corsProxies = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://corsproxy.io/?',
  'https://thingproxy.freeboard.io/fetch/'
]

// Perplexity API 호출 함수 (원본 완전 복제)
export async function callPerplexityAPI(prompt: string): Promise<any> {
  // 직접 호출 시도
  try {
    const response = await fetch(PERPLEXITY_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: PERPLEXITY_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `당신은 한국의 교육 전문가이자 정보 검색 전문가입니다. 주어진 토론 주제에 대해 신뢰할 수 있는 근거 자료를 찾아주세요.

응답 형식:
{
  "evidences": [
    {
      "type": "뉴스 기사|학술 자료|통계 자료|기타",
      "title": "자료 제목",
      "content": "자료의 핵심 내용 요약 (2-3문장)",
      "source": "출처 (신문사, 기관명 등)",
      "url": "실제 URL (없으면 빈 문자열)",
      "reliability": 85,
      "publishedDate": "YYYY-MM-DD",
      "author": "작성자명",
      "summary": "한 줄 요약"
    }
  ]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    })

    if (response.ok) {
      const data: PerplexityResponse = await response.json()
      const content = data.choices[0]?.message?.content
      
      try {
        // JSON 응답에서 코드 블록 제거
        let cleanContent = content
        if (cleanContent.includes('```json')) {
          cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/\n?```/g, '')
        }
        if (cleanContent.includes('```')) {
          cleanContent = cleanContent.replace(/```\n?/g, '').replace(/\n?```/g, '')
        }
        
        const parsed = JSON.parse(cleanContent.trim())
        console.log('✅ Perplexity JSON 파싱 성공:', parsed.evidences?.length || 0, '개')
        return parsed
      } catch (parseError) {
        console.error('❌ JSON 파싱 오류:', parseError)
        console.log('원본 응답:', content.substring(0, 500))
        
        // 간단한 구조로 대체 응답 생성
        const fallbackResponse = {
          evidences: [
            {
              type: "뉴스 기사",
              title: "검색 결과를 찾을 수 없음",
              content: "현재 해당 주제에 대한 구체적인 근거자료를 찾지 못했습니다. 다른 키워드로 다시 검색해보세요.",
              source: "시스템",
              url: "",
              reliability: 50,
              publishedDate: new Date().toISOString().split('T')[0],
              author: "",
              summary: "검색 결과 없음"
            }
          ]
        }
        return fallbackResponse
      }
    }
  } catch (error) {
    console.error('직접 API 호출 실패:', error)
  }

  // CORS 프록시를 통한 재시도
  for (let i = 0; i < corsProxies.length; i++) {
    try {
      console.log(`프록시 ${i+1} 시도중...`)
      const proxyUrl = corsProxies[i] + encodeURIComponent(PERPLEXITY_CONFIG.baseUrl)
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: PERPLEXITY_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: `당신은 한국의 교육 전문가이자 정보 검색 전문가입니다. 주어진 토론 주제에 대해 신뢰할 수 있는 근거 자료를 찾아주세요.

응답 형식:
{
  "evidences": [
    {
      "type": "뉴스 기사|학술 자료|통계 자료|기타",
      "title": "자료 제목",
      "content": "자료의 핵심 내용 요약 (2-3문장)",
      "source": "출처 (신문사, 기관명 등)",
      "url": "실제 URL (없으면 빈 문자열)",
      "reliability": 85,
      "publishedDate": "YYYY-MM-DD",
      "author": "작성자명",
      "summary": "한 줄 요약"
    }
  ]
}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.1
        })
      })

      if (response.ok) {
        const data: PerplexityResponse = await response.json()
        const content = data.choices[0]?.message?.content
        
        try {
          // JSON 응답에서 코드 블록 제거
          let cleanContent = content
          if (cleanContent.includes('```json')) {
            cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/\n?```/g, '')
          }
          if (cleanContent.includes('```')) {
            cleanContent = cleanContent.replace(/```\n?/g, '').replace(/\n?```/g, '')
          }
          
          const parsed = JSON.parse(cleanContent.trim())
          console.log('✅ 프록시를 통한 JSON 파싱 성공:', parsed.evidences?.length || 0, '개')
          return parsed
        } catch (parseError) {
          console.error('❌ 프록시 JSON 파싱 오류:', parseError)
          continue
        }
      }
    } catch (error) {
      console.error(`프록시 ${i+1} 실패:`, error)
      continue
    }
  }

  return null
}

// YouTube 검색 함수 (원본 완전 복제)
export async function searchYouTubeVideos(
  query: string, 
  maxResults: number = 30, 
  stance?: string
): Promise<YouTubeVideoData[]> {
  try {
    // 검색 쿼리 최적화
    let searchQuery = query
    if (stance) {
      searchQuery += stance === 'positive' ? ' 찬성 이유 근거' : ' 반대 이유 근거'
    }
    searchQuery += ' 토론 논쟁 의견 -광고 -홍보'

    const params = new URLSearchParams({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      maxResults: maxResults.toString(),
      order: 'relevance',
      regionCode: 'KR',
      relevanceLanguage: 'ko',
      key: process.env.YOUTUBE_API_KEY || ''
    })

    const response = await fetch(`${YOUTUBE_CONFIG.baseUrl}?${params}`)
    
    if (!response.ok) {
      console.error('YouTube API 오류:', response.status, response.statusText)
      return []
    }

    const data: YouTubeSearchResponse = await response.json()
    
    // 영상 길이와 품질 필터링
    const filteredVideos = data.items.filter((video: YouTubeVideoData) => {
      const title = video.snippet.title.toLowerCase()
      const description = video.snippet.description.toLowerCase()
      
      // 관련성 높은 영상만 선택
      const relevantKeywords = ['토론', '논쟁', '찬성', '반대', '의견', '근거', '이유', '분석']
      const hasRelevantKeywords = relevantKeywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      )
      
      // 광고성 콘텐츠 필터링
      const spamKeywords = ['광고', '홍보', '판매', '구매', '할인']
      const isSpam = spamKeywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      )
      
      return hasRelevantKeywords && !isSpam
    })

    return filteredVideos.slice(0, 15) // 최대 15개로 제한
  } catch (error) {
    console.error('YouTube 검색 오류:', error)
    return []
  }
}

// 검색 프롬프트 생성 함수 (개선된 버전)
export function generateSearchPrompt(topic: string, stance: string, selectedTypes: string[]): string {
  const stanceText = stance === 'positive' ? '찬성' : '반대'
  const typesText = selectedTypes.length > 0 ? selectedTypes.join(', ') : '모든 유형'
  
  return `토론 주제: "${topic}"
나의 입장: ${stanceText}
찾고자 하는 자료 유형: ${typesText}

위 토론 주제에 대해 ${stanceText} 입장을 뒷받침할 수 있는 신뢰할 수 있는 근거 자료를 찾아주세요.

${selectedTypes.includes('유튜브 영상') ? `
YouTube 영상은 다음 조건으로 찾아주세요:
- 토론, 강의, 다큐멘터리 형태의 교육적 영상
- 실제 접근 가능한 YouTube 링크 (https://www.youtube.com/watch?v=VIDEO_ID 형식)
- 신뢰할 수 있는 채널의 영상 (뉴스, 교육기관, 전문가)
` : ''}

다음을 중점적으로 찾아주세요:
1. 최신 뉴스 기사 (2020년 이후) - 실제 접근 가능한 링크 포함
2. 학술 논문이나 연구 자료 - DOI 또는 접근 가능한 URL 포함  
3. 정부 기관의 공식 통계 자료 - 공식 사이트 링크 포함
4. 전문가 의견이나 인터뷰 - 원문 링크 포함
${selectedTypes.includes('유튜브 영상') ? '5. 교육적 YouTube 영상 - 실제 video ID 포함' : ''}

**중요**: 각 자료는 실제로 존재하고 접근 가능한 링크여야 합니다.
가상의 링크나 존재하지 않는 자료는 포함하지 마세요.

각 자료마다 다음 정보를 정확히 포함해주세요:
- type: "뉴스 기사" | "학술 자료" | "통계 자료" | "유튜브 영상" | "기타"
- title: 정확한 자료 제목
- content: 핵심 내용 요약 (2-3문장, ${stanceText} 입장 근거 포함)
- source: 출처 (신문사명, 기관명, 저자명 등)
- url: **실제 접근 가능한 전체 URL** (http:// 또는 https:// 포함)
- reliability: 신뢰도 점수 (60-100)
- publishedDate: 발행일 (YYYY-MM-DD 형식)
- author: 작성자명 (있는 경우)
- summary: 한 줄 요약

총 10-15개의 다양하고 신뢰할 수 있는 근거 자료를 찾아주세요.
응답은 반드시 JSON 형식으로만 제공해주세요.`
}

// 검색 결과 처리 함수 (원본 로직 복제)
export function processEvidenceResults(
  perplexityData: any, 
  youtubeVideos: YouTubeVideoData[]
): EvidenceResult[] {
  const results: EvidenceResult[] = []
  
  // Perplexity 결과 처리
  if (perplexityData && perplexityData.evidences) {
    const nonYoutubeEvidences = perplexityData.evidences.filter(
      (item: any) => item.type !== '유튜브 영상' && item.type !== '유튜브-영상'
    )
    
    nonYoutubeEvidences.forEach((evidence: any, index: number) => {
      results.push({
        id: `evidence-${index}`,
        type: evidence.type || '기타',
        title: evidence.title || '제목 없음',
        content: evidence.content || evidence.summary || '',
        source: evidence.source || '출처 불명',
        url: evidence.url || '',
        reliability: evidence.reliability || 75,
        publishedDate: evidence.publishedDate || '',
        author: evidence.author || '',
        summary: evidence.summary || evidence.content?.substring(0, 100) + '...'
      })
    })
  }
  
  // YouTube 결과 처리
  youtubeVideos.forEach((video, index) => {
    results.push({
      id: `youtube-${index}`,
      type: '유튜브 영상',
      title: video.snippet.title,
      content: video.snippet.description.substring(0, 200) + '...',
      source: video.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      publishedDate: video.snippet.publishedAt.split('T')[0],
      videoData: video,
      summary: video.snippet.title,
      reliability: 80
    })
  })
  
  return results
}

// 검색 결과 검증 함수
export function validateEvidenceResults(results: EvidenceResult[]): EvidenceResult[] {
  return results.filter(result => {
    // 기본 필수 필드 검증
    if (!result.title || !result.content || !result.source) {
      return false
    }
    
    // 제목 길이 검증
    if (result.title.length < 5) {
      return false
    }
    
    // 내용 길이 검증  
    if (result.content.length < 20) {
      return false
    }
    
    return true
  })
}