import { NextRequest, NextResponse } from 'next/server'
import { 
  callPerplexityAPI, 
  searchYouTubeVideos, 
  generateSearchPrompt, 
  processEvidenceResults,
  validateEvidenceResults 
} from '@/lib/evidence'
import { safeEvidenceSearch } from '@/lib/evidence-naver'
import { EvidenceSearchRequest, EvidenceSearchResponse } from '@/lib/types/evidence'
import { checkTopicAppropriateness, filterSearchResults, generateStudentMessage } from '@/lib/content-filter'

// Vercel 30초 제한 우회 설정
export const runtime = 'nodejs'
export const maxDuration = 60

// 빠른 타임아웃으로 API 응답성 향상
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

    // 2단계: 콘텐츠 적절성 검사 (교육용 필터링)
    const contentCheck = checkTopicAppropriateness(topic)
    console.log('🛡️ 콘텐츠 필터링 결과:', contentCheck)

    if (!contentCheck.isAppropriate) {
      console.warn('🚫 부적절한 주제 차단:', topic, '- 이유:', contentCheck.reason)
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

    // 경고 수준의 민감한 주제인 경우 로깅
    if (contentCheck.severity === 'warning') {
      console.warn('⚠️ 민감한 주제 검색:', topic, '- 사유:', contentCheck.reason)
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
    
    // 🆕 안전한 교육용 검색 시스템으로 대체
    console.log('🔄 안전 교육 검색 시스템 시작...')
    
    // 1차: 안정적인 네이버+YouTube 검색
    let evidenceResults = await safeEvidenceSearch(topic, stance, selectedTypes).catch(error => {
      console.error('❌ 안전 검색 실패:', error)
      return []
    })
    
    // 2차: 결과 부족 시 Perplexity 백업 시도
    if (evidenceResults.length < 3) {
      console.log('⚠️ 결과 부족, Perplexity 백업 검색 시도...')
      
      const [perplexityData, youtubeVideos] = await Promise.all([
        callPerplexityAPI(prompt).catch(error => {
          console.error('❌ Perplexity API 오류:', error)
          return null
        }),
        searchYouTubeVideos(topic, 20, selectedStance).catch(error => { 
          console.error('❌ YouTube API 오류:', error)
          return []
        })
      ])
      
      // 백업 결과 처리
      const backupResults = processEvidenceResults(perplexityData, youtubeVideos)
      evidenceResults = [...evidenceResults, ...backupResults]
    }
    
    console.log('📊 안전 검색 결과 수집 완료:')
    console.log('- 전체 결과 수:', evidenceResults.length)
    console.log('- 뉴스 기사:', evidenceResults.filter(r => r.type === '뉴스 기사').length + '개')
    console.log('- 유튜브 영상:', evidenceResults.filter(r => r.type === '유튜브 영상').length + '개')
    
    // 결과 상세 로깅
    if (evidenceResults.length > 0) {
      console.log('✅ 안전 검색 성공! 결과 목록:')
      evidenceResults.forEach((result, index) => {
        console.log(`  ${index + 1}. [${result.type}] ${result.title}`)
      })
    } else {
      console.log('⚠️ 검색 결과 없음 - 다른 키워드 제안 필요')
    }
    
    // 3단계: 추가 안전성 검증 (이미 안전 검색에서 1차 필터링 완료)
    const safeResults = filterSearchResults(evidenceResults)
    console.log('🛡️ 추가 콘텐츠 필터링:', evidenceResults.length, '→', safeResults.length, '개')
    
    // 결과 검증 및 최종 정리
    const validatedResults = validateEvidenceResults(safeResults)
    console.log('✅ 최종 검증 완료:', validatedResults.length + '개 교육용 자료')
    
    // 결과가 없는 경우 처리 (개선된 메시지)
    if (validatedResults.length === 0) {
      const wasFiltered = evidenceResults.length > safeResults.length
      const hasOriginalResults = evidenceResults.length > 0
      
      let message: string
      if (wasFiltered) {
        message = '🛡️ 교육에 적합하지 않은 내용이 필터링되었습니다. 더 교육적이고 안전한 키워드로 검색해보세요.'
      } else if (!hasOriginalResults) {
        message = '🔍 검색 결과를 찾을 수 없습니다. 다른 키워드나 더 구체적인 주제로 다시 검색해보세요.'
      } else {
        message = '📚 교육용 자료가 부족합니다. 좀 더 일반적인 키워드로 검색해보세요.'
      }
      
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