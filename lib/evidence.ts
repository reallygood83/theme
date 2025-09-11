// 근거자료 검색 관련 유틸리티 함수들 (원본 프로그램 완전 복제)

import { EvidenceResult, YouTubeVideoData, PerplexityResponse, YouTubeSearchResponse } from './types/evidence'

// 원본 프로그램과 동일한 설정
const PERPLEXITY_CONFIG = {
  model: 'sonar-pro', // Perplexity 표준 모델명
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

// Perplexity API 호출 함수 (25초 타임아웃 적용)
export async function callPerplexityAPI(prompt: string): Promise<any> {
  // 25초 타임아웃으로 직접 호출
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25초 타임아웃
    
    const response = await fetch(PERPLEXITY_CONFIG.baseUrl, {
      signal: controller.signal,
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
            content: `당신은 한국의 초등교육 전문가이자 신뢰할 수 있는 정보 검색 전문가입니다. 초등학생(8-12세) 토론 교육을 위한 근거자료를 제공합니다.
      
**📚 초등학생 적합성 원칙**:
- 내용은 초등학생이 이해할 수 있는 쉬운 언어로 설명
- 복잡한 용어나 전문 용어는 피하고, 일상생활 예시로 대체
- 교육적 가치가 높고, 학교 수업에서 바로 활용 가능한 자료만

**🔍 자료 유형 지침**:
- 뉴스 기사: 2020년 이후 주요 언론사(KBS, MBC, SBS, 조선일보, 중앙일보, 한겨레, YTN 등) 실제 기사
- 유튜브 영상: EBS, KBS 교육, 학교 채널 등 교육적 콘텐츠 (5-15분 길이, 엔터테인먼트/광고 제외)

**🚨 URL 및 내용 엄격 규칙**:
- 뉴스: 실제 접근 가능한 전체 기사 URL만 (https://news.naver.com/... 형식). "원문 보기"나 요약 링크 금지. 기사 본문에서 핵심 2-3문단을 직접 인용 ( "...라고 기사에 쓰여있다" 형식 ).
- 유튜브: https://www.youtube.com/watch?v=VIDEO_ID 직접 링크. 영상 설명이나 자막에서 초등학생 수준의 100-150자 핵심 내용 요약.
- 불확실한 URL/내용은 절대 제공하지 말고 빈 문자열("")로 설정. 가짜/추측 정보 완전 금지.
- 신뢰도 낮은 자료(블로그, SNS, 확인 불가 출처)는 제외.

**📊 신뢰도 평가**:
- 1등급 (90+): 공영방송(KBS,MBC,EBS), 정부기관(교육부), 주요 종합지(조중동, 한경)
- 2등급 (70-89): 경제지(MK, 헤럴드), 전문지(교육전문지), 신뢰할 수 있는 유튜브 교육채널
- 3등급 (50-69): 지역신문, 시민단체 자료 (확인된 경우만)

응답 형식 (JSON만, 마크다운 없음):
{
  "evidences": [
    {
      "type": "뉴스 기사" | "유튜브 영상",
      "title": "실제 자료 제목 (전체)",
      "content": "자료 본문 핵심 내용 직접 인용 또는 상세 요약 (150-200자, 초등학생 이해 가능)",
      "source": "정확한 출처명 (KBS 뉴스, EBS 교육 등)",
      "url": "실제 직접 접근 URL (확실하지 않으면 \"\" )",
      "summary": "한 줄 요약 (20-30자)",
      "publishedDate": "YYYY-MM-DD (실제 날짜, 모르면 \"\" )",
      "author": "기자명 또는 채널명 (모르면 \"\" )",
      "reliability": 50-100 (신뢰도 점수),
      "keyPoints": ["핵심 논점 1 (쉬운 설명)", "핵심 논점 2", "핵심 논점 3"],
      "education_level": "초등 저학년" | "초등 고학년" | "모든 학년"
    }
  ]
}

**⚠️ 출력 규칙**:
- 총 4-6개 자료 (뉴스 2-3개 + 유튜브 2-3개 균형)
- 실제 존재하는 자료만 (가상 생성 금지)
- 초등학생 토론에 직접 활용 가능한 구체적 사례 포함
- 각 자료에 "이 자료가 토론에서 어떻게 도움이 될지" 간단 설명 추가 가능`
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
    
    clearTimeout(timeoutId)

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
    clearTimeout(timeoutId)
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
              content: `당신은 한국의 교육 전문가이자 정보 검색 전문가입니다. 주어진 토론 주제에 대해 **뉴스 기사**만 찾아주세요. 학술 자료나 통계 자료는 절대 포함하지 마세요.

**🚨 중요**: URL은 반드시 실제로 존재하는 뉴스 기사 링크만 제공하세요. 가짜 URL은 절대 금지입니다. URL이 확실하지 않으면 빈 문자열("")로 설정하세요.

응답 형식:
{
  "evidences": [
    {
      "type": "뉴스 기사",
      "title": "실제 존재하는 뉴스 기사 제목",
      "content": "뉴스 기사의 핵심 내용 요약 (2-3문장)",
      "source": "신문사명 (KBS, SBS, MBC, 연합뉴스, 조선일보, 중앙일보 등)",
      "url": "실제 접근 가능한 뉴스 기사 URL (확실하지 않으면 빈 문자열)",
      "reliability": 85,
      "publishedDate": "YYYY-MM-DD (실제 날짜, 모르면 빈 문자열)",
      "author": "실제 기자명 (모르면 빈 문자열)",
      "summary": "한 줄 요약"
    }
  ]
}

**URL 규칙**: 
- 확실한 뉴스 URL만 제공
- 추측이나 가짜 URL 절대 금지
- 불확실하면 url: "" 로 설정`
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

// 원본 프로그램의 JSON 파싱 함수 (완전 복제)
function parseEvidenceResponse(response: string): any {
  try {
    // JSON 응답에서 실제 JSON 부분만 추출
    let jsonStr = response.trim()
    
    // 마크다운 코드 블록 제거
    if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/)
      if (match) {
        jsonStr = match[1]
      }
    }
    
    // JSON 파싱
    const parsed = JSON.parse(jsonStr)
    
    if (parsed && (Array.isArray(parsed.evidences) || Array.isArray(parsed))) {
      console.log('✅ JSON 파싱 성공:', parsed)
      return parsed
    } else {
      throw new Error('잘못된 JSON 형식')
    }
  } catch (error) {
    console.error('JSON 파싱 실패:', error)
    console.log('원본 응답:', response)
    
    // 파싱 실패 시 기본값 반환
    return {
      evidences: [
        {
          type: '뉴스 기사',
          title: '검색 결과를 처리할 수 없습니다',
          content: '현재 검색 결과를 올바르게 처리할 수 없습니다. 다른 키워드로 다시 검색해보세요.',
          source: '시스템',
          url: '',
          summary: '검색 처리 오류',
          reliability: 50,
          keyPoints: ['다른 키워드로 재검색 필요']
        }
      ]
    }
  }
}

// 원본 프로그램의 키워드 생성 함수 (완전 복제)
function generateSearchKeywords(topic: string, selectedStance: string | null): string {
  // 기본 키워드 추출
  const keywords = topic.split(' ').filter(word => word.length > 1)
  
  // 교육 관련 키워드
  const educationKeywords = ['교육', '학습', '초등학교', '학생', '교사', '수업', '교실']
  
  // 신뢰성 키워드
  const sourceKeywords = ['연구', '조사', '통계', '분석', '전문가', '기관', '정부']
  
  // 입장별 키워드
  let stanceKeywords: string[] = []
  if (selectedStance) {
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

// 원본 프로그램의 검색 지시문 생성 함수 (완전 복제)
function createEvidenceSearchPrompt(topic: string, stance: string, types: string[], selectedStance: string | null = null): string {
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
  "evidences": [
    {
      "type": "뉴스 기사" | "학술 자료" | "통계 자료",
      "title": "자료 제목",
      "content": "핵심 내용 (초등학생 이해 수준)",
      "source": "출처",
      "url": "실제 접근 가능한 URL (확실하지 않으면 \"\")" ,
      "summary": "한 줄 요약",
      "relevance": "이 자료가 ${stanceDirection} 입장에 어떻게 도움이 되는지",
      "keyPoints": ["핵심 논점 1", "핵심 논점 2", "핵심 논점 3"],
      "reliability": 1-100 점수
    }
  ]
}

**중요**: ${stanceDirection} 입장 자료 3-4개, ${oppositeDirection} 입장 자료 1-2개 구성하여 총 4-6개 제공. 초등학생이 이해 가능한 설명으로 구성. 실제 존재하는 자료만 추천.`
}

// YouTube 검색 함수 (원본 완전 복제)
export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 50, // 증가
  stance?: string
): Promise<YouTubeVideoData[]> {
  try {
    // YouTube 검색 시작
    
    // API 키 확인
    if (!process.env.YOUTUBE_API_KEY) {
      return []
    }
    
    // 검색 쿼리 최적화 및 400 Bad Request 방지
    let searchQuery = query
      .replace(/[^가-힣a-zA-Z0-9\s]/g, ' ') // 특수문자 제거
      .replace(/\s+/g, ' ') // 연속 공백 정리
      .trim()
    
    // 기본 쿼리가 너무 짧으면 검색 결과가 없을 수 있으므로 최소 길이 확보
    if (searchQuery.length < 2) {
      searchQuery = query.trim() // 원본 쿼리 사용
    }
    
    // stance 키워드는 선택적으로만 추가 (검색 결과를 너무 제한하지 않도록)
    if (stance && searchQuery.length < 30) {
      if (stance === 'positive' || stance === 'supporting') {
        searchQuery += ' 장점'
      } else if (stance === 'negative' || stance === 'opposing') {
        searchQuery += ' 단점'
      }
    }
    
    // 최종 쿼리 길이 제한 (YouTube API 제한 고려)
    if (searchQuery.length > 80) {
      searchQuery = searchQuery.substring(0, 80).trim()
    }
    

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
    
    // 15초 타임아웃으로 YouTube API 호출
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    const response = await fetch(fullUrl, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error('❌ YouTube API 오류:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ YouTube API 에러 응답:', errorText)
      return []
    }

    const data: YouTubeSearchResponse = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return []
    }
    
    // 영상 품질과 교육적 가치 필터링 (참고 프로그램과 동일)
    const filteredVideos = data.items.map((video: YouTubeVideoData) => {
      const title = video.snippet.title.toLowerCase()
      const channelTitle = video.snippet.channelTitle.toLowerCase()
      
      
      // 교육적 채널 우선 (EBS, KBS, 교육부 등)
      const isEducational = channelTitle.includes('ebs') || 
                          channelTitle.includes('kbs') || 
                          channelTitle.includes('교육') ||
                          channelTitle.includes('학교') ||
                          channelTitle.includes('edu')
      
      // 교육 관련 키워드 점수 (더 관대하게 수정)
      const educationScore = (title.includes('교육') ? 2 : 0) + 
                            (title.includes('초등') ? 2 : 0) +
                            (title.includes('학교') ? 1 : 0) +
                            (title.includes('토론') ? 2 : 0) +
                            (title.includes('학습') ? 1 : 0) +
                            (title.includes('아이') ? 1 : 0) +
                            (title.includes('어린이') ? 1 : 0) +
                            (isEducational ? 3 : 0)
      
      return {
        ...video,
        educationScore,
        isEducational
      }
    }).filter(video => {
      // 모든 영상 포함 (점수 제한 제거)
      const isValid = true // video.educationScore >= 0 으로 모든 영상 포함
      return isValid
    }).sort((a, b) => {
      // 교육 점수가 높은 순으로 정렬
      return b.educationScore - a.educationScore
    })

    
    const finalResults = filteredVideos.slice(0, 10) // 최대 10개로 제한 (성능 최적화)
    
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
  
  // 뉴스 기사 + 유튜브 제안 (Perplexity가 직접 검색 못하지만, 관련 정보 요청)
  if (selectedTypes.includes('뉴스 기사')) {
    instructions.push(`${counter}. 최신 뉴스 기사 (2020년 이후) - 네이버 뉴스, 다음 뉴스, 조선일보, 중앙일보, 동아일보, 한겨레, 경향신문, YTN, KBS, MBC, SBS 등 주요 언론사의 실제 접근 가능한 전체 기사 링크와 핵심 내용 추출. "원문 보기"나 요약만 제공하지 말고, 기사 본문의 주요 문단을 직접 인용하세요.`)
    counter++
  }
  if (selectedTypes.includes('유튜브 영상')) {
    instructions.push(`${counter}. 유튜브 영상 추천 - 교육적 가치가 높은 EBS, KBS 교육, 학교 채널 등에서 토론 주제 관련 영상 제안. 영상 ID나 URL과 함께 1-2분 핵심 내용 요약 제공.`)
    counter++
  }
  
  // 유튜브 영상은 별도 API로 처리하므로 여기서는 제외
  // 학술 자료와 통계 자료 검색 로직 완전 제거
  
  if (instructions.length === 0) {
    return '다음을 중점적으로 찾아주세요:\n1. 신뢰할 수 있는 뉴스 기사만 검색합니다. 학술 자료나 통계 자료는 포함하지 않습니다.'
  }
  
  return `다음을 중점적으로 찾아주세요:\n${instructions.join('\n')}`
}

// 메인 검색 함수 - 원본 프로그램의 완전한 병렬 처리 로직
export async function searchEvidence(
  topic: string,
  stance: string,
  types: string[],
  selectedStance: string | null = null,
  onProgress?: (step: number, message: string) => void
): Promise<EvidenceResult[]> {
  let results: EvidenceResult[] = []
  
  try {
    // 1단계: 검색 준비
    if (onProgress) onProgress(1, '검색 준비 중...')
    
    // 검색 쿼리 생성
    const searchPrompt = generateSearchPrompt(topic, stance, types, selectedStance)
    const youtubeQuery = topic + (selectedStance === 'supporting' ? ' 장점' : selectedStance === 'opposing' ? ' 단점' : '')
    
    // 2단계: Perplexity와 YouTube 병렬 검색
    if (onProgress) onProgress(2, 'AI 검색 시작...')
    
    const [perplexityData, youtubeVideos] = await Promise.all([
      callPerplexityAPI(searchPrompt).catch(error => {
        console.error('Perplexity 검색 오류:', error)
        return null
      }),
      types.includes('유튜브 영상') ? 
        searchYouTubeVideos(youtubeQuery, 10, selectedStance ?? undefined).catch(error => {
          console.error('YouTube 검색 오류:', error)
          return []
        }) : 
        Promise.resolve([])
    ])
    
    // 3단계: 결과 처리
    if (onProgress) onProgress(3, '검색 결과 처리 중...')
    
    results = processEvidenceResults(perplexityData, youtubeVideos)
    
    // 4단계: 결과 검증 및 정리
    if (onProgress) onProgress(4, '결과 검증 중...')
    
    results = validateEvidenceResults(results)
    
    // 5단계: 완료
    if (onProgress) onProgress(5, '검색 완료!')
    
    return results.slice(0, 10) // 최대 10개 결과
    
  } catch (error) {
    console.error('근거자료 검색 오류:', error)
    return []
  }
}

// Perplexity API 프롬프트 생성 (참고 프로그램과 완전 동일)
export function generateSearchPrompt(topic: string, stance: string, types: string[], selectedStance: string | null = null): string {
  // 유튜브 포함하여 균형 있게 요청 (Perplexity가 추천 형식으로)
  const allTypes = types.filter(type => type !== '학술 자료' && type !== '통계 자료') // 학술/통계 제외
  
  // 입장별 검색 전략 설정
  const stanceDirection = selectedStance === 'supporting' ? '찬성' : '반대'
  const oppositeDirection = selectedStance === 'supporting' ? '반대' : '찬성'
  
  // 키워드 추출 및 확장
  const keywordSuggestions = generateSearchKeywords(topic, selectedStance)
  
  // 자료 유형 설명
  const typeDescriptions = allTypes.map(type => {
    if (type === '뉴스 기사') return '최신 뉴스 기사 (2020년 이후, 주요 언론사: 네이버, 조선일보, 중앙일보 등) - 실제 전체 기사 링크와 본문 주요 문단 직접 인용 필수'
    if (type === '유튜브 영상') return '교육적 유튜브 영상 (EBS, KBS 교육, 학교 채널 등) - 영상 URL과 1-2분 핵심 내용 요약'
    return type
  }).join(', ')
  
  return `🎯 토론 근거자료 검색 (초등교육 특화) - 뉴스와 유튜브 균형 있게

📋 검색 기본 정보:
- 토론 주제: ${topic}
- 사용자 입장: ${stance}
- 입장 분류: ${stanceDirection} 입장
- 대상: 초등학생 (8-12세)

🔍 검색 전략:
- 주요 검색 (70%): ${stanceDirection} 입장을 뒷받침하는 강력한 근거자료
- 보조 검색 (30%): ${oppositeDirection} 입장 자료 (반박 준비용)
- 교육적 적합성: 초등학생이 이해 가능한 수준의 자료
- **균형**: 뉴스 기사와 유튜브 영상을 50:50 비율로 제공 (각 최소 2개씩, 총 4-6개)
- **YouTube API fallback**: YouTube API 오류 시 Perplexity에서 직접 YouTube 검색 결과 제공
- **400 Bad Request 방지**: 검색 키워드를 단순화하고 특수문자 제거

📚 검색할 자료 유형: ${typeDescriptions}

🎯 검색 키워드 가이드:
${keywordSuggestions}

📊 신뢰도 기준:
- 1등급: 정부기관(교육부), 주요 언론사 (KBS, MBC, 조선일보 등), EBS
- 2등급: 교육단체, 학교 채널, 신뢰할 수 있는 유튜버
- 3등급: 시민단체, 해외 교육 기관

**🚨 URL 및 내용 규칙 (매우 중요)**:
- 뉴스 기사: 실제 접근 가능한 전체 기사 URL만 제공 (예: nytimes.com/full-article, chosun.com/article/123). "원문 보기"나 요약 링크 금지. 기사 본문에서 핵심 2-3문단을 직접 인용하여 content에 포함 (최소 150자 이상). 유효한 풀 URL을 2개 이상 확보.
- 유튜브: https://www.youtube.com/watch?v=VIDEO_ID 형식의 직접 URL. 영상 설명이나 자막에서 초등학생 수준의 핵심 내용 100-150자 요약. 구체적 비디오 제목, URL, 타임스탬프 포함하여 2개 이상 제공.
- 불확실한 URL은 절대 제공하지 말고 빈 문자열("")로 설정. 가짜/추측 URL 금지.
- 주제 관련성: 검색 주제와 직접적으로 관련된 자료만 선별. 일반적이거나 간접적인 자료는 제외.

다음 JSON 형식으로 응답해주세요:

{
  "topic": "${topic}",
  "stance": "${stance}",
  "stanceDirection": "${stanceDirection}",
  "evidences": [
    {
      "type": "뉴스 기사" | "유튜브 영상",
      "title": "자료 제목 (실제 제목 그대로)",
      "content": "뉴스: 기사 본문 직접 인용 (최소 150자) | 유튜브: 핵심 내용 요약 (100-150자)",
      "source": "언론사명" | "채널명",
      "url": "실제 접근 가능한 직접 URL (확실하지 않으면 \"\" )",
      "summary": "한 줄 요약 (초등학생 이해 가능)",
      "relevance": "이 자료가 ${stanceDirection} 입장에 어떻게 도움이 되는지 (1-2문장)",
      "keyPoints": ["핵심 논점 1", "핵심 논점 2", "핵심 논점 3"],
      "stance_support": "${stanceDirection}" | "${oppositeDirection}",
      "credibility_level": 1 | 2 | 3,
      "education_relevance": "high" | "medium" | "low",
      "debate_utility": "주장 강화" | "반박 준비" | "배경 이해",
      "publishedDate": "YYYY-MM-DD (실제 날짜, 모르면 \"\" )",
      "timestamp": "유튜브 영상의 경우 핵심 내용 시작 시간 (예: 1:23, 선택사항)"
    }
  ]
}

**🚨 중요 지침:**
- ${stanceDirection} 입장 자료 3-4개, ${oppositeDirection} 입장 자료 1-2개 구성 (뉴스 2개 + 유튜브 2개 균형)
- 초등학생 눈높이에 맞는 쉬운 설명과 구체적 사례 포함 (어려운 용어 피함)
- 교육과정과 연계 가능한 자료 우선 선택 (학교 생활, 일상 예시)
- 반드시 실제 존재하는 자료만 추천 (가상 URL/내용 금지)
- 각 신뢰도 등급별로 최소 1개씩 포함하여 다양성 확보
- 뉴스: 기사 본문 직접 인용 ( "기사에서 '...'라고 언급했다" 형식 )
- 유튜브: 영상 길이 5-15분 교육 콘텐츠 우선, 엔터테인먼트/광고 제외
- 복잡한 내용은 초등학생이 이해할 수 있는 해석과 예시로 설명

**출력 형식**: JSON만 제공. 마크다운이나 추가 설명 없음.`
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
      // URL 정리 및 검증
      let cleanUrl = evidence.url || ''
      if (cleanUrl) {
        // CORS proxy URL unwrapping
        if (cleanUrl.includes('api.allorigins.win/raw?url=')) {
          try {
            const urlParam = new URLSearchParams(cleanUrl.split('?')[1])
            const originalUrl = urlParam.get('url')
            if (originalUrl) {
              cleanUrl = decodeURIComponent(originalUrl)
              }
          } catch (error) {
          }
        }
        
        // 뉴스 URL 특별 처리
        if (evidence.type === '뉴스 기사') {
          // 네이버 뉴스 URL 정리
          if (cleanUrl.includes('n.news.naver.com') && !cleanUrl.includes('/article/')) {
            cleanUrl = ''
          }
          // 다음 뉴스 URL 정리
          else if (cleanUrl.includes('v.daum.net/v/') && cleanUrl.length < 50) {
            cleanUrl = ''
          }
          // 기타 메인 페이지 URL 필터링
          else if (cleanUrl.match(/\.(com|co\.kr|net)\/?(index\.html?)?$/)) {
            cleanUrl = ''
          }
        }
        
      }
      
      results.push({
        id: `evidence-${index}`,
        type: evidence.type || '기타',
        title: evidence.title || '제목 없음',
        content: evidence.content || evidence.summary || '',
        source: evidence.source || '출처 불명',
        url: cleanUrl,
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
    'newsis.com', 'yonhapnews.co.kr', 'yna.co.kr', 'edaily.co.kr', 'seoul.co.kr',
    'hankyung.com', 'hankookilbo.com', 'sisain.co.kr', 'ohmynews.com',
    'pressian.com', 'moneytoday.co.kr', 'etnews.com', 'zdnet.co.kr'
  ]
  
  try {
    const urlObj = new URL(url)
    
    // 메인 페이지 또는 잘못된 URL 차단
    if (urlObj.pathname === '/' || urlObj.pathname === '/index.html' || urlObj.pathname === '/index.htm') {
      return false
    }
    
    // 네이버 뉴스 특별 검증
    if (urlObj.hostname.includes('naver.com')) {
      // n.news.naver.com/article/xxx/xxx 형태만 허용
      if (!urlObj.pathname.includes('/article/') || urlObj.pathname.split('/').length < 4) {
        return false
      }
    }
    
    // 다음 뉴스 특별 검증
    if (urlObj.hostname.includes('daum.net')) {
      // v.daum.net/v/20240101/xxx 형태만 허용
      if (!urlObj.pathname.includes('/v/') || urlObj.pathname.length < 15) {
        return false
      }
    }
    
    // 도메인 매칭 검증
    const isDomainValid = trustedNewsDomains.some(domain =>
      urlObj.hostname.includes(domain) ||
      urlObj.hostname.endsWith('.' + domain) ||
      urlObj.hostname.endsWith(domain)
    )
    
    if (isDomainValid) {
      return true
    } else {
      return false
    }
    
  } catch {
    return false
  }
}

// 검색 결과 검증 함수 (강화된 버전)
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
    
    // URL 검증 (더 관대하게 수정)
    if (result.type === '뉴스 기사') {
      if (result.url && !isValidNewsUrl(result.url)) {
        result.url = '' // URL 제거하고 결과는 포함
      }
    } else if (result.type === '유튜브 영상') {
      if (!result.url || !result.url.includes('youtube.com/watch')) {
        return false
      }
    } else {
      // 기타 유형은 URL 없어도 포함
      if (result.url && !isValidUrl(result.url)) {
        result.url = '' // URL 제거하고 결과는 포함
      }
    }
    
    return true
  })
}