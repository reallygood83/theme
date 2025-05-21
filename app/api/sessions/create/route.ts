import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, push, set } from 'firebase/database'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 필수 필드 검증
    if (!data.accessCode) {
      return NextResponse.json(
        { error: '세션 코드는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // 세션 데이터 준비
    const sessionData = {
      materialText: data.materialText || '',
      materialUrl: data.materialUrl || '',
      keywords: data.keywords || [],
      accessCode: data.accessCode,
      createdAt: data.createdAt || Date.now()
    }
    
    // 세션 생성
    const sessionsRef = ref(database, 'sessions')
    const newSessionRef = push(sessionsRef)
    await set(newSessionRef, sessionData)
    
    // 세션 ID 반환
    return NextResponse.json({ 
      success: true, 
      sessionId: newSessionRef.key 
    })
  } catch (error) {
    console.error('세션 생성 오류:', error)
    return NextResponse.json(
      { error: '세션 생성에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}