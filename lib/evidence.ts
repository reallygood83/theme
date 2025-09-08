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
    console.log('🎬 YouTube 검색 시작:', { query, maxResults, stance })
    
    // API 키 확인
    if (!process.env.YOUTUBE_API_KEY) {
      console.error('❌ YouTube API 키가 없습니다!')
      return []
    }
    console.log('✅ YouTube API 키 확인됨')
    
    // 검색 쿼리 최적화
    let searchQuery = query
    if (stance) {
      searchQuery += stance === 'positive' ? ' 찬성 이유 근거' : ' 반대 이유 근거'
    }
    searchQuery += ' 토론 논쟁 의견 -광고 -홍보'
    console.log('🔍 YouTube 검색 쿼리:', searchQuery)

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

    const fullUrl = `${YOUTUBE_CONFIG.baseUrl}?${params}`
    console.log('📡 YouTube API 호출 URL:', fullUrl.replace(process.env.YOUTUBE_API_KEY || '', '[API_KEY]'))
    
    const response = await fetch(fullUrl)
    
    if (!response.ok) {
      console.error('❌ YouTube API 오류:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ YouTube API 에러 응답:', errorText)
      return []
    }

    const data: YouTubeSearchResponse = await response.json()
    console.log('📊 YouTube API 응답 수신:', data.items ? data.items.length : 0, '개 영상')
    
    if (!data.items || data.items.length === 0) {
      console.log('❌ YouTube 검색 결과가 없습니다')
      return []
    }
    
    // 영상 길이와 품질 필터링
    const filteredVideos = data.items.filter((video: YouTubeVideoData) => {
      const title = video.snippet.title.toLowerCase()
      const description = video.snippet.description.toLowerCase()
      
      console.log('🎬 영상 검토:', video.snippet.title.substring(0, 50))
      
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
      
      const isValid = hasRelevantKeywords && !isSpam
      console.log(isValid ? '✅' : '❌', '영상 필터링 결과:', video.snippet.title.substring(0, 30))
      
      return isValid
    })

    console.log('🎯 필터링 완료:', filteredVideos.length, '개 영상 선별')
    
    const finalResults = filteredVideos.slice(0, 15) // 최대 15개로 제한
    console.log('📤 YouTube 검색 결과 반환:', finalResults.length, '개 영상')
    
    return finalResults
  } catch (error) {
    console.error('YouTube 검색 오류:', error)
    return []
  }
}

// 선택된 유형에 따른 검색 지시문 생성
function generateSearchInstructions(selectedTypes: string[], stanceText: string): string {
  const instructions: string[] = []
  let counter = 1
  
  if (selectedTypes.includes('뉴스 기사')) {
    instructions.push(`${counter}. 최신 뉴스 기사 (2020년 이후) - 네이버, 다음, 조선일보, 중앙일보, 동아일보, 한겨레, 경향신문, YTN, KBS, MBC, SBS 등 신뢰할 수 있는 언론사의 실제 접근 가능한 링크만 포함`)
    counter++
  }
  
  if (selectedTypes.includes('학술 자료')) {
    instructions.push(`${counter}. 학술 논문이나 연구 자료 - DOI 또는 접근 가능한 URL 포함`)
    counter++
  }
  
  if (selectedTypes.includes('통계 자료')) {
    instructions.push(`${counter}. 정부 기관의 공식 통계 자료 - 공식 사이트 링크 포함`)
    counter++
  }
  
  if (selectedTypes.includes('기타')) {
    instructions.push(`${counter}. 전문가 의견이나 인터뷰 - 원문 링크 포함`)
    counter++
  }
  
  if (selectedTypes.includes('유튜브 영상')) {
    instructions.push(`${counter}. 교육적 YouTube 영상 - 실제 video ID 포함`)
    counter++
  }
  
  if (instructions.length === 0) {
    return '다음을 중점적으로 찾아주세요:\n1. 요청하신 자료 유형에 맞는 신뢰할 수 있는 근거 자료'
  }
  
  return `다음을 중점적으로 찾아주세요:\n${instructions.join('\n')}`
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

${generateSearchInstructions(selectedTypes, stanceText)}

**중요**: 각 자료는 실제로 존재하고 접근 가능한 링크여야 합니다.
- 뉴스 기사: 반드시 신뢰할 수 있는 언론사의 실제 기사 링크만 제공 (naver.com, daum.net, chosun.com, joongang.co.kr, donga.com, hani.co.kr, khan.co.kr, ytn.co.kr, kbs.co.kr, mbc.co.kr, sbs.co.kr 등)
- 유튜브 영상: youtube.com/watch?v= 형식의 실제 영상 링크만 제공
- 가상의 링크나 존재하지 않는 자료는 절대 포함하지 마세요

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

// URL 유효성 검증 함수
function isValidUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// 뉴스 기사 URL 검증 함수 (신뢰할 수 있는 뉴스 사이트만)
function isValidNewsUrl(url: string): boolean {
  if (!isValidUrl(url)) return false
  
  const trustedNewsDomains = [
    'naver.com', 'daum.net', 'chosun.com', 'donga.com', 'joongang.co.kr',
    'hani.co.kr', 'khan.co.kr', 'mt.co.kr', 'mk.co.kr', 'ytn.co.kr',
    'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr', 'jtbc.co.kr', 'news1.kr',
    'newsis.com', 'yonhapnews.co.kr', 'edaily.co.kr', 'seoul.co.kr'
  ]
  
  try {
    const urlObj = new URL(url)
    return trustedNewsDomains.some(domain => 
      urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
    )
  } catch {
    return false
  }
}

// 검색 결과 검증 함수 (강화된 버전)
export function validateEvidenceResults(results: EvidenceResult[]): EvidenceResult[] {
  return results.filter(result => {
    console.log('🔍 검증 중:', result.type, result.title)
    
    // 기본 필수 필드 검증
    if (!result.title || !result.content || !result.source) {
      console.log('❌ 필수 필드 누락:', result.title)
      return false
    }
    
    // 제목 길이 검증
    if (result.title.length < 5) {
      console.log('❌ 제목 너무 짧음:', result.title)
      return false
    }
    
    // 내용 길이 검증  
    if (result.content.length < 20) {
      console.log('❌ 내용 너무 짧음:', result.title)
      return false
    }
    
    // URL 검증 (뉴스 기사의 경우 더 엄격하게)
    if (result.type === '뉴스 기사') {
      if (!isValidNewsUrl(result.url)) {
        console.log('❌ 유효하지 않은 뉴스 URL:', result.url)
        return false
      }
      console.log('✅ 유효한 뉴스 기사:', result.title)
    } else if (result.type === '유튜브 영상') {
      if (!result.url || !result.url.includes('youtube.com/watch')) {
        console.log('❌ 유효하지 않은 YouTube URL:', result.url)
        return false
      }
      console.log('✅ 유효한 YouTube 영상:', result.title)
    } else {
      // 기타 유형은 기본 URL 검증
      if (result.url && !isValidUrl(result.url)) {
        console.log('❌ 유효하지 않은 URL:', result.url)
        return false
      }
    }
    
    console.log('✅ 검증 통과:', result.title)
    return true
  })
}