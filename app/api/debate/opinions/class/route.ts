import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseDatabase } from '@/lib/firebase'
import { ref, get, push, update, query, orderByChild, equalTo } from 'firebase/database'

// API route는 동적으로 처리 필요
export const dynamic = 'force-dynamic'

// Firebase 기반 토론 의견 관리 API
export async function GET(request: NextRequest) {
  try {
    console.log('🔥 의견 조회 API GET 시작')
    const url = new URL(request.url || '', 'http://localhost')
    const firebaseUid = url.searchParams.get('firebaseUid')
    
    console.log('📝 교사 UID:', firebaseUid)
    
    if (!firebaseUid) {
      console.log('❌ 교사 UID 누락')
      return NextResponse.json(
        { success: false, error: '교사 UID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('🔍 Firebase 데이터베이스 연결 시도')
    const database = getFirebaseDatabase()
    if (!database) {
      console.log('❌ Firebase 데이터베이스 연결 실패')
      return NextResponse.json(
        { success: false, error: 'Firebase 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }
    console.log('✅ Firebase 데이터베이스 연결 성공')

    // 타임아웃 설정 (10초)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Debate opinions API timeout')), 10000)
    })

    const queryPromise = (async () => {
      // 해당 교사의 세션들을 먼저 조회
      console.log('🔍 교사 세션 조회 중:', firebaseUid)
      const sessionsRef = ref(database, 'sessions')
      const sessionsQuery = query(sessionsRef, orderByChild('teacherId'), equalTo(firebaseUid))
      
      // 각 세션의 토론 의견들을 수집
      const allOpinions: any[] = []
      
      const sessionsSnapshot = await get(sessionsQuery)
      
      if (!sessionsSnapshot.exists()) {
        console.log('❌ 교사의 세션이 없음')
        return {
          success: true,
          data: [],
          message: '등록된 세션이 없습니다.'
        }
      }

      const teacherSessions = Object.keys(sessionsSnapshot.val())
      console.log('✅ 교사의 세션 목록:', teacherSessions, '개수:', teacherSessions.length)
      
      for (const sessionId of teacherSessions) {
        console.log(`🔍 세션 ${sessionId}의 의견 조회 중`)
        const opinionsRef = ref(database, `debate_opinions/${sessionId}`)
        const opinionsSnapshot = await get(opinionsRef)
        
        if (opinionsSnapshot.exists()) {
          const opinions = opinionsSnapshot.val()
          const opinionCount = Object.keys(opinions).length
          console.log(`✅ 세션 ${sessionId}에서 ${opinionCount}개 의견 발견`)
          
          Object.entries(opinions).forEach(([opinionId, opinion]: [string, any]) => {
            allOpinions.push({
              id: opinionId,
              sessionId,
              sessionTitle: sessionsSnapshot.val()[sessionId]?.title || '세션 제목 없음',
              ...opinion,
              createdAt: opinion.createdAt || new Date().toISOString()
            })
          })
        } else {
          console.log(`❌ 세션 ${sessionId}에 의견 없음`)
        }
      }

      console.log(`✅ 전체 의견 수집 완료: ${allOpinions.length}개`)

      // 최신순 정렬
      allOpinions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      console.log(`토론 의견 ${allOpinions.length}개 조회 완료`)

      // 통계 계산
      const stats = {
        total: allOpinions.length,
        pending: allOpinions.filter(op => op.status === 'pending').length,
        feedback_given: allOpinions.filter(op => op.status === 'feedback_given').length,
        reviewed: allOpinions.filter(op => op.status === 'reviewed').length
      }

      // 프론트엔드가 기대하는 형식으로 응답
      return {
        success: true,
        data: {
          opinions: allOpinions.map(opinion => ({
            _id: opinion.id,
            topic: opinion.topic,
            content: opinion.content,
            studentName: opinion.studentName,
            studentClass: opinion.classId || '',
            status: opinion.status || 'pending',
            submittedAt: opinion.submittedAt || opinion.createdAt,
            aiFeedback: opinion.aiFeedback,
            teacherFeedback: opinion.teacherFeedback,
            teacherFeedbackAt: opinion.teacherFeedbackAt,
            referenceCode: opinion.referenceCode
          })),
          stats: stats
        }
      }
    })()

    // Promise.race로 타임아웃 처리
    const result = await Promise.race([queryPromise, timeoutPromise])
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('토론 의견 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '토론 의견 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { opinionId, feedback, score } = await request.json()
    
    if (!opinionId) {
      return NextResponse.json(
        { success: false, error: '의견 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const database = getFirebaseDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Firebase 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }

    // 의견 업데이트 (모든 세션에서 해당 의견 찾기)
    const sessionsRef = ref(database, 'sessions')
    const sessionsSnapshot = await get(sessionsRef)
    
    if (!sessionsSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let opinionFound = false
    const sessions = sessionsSnapshot.val()
    
    for (const sessionId of Object.keys(sessions)) {
      const opinionRef = ref(database, `debate_opinions/${sessionId}/${opinionId}`)
      const opinionSnapshot = await get(opinionRef)
      
      if (opinionSnapshot.exists()) {
        await update(opinionRef, {
          teacherFeedback: feedback,
          score: score,
          feedbackAt: new Date().toISOString()
        })
        opinionFound = true
        break
      }
    }

    if (!opinionFound) {
      return NextResponse.json(
        { success: false, error: '의견을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '피드백이 저장되었습니다.'
    })
    
  } catch (error) {
    console.error('피드백 저장 오류:', error)
    return NextResponse.json(
      { success: false, error: '피드백 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}