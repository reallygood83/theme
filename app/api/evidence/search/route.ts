import { NextRequest, NextResponse } from 'next/server'
import { 
  callPerplexityAPI, 
  searchYouTubeVideos, 
  generateSearchPrompt, 
  processEvidenceResults,
  validateEvidenceResults 
} from '@/lib/evidence'
import { EvidenceSearchRequest, EvidenceSearchResponse } from '@/lib/types/evidence'

// 원본 프로그램과 동일한 검색 로직
export async function POST(request: NextRequest) {
  try {
    const { topic, stance, selectedTypes }: EvidenceSearchRequest = await request.json()
    
    console.log('🔍 근거자료 검색 시작:', { topic, stance, selectedTypes })
    
    // 입력 검증
    if (!topic || !stance) {
      return NextResponse.json(
        { error: '토론 주제와 입장을 입력해주세요.' },
        { status: 400 }
      )
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
      console.error('❌ YOUTUBE_API_KEY가 설정되지 않았습니다.')
      console.log('💡 YouTube 검색 기능이 비활성화됩니다.')
    }
    
    // 검색 프롬프트 생성
    const prompt = generateSearchPrompt(topic, stance, selectedTypes || [])
    console.log('📝 생성된 프롬프트:', prompt.substring(0, 200) + '...')
    
    // 병렬 검색 실행 (원본과 동일)
    console.log('🔄 Perplexity API 및 YouTube API 병렬 호출 시작...')
    
    const [perplexityData, youtubeVideos] = await Promise.all([
      callPerplexityAPI(prompt).catch(error => {
        console.error('❌ Perplexity API 오류:', error)
        return null
      }),
      searchYouTubeVideos(topic, 30, stance).catch(error => {
        console.error('❌ YouTube API 오류:', error)
        return []
      })
    ])
    
    console.log('📊 검색 결과 수집 완료:')
    console.log('- Perplexity 결과:', perplexityData ? 'O' : 'X')
    console.log('- YouTube 결과 수:', Array.isArray(youtubeVideos) ? youtubeVideos.length : 0)
    
    // 결과 처리 및 합성
    const evidenceResults = processEvidenceResults(perplexityData, youtubeVideos)
    console.log('🔗 결과 합성 완료:', evidenceResults.length + '개')
    
    // 결과 검증 및 필터링
    const validatedResults = validateEvidenceResults(evidenceResults)
    console.log('✅ 검증 완료:', validatedResults.length + '개 유효한 결과')
    
    // 결과가 없는 경우 처리
    if (validatedResults.length === 0) {
      return NextResponse.json({
        evidences: [],
        totalCount: 0,
        searchQuery: topic,
        timestamp: new Date(),
        message: '검색 결과가 없습니다. 다른 키워드로 다시 검색해보세요.'
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