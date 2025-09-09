import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import { Opinion } from '@/models/Opinion'
import { validateOpinion, sanitizeInput } from '@/lib/validation'

// 특정 의견 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB()
    
    const opinion = await Opinion.findById(params.id)
    
    if (!opinion) {
      return NextResponse.json(
        { success: false, error: '의견을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: opinion
    })
  } catch (error) {
    console.error('Error fetching opinion:', error)
    return NextResponse.json(
      { success: false, error: '의견을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 의견 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { topic, content, studentName, studentClass } = await request.json()
    
    // 입력 검증
    const validation = validateOpinion(topic, content)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    // 입력 sanitization
    const sanitizedTopic = sanitizeInput(topic)
    const sanitizedContent = sanitizeInput(content)
    const sanitizedStudentName = sanitizeInput(studentName)
    const sanitizedStudentClass = sanitizeInput(studentClass)

    await connectMongoDB()
    
    const opinion = await Opinion.findById(params.id)
    
    if (!opinion) {
      return NextResponse.json(
        { success: false, error: '의견을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (본인 의견인지)
    if (opinion.studentName !== sanitizedStudentName || opinion.studentClass !== sanitizedStudentClass) {
      return NextResponse.json(
        { success: false, error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 수정 가능한 시간 체크 (제출 후 30분 이내)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (opinion.submittedAt < thirtyMinutesAgo) {
      return NextResponse.json(
        { success: false, error: '의견은 제출 후 30분 이내에만 수정할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 피드백이 이미 제공된 경우 수정 불가
    if (opinion.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '이미 피드백이 제공된 의견은 수정할 수 없습니다.' },
        { status: 403 }
      )
    }

    // 의견 업데이트 (학생 이름과 클래스는 변경하지 않음)
    opinion.topic = sanitizedTopic
    opinion.content = sanitizedContent
    opinion.updatedAt = new Date()
    
    await opinion.save()

    return NextResponse.json({
      success: true,
      data: opinion,
      message: '의견이 성공적으로 수정되었습니다.'
    })
  } catch (error) {
    console.error('Error updating opinion:', error)
    return NextResponse.json(
      { success: false, error: '의견 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 의견 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url)
    const studentName = url.searchParams.get('studentName')
    const studentClass = url.searchParams.get('studentClass')
    
    if (!studentName || !studentClass) {
      return NextResponse.json(
        { success: false, error: '학생 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    await connectMongoDB()
    
    const opinion = await Opinion.findById(params.id)
    
    if (!opinion) {
      return NextResponse.json(
        { success: false, error: '의견을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (본인 의견인지)
    if (opinion.studentName !== studentName || opinion.studentClass !== studentClass) {
      return NextResponse.json(
        { success: false, error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 삭제 가능한 시간 체크 (제출 후 30분 이내)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (opinion.submittedAt < thirtyMinutesAgo) {
      return NextResponse.json(
        { success: false, error: '의견은 제출 후 30분 이내에만 삭제할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 피드백이 이미 제공된 경우 삭제 불가
    if (opinion.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '이미 피드백이 제공된 의견은 삭제할 수 없습니다.' },
        { status: 403 }
      )
    }

    await Opinion.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: '의견이 성공적으로 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Error deleting opinion:', error)
    return NextResponse.json(
      { success: false, error: '의견 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}