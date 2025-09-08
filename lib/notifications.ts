import { Notification, NotificationData } from '@/models/Notification'
import { connectToDatabase } from './mongodb'

export class NotificationService {
  // 알림 생성
  static async createNotification(data: {
    userId: string
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error' | 'opinion' | 'feedback'
    relatedId?: string
    relatedType?: 'opinion' | 'session' | 'feedback'
  }) {
    try {
      await connectToDatabase()
      
      const notification = new Notification({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      await notification.save()
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // 사용자 알림 목록 조회
  static async getUserNotifications(
    userId: string, 
    options: { 
      limit?: number
      offset?: number
      unreadOnly?: boolean 
    } = {}
  ) {
    try {
      await connectToDatabase()
      
      const { limit = 20, offset = 0, unreadOnly = false } = options
      
      const query: any = { userId }
      if (unreadOnly) {
        query.read = false
      }
      
      const notifications = await Notification
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean()
      
      const total = await Notification.countDocuments(query)
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        read: false 
      })
      
      return {
        notifications,
        total,
        unreadCount,
        hasMore: total > offset + notifications.length
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  // 알림 읽음 처리
  static async markAsRead(notificationId: string, userId: string) {
    try {
      await connectToDatabase()
      
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { 
          read: true,
          updatedAt: new Date()
        },
        { new: true }
      )
      
      return notification
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // 모든 알림 읽음 처리
  static async markAllAsRead(userId: string) {
    try {
      await connectToDatabase()
      
      const result = await Notification.updateMany(
        { userId, read: false },
        { 
          read: true,
          updatedAt: new Date()
        }
      )
      
      return result
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // 알림 삭제
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      await connectToDatabase()
      
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      })
      
      return result
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  // 오래된 알림 정리 (30일 이상)
  static async cleanupOldNotifications() {
    try {
      await connectToDatabase()
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        read: true
      })
      
      console.log(`Cleaned up ${result.deletedCount} old notifications`)
      return result
    } catch (error) {
      console.error('Error cleaning up old notifications:', error)
      throw error
    }
  }

  // 특정 유형별 알림 생성 헬퍼 메서드들
  static async notifyNewOpinion(teacherId: string, studentName: string, topic: string, opinionId: string) {
    return this.createNotification({
      userId: teacherId,
      title: '새로운 토론 의견',
      message: `${studentName} 학생이 "${topic}" 주제에 대한 의견을 제출했습니다.`,
      type: 'opinion',
      relatedId: opinionId,
      relatedType: 'opinion'
    })
  }

  static async notifyFeedbackReceived(studentId: string, topic: string, opinionId: string) {
    return this.createNotification({
      userId: studentId,
      title: '피드백 도착',
      message: `"${topic}" 의견에 대한 교사 피드백이 도착했습니다.`,
      type: 'feedback',
      relatedId: opinionId,
      relatedType: 'opinion'
    })
  }

  static async notifySessionCreated(teacherId: string, sessionTitle: string, sessionId: string) {
    return this.createNotification({
      userId: teacherId,
      title: '토론 세션 생성 완료',
      message: `"${sessionTitle}" 세션이 성공적으로 생성되었습니다.`,
      type: 'success',
      relatedId: sessionId,
      relatedType: 'session'
    })
  }
}