import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'

// 알림 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const result = await NotificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly
    })
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: '알림을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 새 알림 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message, type, relatedId, relatedType } = body
    
    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }
    
    const notification = await NotificationService.createNotification({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedType
    })
    
    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { success: false, error: '알림 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}