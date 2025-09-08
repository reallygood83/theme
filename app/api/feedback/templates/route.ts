import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { FeedbackTemplate } from '@/models/FeedbackTemplate'
import { validateTeacherFeedback, sanitizeInput } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const teacherId = url.searchParams.get('teacherId')
    
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: '교사 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const templates = await FeedbackTemplate.find({ teacherId })
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error fetching feedback templates:', error)
    return NextResponse.json(
      { success: false, error: '템플릿을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, teacherId } = await request.json()
    
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: '교사 ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 입력 검증
    const validation = validateTeacherFeedback(content)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '제목을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (title.trim().length > 50) {
      return NextResponse.json(
        { success: false, error: '제목은 50글자를 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 입력 sanitization
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedContent = sanitizeInput(content)
    const sanitizedCategory = sanitizeInput(category || 'custom')

    await connectToDatabase()
    
    const template = new FeedbackTemplate({
      title: sanitizedTitle,
      content: sanitizedContent,
      category: sanitizedCategory,
      teacherId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    await template.save()

    return NextResponse.json({
      success: true,
      data: template,
      message: '피드백 템플릿이 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    console.error('Error creating feedback template:', error)
    return NextResponse.json(
      { success: false, error: '템플릿 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}