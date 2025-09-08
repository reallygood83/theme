import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { FeedbackTemplate } from '@/models/FeedbackTemplate'
import { validateTeacherFeedback, sanitizeInput } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const template = await FeedbackTemplate.findById(params.id)
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Error fetching feedback template:', error)
    return NextResponse.json(
      { success: false, error: '템플릿을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, content, category, teacherId } = await request.json()
    
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
    
    const template = await FeedbackTemplate.findById(params.id)
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 교사 본인의 템플릿인지 확인
    if (template.teacherId !== teacherId) {
      return NextResponse.json(
        { success: false, error: '이 템플릿을 수정할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 템플릿 업데이트
    template.title = sanitizedTitle
    template.content = sanitizedContent
    template.category = sanitizedCategory
    template.updatedAt = new Date()
    
    await template.save()

    return NextResponse.json({
      success: true,
      data: template,
      message: '템플릿이 성공적으로 수정되었습니다.'
    })
  } catch (error) {
    console.error('Error updating feedback template:', error)
    return NextResponse.json(
      { success: false, error: '템플릿 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const template = await FeedbackTemplate.findById(params.id)
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 교사 본인의 템플릿인지 확인
    if (template.teacherId !== teacherId) {
      return NextResponse.json(
        { success: false, error: '이 템플릿을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    await FeedbackTemplate.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: '템플릿이 성공적으로 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Error deleting feedback template:', error)
    return NextResponse.json(
      { success: false, error: '템플릿 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}