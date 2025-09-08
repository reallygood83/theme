import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'

// 모든 알림 읽음 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const result = await NotificationService.markAllAsRead(userId)
    
    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount}개의 알림을 읽음 처리했습니다.`
      }
    })
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { success: false, error: '알림 읽음 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}