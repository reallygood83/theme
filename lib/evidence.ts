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

// 키워드 생성 함수 (원본 프로그램과 동일)
function generateSearchKeywords(topic: string, selectedStance: string | null): string {
  // 기본 키워드 추출
  const keywords = topic.split(' ').filter(word => word.length > 1)
  
  // 교육 관련 키워드
  const educationKeywords = ['교육', '학습', '초등학교', '학생', '교사', '수업', '교실']
  
  // 신뢰성 키워드
  const sourceKeywords = ['연구', '조사', '통계', '분석', '전문가', '기관', '정부']
  
  // 입장별 키워드 (의문문 토론 주제 감지)
  let stanceKeywords: string[] = []
  if (selectedStance && (topic.includes('?') || topic.includes('할까') || topic.includes('될까'))) {
    if (selectedStance === 'supporting') {
      stanceKeywords = ['장점', '효과', '도움', '필요성', '긍정적']
    } else if (selectedStance === 'opposing') {
      stanceKeywords = ['단점', '문제점', '위험성', '부작용', '우려']
    }
  }
  
  const allKeywords = [...keywords, ...stanceKeywords.slice(0, 2)]
  const selectedKeywords = allKeywords.filter(keyword => keyword.length > 1).slice(0, 8)
  
  return `주요 검색어: ${selectedKeywords.join(', ')}
- 교육 관련: ${educationKeywords.slice(0, 4).join(', ')}
- 신뢰성 출처: ${sourceKeywords.slice(0, 4).join(', ')}`
}

// Perplexity API 프롬프트 생성 (참고 프로그램과 완전 동일)
export function generateSearchPrompt(topic: string, stance: string, types: string[], selectedStance: string | null = null): string {
  // 유튜브 영상은 별도 API로 처리하므로 제외
  const nonYoutubeTypes = types.filter(type => type !== '유튜브 영상')
  
  // 입장별 검색 전략 설정
  const stanceDirection = selectedStance === 'supporting' ? '찬성' : '반대'
  const oppositeDirection = selectedStance === 'supporting' ? '반대' : '찬성'
  
  // 키워드 추출 및 확장
  const keywordSuggestions = generateSearchKeywords(topic, selectedStance)
  
  return `🎯 토론 근거자료 검색 (초등교육 특화)

📋 검색 기본 정보:
- 토론 주제: ${topic}
- 사용자 입장: ${stance}
- 입장 분류: ${stanceDirection} 입장
- 대상: 초등학생 (8-12세)

🔍 검색 전략:
- 주요 검색 (70%): ${stanceDirection} 입장을 뒷받침하는 강력한 근거자료
- 보조 검색 (30%): ${oppositeDirection} 입장 자료 (반박 준비용)
- 교육적 적합성: 초등학생이 이해 가능한 수준의 자료

📚 검색할 자료 유형: ${nonYoutubeTypes.join(', ')}

🎯 검색 키워드 가이드:
${keywordSuggestions}

📊 신뢰도 기준:
- 1등급: 정부기관(교육부, 통계청), 국책연구원
- 2등급: 대학 연구소, 교육단체, 주요 언론사  
- 3등급: 전문지, 시민단체, 해외 신뢰기관

다음 JSON 형식으로 응답해주세요:

{
  "topic": "${topic}",
  "stance": "${stance}",
  "stanceDirection": "${stanceDirection}",
  "evidences": [
    {
      "type": "뉴스 기사" | "학술 자료" | "통계 자료",
      "title": "자료 제목",
      "summary": "자료 요약 (초등학생도 이해할 수 있게 100자 내외)",
      "source": "출처",
      "url": "URL (실제 존재하는 URL만)",
      "relevance": "이 자료가 사용자 입장에 어떻게 도움이 되는지",
      "keyPoints": ["핵심 논점 1", "핵심 논점 2", "핵심 논점 3"],
      "stance_support": "${stanceDirection}" | "${oppositeDirection}",
      "credibility_level": 1 | 2 | 3,
      "education_relevance": "high" | "medium" | "low",
      "debate_utility": "주장 강화" | "반박 준비" | "배경 이해"
    }
  ]
}

**🚨 중요 지침:**
- ${stanceDirection} 입장 자료 3-4개, ${oppositeDirection} 입장 자료 1-2개 구성
- 초등학생 눈높이에 맞는 쉬운 설명과 구체적 사례 포함
- 교육과정과 연계 가능한 자료 우선 선택
- 반드시 실제 존재하는 자료만 추천 (가상 URL 금지)
- 각 신뢰도 등급별로 최소 1개씩 포함하여 다양성 확보
- 복잡한 통계는 초등학생이 이해할 수 있는 해석 제공`
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