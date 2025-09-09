import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseDatabase } from '@/lib/firebase'
import { ref, get, push, update } from 'firebase/database'

// Firebase 기반 학생 참여 관리 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionCode = searchParams.get('sessionCode')
    
    console.log('🔍 세션 조회 시작 - 코드:', sessionCode)
    
    if (!sessionCode) {
      console.log('❌ 세션 코드 없음')
      return NextResponse.json(
        { success: false, error: '세션 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    const database = getFirebaseDatabase()
    if (!database) {
      console.log('❌ Firebase 데이터베이스 연결 실패')
      return NextResponse.json(
        { success: false, error: 'Firebase 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }

    console.log('✅ Firebase 연결 성공')

    // 세션 코드로 세션 찾기
    const sessionsRef = ref(database, 'sessions')
    const sessionsSnapshot = await get(sessionsRef)
    
    if (!sessionsSnapshot.exists()) {
      console.log('❌ 세션 데이터 없음')
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const sessions = sessionsSnapshot.val()
    console.log(`📊 총 ${Object.keys(sessions).length}개 세션 발견`)
    
    let targetSession = null
    let sessionId = null

    // sessionCode로 세션 찾기 (디버깅 로그 추가 + accessCode 지원)
    console.log(`🔍 ${sessionCode} 코드로 세션 검색 중...`)
    for (const [id, session] of Object.entries(sessions)) {
      const currentSessionCode = (session as any).sessionCode
      const currentAccessCode = (session as any).accessCode
      const sessionTitle = (session as any).title
      
      console.log(`세션 ${id}: 제목="${sessionTitle}", sessionCode=${currentSessionCode || 'undefined'}, accessCode=${currentAccessCode || 'undefined'}`)
      
      // sessionCode 또는 accessCode 중 하나라도 일치하면 찾은 것으로 간주
      if (currentSessionCode === sessionCode || currentAccessCode === sessionCode) {
        targetSession = session
        sessionId = id
        console.log(`✅ 매칭된 세션 발견: ${id} (sessionCode: ${currentSessionCode}, accessCode: ${currentAccessCode})`)
        break
      }
    }

    if (!targetSession) {
      console.log(`❌ ${sessionCode} 코드에 해당하는 세션 없음`)
      return NextResponse.json(
        { success: false, error: '잘못된 세션 코드입니다.' },
        { status: 404 }
      )
    }

    console.log(`✅ 세션 찾기 성공: ${sessionId}`)

    // 해당 세션의 참여 학생 목록 반환
    const participantsRef = ref(database, `session_participants/${sessionId}`)
    const participantsSnapshot = await get(participantsRef)
    
    const participants = participantsSnapshot.exists() ? Object.values(participantsSnapshot.val()) : []

    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        ...targetSession,
        participantCount: participants.length
      },
      participants
    })
    
  } catch (error) {
    console.error('세션 정보 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '세션 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionCode, studentName, groupName } = await request.json()
    
    if (!sessionCode || !studentName) {
      return NextResponse.json(
        { success: false, error: '세션 코드와 학생명이 필요합니다.' },
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

    // 세션 코드로 세션 찾기
    const sessionsRef = ref(database, 'sessions')
    const sessionsSnapshot = await get(sessionsRef)
    
    if (!sessionsSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const sessions = sessionsSnapshot.val()
    let sessionId = null

    for (const [id, session] of Object.entries(sessions)) {
      const currentSessionCode = (session as any).sessionCode
      const currentAccessCode = (session as any).accessCode
      
      // sessionCode 또는 accessCode 중 하나라도 일치하면 찾은 것으로 간주
      if (currentSessionCode === sessionCode || currentAccessCode === sessionCode) {
        sessionId = id
        console.log(`학생 참여용 세션 발견: ${id} (sessionCode: ${currentSessionCode}, accessCode: ${currentAccessCode})`)
        break
      }
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '잘못된 세션 코드입니다.' },
        { status: 404 }
      )
    }

    // 학생 참여 정보 저장
    const participantData = {
      studentName,
      groupName: groupName || null,
      joinedAt: new Date().toISOString(),
      sessionId
    }

    const participantsRef = ref(database, `session_participants/${sessionId}`)
    const newParticipantRef = await push(participantsRef, participantData)
    
    console.log(`학생 참여 등록: ${studentName} -> 세션 ${sessionId}`)

    return NextResponse.json({
      success: true,
      participantId: newParticipantRef.key,
      sessionId,
      message: '세션에 성공적으로 참여했습니다.'
    })
    
  } catch (error) {
    console.error('학생 참여 등록 오류:', error)
    return NextResponse.json(
      { success: false, error: '학생 참여 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { participantId, sessionId, opinion, stance } = await request.json()
    
    if (!participantId || !sessionId || !opinion) {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 빠졌습니다.' },
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

    // 참여자 정보 가져오기
    const participantRef = ref(database, `session_participants/${sessionId}/${participantId}`)
    const participantSnapshot = await get(participantRef)
    
    if (!participantSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: '참여자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const participant = participantSnapshot.val()

    // 토론 의견 저장
    const opinionData = {
      participantId,
      studentName: participant.studentName,
      groupName: participant.groupName,
      opinion,
      stance: stance || null,
      createdAt: new Date().toISOString(),
      sessionId
    }

    const opinionsRef = ref(database, `debate_opinions/${sessionId}`)
    const newOpinionRef = await push(opinionsRef, opinionData)
    
    console.log(`토론 의견 등록: ${participant.studentName} -> ${opinion.substring(0, 50)}...`)

    return NextResponse.json({
      success: true,
      opinionId: newOpinionRef.key,
      message: '토론 의견이 성공적으로 등록되었습니다.'
    })
    
  } catch (error) {
    console.error('토론 의견 등록 오류:', error)
    return NextResponse.json(
      { success: false, error: '토론 의견 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}