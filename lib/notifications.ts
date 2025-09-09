// Firebase 마이그레이션 완료: 알림 서비스가 Firebase로 이전되었습니다.

export class NotificationService {
  // 모든 메서드는 Firebase로 마이그레이션되어 사용할 수 없습니다.
  static async createNotification(data: any) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }

  static async getUserNotifications(userId: string, options: any = {}) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return { notifications: [], total: 0, unreadCount: 0, hasMore: false };
  }

  static async markAsRead(notificationId: string, userId: string) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }

  static async markAllAsRead(userId: string) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }

  static async deleteNotification(notificationId: string, userId: string) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }

  static async cleanupOldNotifications() {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }

  static async notifyNewOpinion(teacherId: string, studentName: string, topic: string, opinionId: string) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }

  static async notifyFeedbackReceived(studentId: string, topic: string, opinionId: string) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }

  static async notifySessionCreated(teacherId: string, sessionTitle: string, sessionId: string) {
    console.warn('NotificationService는 Firebase 마이그레이션으로 사용 중단됨');
    return null;
  }
}