import { NextRequest, NextResponse } from 'next/server'
import { 
  callPerplexityAPI, 
  searchYouTubeVideos, 
  generateSearchPrompt, 
  processEvidenceResults,
  validateEvidenceResults 
} from '@/lib/evidence'
import { EvidenceSearchRequest, EvidenceSearchResponse } from '@/lib/types/evidence'
import { checkTopicAppropriateness, filterSearchResults, generateStudentMessage } from '@/lib/content-filter'

// 원본 프로그램과 동일한 검색 로직
export async function POST(request: NextRequest) {
  try {
    const { topic, stance, selectedTypes }: EvidenceSearchRequest = await request.json()
    
    console.log('🔍 근거자료 검색 시작:', { topic, stance, selectedTypes })
    
    // 1단계: 기본 입력 검증
    if (!topic || !stance) {
      return NextResponse.json(
        { error: '토론 주제와 입장을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 2단계: 극단적인 경우만 사전 차단 (원본 프로그램 방식)
    const contentCheck = checkTopicAppropriateness(topic)
    console.log('🛡️ 간단한 적절성 검사:', contentCheck.severity)

    // 'blocked' 수준만 사전 차단, 'warning'은 검색 허용
    if (contentCheck.severity === 'blocked') {
      console.warn('🚫 극단적 주제 사전 차단:', topic, '- 이유:', contentCheck.reason)
      return NextResponse.json(
        { 
          error: generateStudentMessage(contentCheck),
          blocked: true,
          severity: contentCheck.severity,
          suggestedAlternative: contentCheck.suggestedAlternative
        },
        { status: 400 }
      )
    }

    // 경고나 일반 주제는 모두 검색 진행
    if (contentCheck.severity === 'warning') {
      console.log('⚠️ 민감한 주제이지만 검색 진행:', topic)
    } else {
      console.log('✅ 일반 주제 검색 진행:', topic)
    }
    
    // API 키 검증
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('❌ PERPLEXITY_API_KEY가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: 'API 설정 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
    
    if (!process.env.YOUTUBE_API_KEY) {
      console.error('❌ YOUTUBE_API_KEY가 설정되지 않았습니다. YouTube 검색이 불가능합니다.')
      console.log('💡 .env 파일에 YOUTUBE_API_KEY를 추가해주세요. Google Cloud Console에서 YouTube Data API v3 키를 발급받으세요.')
      console.log('🔗 발급 가이드: https://developers.google.com/youtube/v3/getting-started')
    }
    
    // 입장 정보 변환 (참고 프로그램과 동일)
    const selectedStance = stance === 'positive' ? 'supporting' : 'opposing'
    
    // 검색 프롬프트 생성 (참고 프로그램과 동일하게 selectedStance 전달)
    const prompt = generateSearchPrompt(topic, stance, selectedTypes || [], selectedStance)
    console.log('📝 생성된 프롬프트:', prompt.substring(0, 200) + '...')
    
    // 🚀 원본 프로그램과 동일한 병렬 검색 (Promise.all)
    console.log('⚡ 병렬 검색 시작: Perplexity + YouTube 동시 호출')
    
    // 병렬로 Perplexity API와 YouTube API 호출 (원본과 동일)
    const [perplexityData, youtubeVideos] = await Promise.all([
      callPerplexityAPI(prompt).catch(error => {
        console.error('❌ Perplexity API 오류:', error)
        return null
      }),
      searchYouTubeVideos(topic, 30, selectedStance).catch(error => {
        console.error('❌ YouTube API 오류:', error)
        return []
      })
    ])
    
    console.log('📊 검색 결과 수집 완료:')
    console.log('- Perplexity 결과:', perplexityData ? 'O' : 'X')
    console.log('- YouTube 결과 수:', Array.isArray(youtubeVideos) ? youtubeVideos.length : 0)
    
    // YouTube 결과 상세 로깅
    if (Array.isArray(youtubeVideos) && youtubeVideos.length > 0) {
      console.log('🎬 YouTube 검색 성공! 영상 목록:')
      youtubeVideos.forEach((video, index) => {
        console.log(`  ${index + 1}. ${video.snippet.title}`)
      })
    } else {
      console.log('❌ YouTube 검색 실패 또는 결과 없음')
    }
    
    // 결과 처리 및 합성 (원본 프로그램 방식)
    const evidenceResults = processEvidenceResults(perplexityData, youtubeVideos)
    console.log('🔗 결과 합성 완료:', evidenceResults.length + '개')
    
    // 검증만 수행 (기본적인 데이터 구조 검증)
    const validatedResults = validateEvidenceResults(evidenceResults)
    console.log('✅ 기본 검증 완료:', validatedResults.length + '개 유효한 결과')
    
    // 3단계: 최종 결과에만 완화된 콘텐츠 필터링 적용 (시간 효율성)
    const safeResults = filterSearchResults(validatedResults)
    console.log('🛡️ 완화된 콘텐츠 필터링 적용:', validatedResults.length, '→', safeResults.length, '개')
    
    // 결과가 없는 경우 처리 - 신뢰성 우선 (Always Works™)
    if (validatedResults.length === 0) {
      // 필터링으로 인한 결과 부족인지 확인
      const wasFiltered = evidenceResults.length > safeResults.length
      const message = wasFiltered 
        ? '교육에 적합하지 않은 내용이 필터링되었습니다. 더 교육적인 키워드로 검색해보세요.' 
        : '현재 신뢰할 수 있는 검색 결과를 찾을 수 없습니다. 잠시 후 다시 시도하거나 다른 키워드로 검색해보세요.'
      
      return NextResponse.json({
        evidences: [],
        totalCount: 0,
        searchQuery: topic,
        timestamp: new Date(),
        message,
        filtered: wasFiltered
      })
    }
    
    // 성공 응답
    const response: EvidenceSearchResponse = {
      evidences: validatedResults,
      totalCount: validatedResults.length,
      searchQuery: topic,
      timestamp: new Date()
    }
    
    console.log('🎉 검색 완료! 총', validatedResults.length, '개의 근거자료를 찾았습니다.')
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ 근거자료 검색 중 오류 발생:', error)
    
    return NextResponse.json(
      { 
        error: '근거자료 검색 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// GET 요청으로 API 상태 확인
export async function GET() {
  const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY
  const hasYouTubeKey = !!process.env.YOUTUBE_API_KEY
  
  return NextResponse.json({
    status: 'active',
    apis: {
      perplexity: hasPerplexityKey ? 'configured' : 'missing',
      youtube: hasYouTubeKey ? 'configured' : 'missing'
    },
    timestamp: new Date()
  })
}