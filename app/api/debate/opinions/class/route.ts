import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseDatabase } from '@/lib/firebase'
import { ref, get, push, update, query, orderByChild, equalTo } from 'firebase/database'

// Firebase 기반 토론 의견 관리 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const firebaseUid = searchParams.get('firebaseUid')
    
    if (!firebaseUid) {
      return NextResponse.json(
        { success: false, error: '교사 UID가 필요합니다.' },
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

    // 해당 교사의 세션들을 먼저 조회
    const sessionsRef = ref(database, 'sessions')
    const sessionsQuery = query(sessionsRef, orderByChild('teacherId'), equalTo(firebaseUid))
    const sessionsSnapshot = await get(sessionsQuery)
    
    if (!sessionsSnapshot.exists()) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '등록된 세션이 없습니다.'
      })
    }

    const teacherSessions = Object.keys(sessionsSnapshot.val())
    console.log('교사의 세션 목록:', teacherSessions)

    // 각 세션의 토론 의견들을 수집
    const allOpinions: any[] = []
    
    for (const sessionId of teacherSessions) {
      const opinionsRef = ref(database, `debate_opinions/${sessionId}`)
      const opinionsSnapshot = await get(opinionsRef)
      
      if (opinionsSnapshot.exists()) {
        const opinions = opinionsSnapshot.val()
        Object.entries(opinions).forEach(([opinionId, opinion]: [string, any]) => {
          allOpinions.push({
            id: opinionId,
            sessionId,
            sessionTitle: sessionsSnapshot.val()[sessionId]?.title || '세션 제목 없음',
            ...opinion,
            createdAt: opinion.createdAt || new Date().toISOString()
          })
        })
      }
    }

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
    return NextResponse.json({
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
    })
    
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