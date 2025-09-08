import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'

// 개별 알림 읽음 처리
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { userId, action } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    if (action === 'mark_read') {
      const notification = await NotificationService.markAsRead(id, userId)
      
      if (!notification) {
        return NextResponse.json(
          { success: false, error: '알림을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: notification
      })
    }
    
    return NextResponse.json(
      { success: false, error: '유효하지 않은 액션입니다.' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: '알림 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 개별 알림 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const result = await NotificationService.deleteNotification(id, userId)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '알림이 삭제되었습니다.'
    })
    
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { success: false, error: '알림 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}