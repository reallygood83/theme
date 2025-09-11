import { NextRequest, NextResponse } from 'next/server'
import { 
  searchEvidence
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
    
    console.log('⚡ 통합된 검색 시작: 원본 프로그램 완전 복제')
    
    // 🚀 원본 프로그램 완전 복제된 통합 검색 함수 사용
    const validatedResults = await searchEvidence(
      topic,
      stance,
      selectedTypes || [],
      selectedStance,
      (step: number, message: string) => {
        console.log(`📊 검색 진행: ${step}/5 - ${message}`)
      }
    )
    console.log('✅ 기본 검증 완료:', validatedResults.length + '개 유효한 결과')
    
    // 3단계: 최종 결과에만 완화된 콘텐츠 필터링 적용 (시간 효율성)
    const safeResults = filterSearchResults(validatedResults)
    console.log('🛡️ 완화된 콘텐츠 필터링 적용:', validatedResults.length, '→', safeResults.length, '개')
    
    // 결과가 없는 경우 처리 - 신뢰성 우선 (Always Works™)
    if (validatedResults.length === 0) {
      // 필터링으로 인한 결과 부족인지 확인
      const wasFiltered = safeResults.length < validatedResults.length
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
    
    // 성공 응답 (필터링된 결과 사용)
    const response: EvidenceSearchResponse = {
      evidences: safeResults,
      totalCount: safeResults.length,
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