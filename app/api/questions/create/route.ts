import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase'
import { ref, push, set } from 'firebase/database'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 필수 필드 검증
    if (!data.sessionId || !data.studentName || !data.text) {
      return NextResponse.json(
        { error: '세션 ID, 학생 이름, 질문 내용은 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // 질문 데이터 준비
    const questionData = {
      sessionId: data.sessionId,
      studentName: data.studentName,
      text: data.text,
      createdAt: data.createdAt || Date.now()
    }
    
    // 질문 저장
    const questionsRef = ref(database, `sessions/${data.sessionId}/questions`)
    const newQuestionRef = push(questionsRef)
    await set(newQuestionRef, questionData)
    
    // 질문 ID 반환
    return NextResponse.json({ 
      success: true, 
      questionId: newQuestionRef.key 
    })
  } catch (error) {
    console.error('질문 생성 오류:', error)
    return NextResponse.json(
      { error: '질문 생성에 실패했습니다.' }, 
      { status: 500 }
    )
  }
}