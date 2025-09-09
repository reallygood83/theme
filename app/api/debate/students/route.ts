import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseDatabase } from '@/lib/firebase'
import { ref, get, push, update } from 'firebase/database'

// Firebase 기반 학생 참여 관리 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionCode = searchParams.get('sessionCode')
    
    if (!sessionCode) {
      return NextResponse.json(
        { success: false, error: '세션 코드가 필요합니다.' },
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
    let targetSession = null
    let sessionId = null

    // sessionCode로 세션 찾기
    for (const [id, session] of Object.entries(sessions)) {
      if ((session as any).sessionCode === sessionCode) {
        targetSession = session
        sessionId = id
        break
      }
    }

    if (!targetSession) {
      return NextResponse.json(
        { success: false, error: '잘못된 세션 코드입니다.' },
        { status: 404 }
      )
    }

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
      if ((session as any).sessionCode === sessionCode) {
        sessionId = id
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