import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Opinion } from '@/models/Opinion'
import { validateTeacherFeedback, sanitizeInput } from '@/lib/validation'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { teacherFeedback, generateAI } = await request.json()
    
    // 교사 피드백 검증
    const validation = validateTeacherFeedback(teacherFeedback)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    // 입력 sanitization
    const sanitizedFeedback = sanitizeInput(teacherFeedback)

    await connectToDatabase()
    
    const opinion = await Opinion.findById(params.id)
    
    if (!opinion) {
      return NextResponse.json(
        { success: false, error: '의견을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // AI 피드백 생성 (generateAI가 true인 경우)
    let aiFeedback = opinion.aiFeedback // 기존 AI 피드백 유지
    if (generateAI) {
      try {
        // Gemini API를 사용하여 AI 피드백 생성
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/generate-feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: opinion.topic,
            content: opinion.content,
            teacherFeedback: sanitizedFeedback
          })
        })

        if (response.ok) {
          const aiData = await response.json()
          if (aiData.success && aiData.feedback) {
            aiFeedback = aiData.feedback
          }
        }
      } catch (error) {
        console.error('Error generating AI feedback:', error)
        // AI 피드백 생성 실패는 전체 프로세스를 중단시키지 않음
      }
    }

    // 의견 업데이트
    opinion.teacherFeedback = sanitizedFeedback
    if (aiFeedback) {
      opinion.aiFeedback = aiFeedback
    }
    opinion.status = 'feedback_given'
    opinion.updatedAt = new Date()
    
    await opinion.save()

    return NextResponse.json({
      success: true,
      data: opinion,
      message: '피드백이 성공적으로 제출되었습니다.'
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { success: false, error: '피드백 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}