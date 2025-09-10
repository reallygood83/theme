'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { realtimeNotificationService } from '@/lib/firebase/realtime-services'
import type { FirebaseRealtimeNotification } from '@/lib/firebase/realtime-services'
import { Bell, X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<FirebaseRealtimeNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: FirebaseRealtimeNotification['type']) => {
    const iconClass = "h-4 w-4 mr-2 flex-shrink-0"
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />
      default:
        return <Info className={`${iconClass} text-blue-500`} />
    }
  }

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '방금'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      await realtimeNotificationService.markAsRead(notificationId)
      console.log('✅ 알림 읽음 처리 완료:', notificationId)
    } catch (error) {
      console.error('❌ 알림 읽음 처리 실패:', error)
    }
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      await Promise.all(
        unreadNotifications.map(notification => 
          realtimeNotificationService.markAsRead(notification.id)
        )
      )
      console.log('✅ 모든 알림 읽음 처리 완료')
    } catch (error) {
      console.error('❌ 모든 알림 읽음 처리 실패:', error)
    }
  }

  // 실시간 알림 데이터 구독
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    console.log('🔔 알림 실시간 리스너 설정 중... 교사 ID:', user.uid)
    setLoading(true)
    setError(null)

    // 권한 오류 방지를 위해 API 기반 알림 조회로 변경
    const fetchNotifications = async () => {
      try {
        const teacherNotifications = await realtimeNotificationService.getByTeacherId(user.uid)
        
        // 최신순으로 정렬
        const sortedNotifications = teacherNotifications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        // 최근 50개만 표시
        const recentNotifications = sortedNotifications.slice(0, 50)
        
        setNotifications(recentNotifications)
        
        // 읽지 않은 알림 개수 계산
        const unread = recentNotifications.filter(n => !n.isRead).length
        setUnreadCount(unread)
        
        setLoading(false)
        console.log(`✅ 알림 업데이트 완료: 총 ${recentNotifications.length}개, 읽지않음 ${unread}개`)
      } catch (error) {
        console.error('❌ 알림 조회 실패:', error)
        setError('알림을 불러올 수 없습니다.')
        setLoading(false)
        
        // 권한 오류인 경우 빈 배열로 설정
        setNotifications([])
        setUnreadCount(0)
      }
    }

    // 초기 로드
    fetchNotifications()
    
    // 주기적 업데이트 (30초마다)
    const intervalId = setInterval(fetchNotifications, 30000)

    // 컴포넌트 언마운트 시 인터벌 해제
    return () => {
      console.log('🔔 알림 업데이트 인터벌 해제')
      clearInterval(intervalId)
    }
  }, [user?.uid])

  if (!user) return null

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative p-2 hover:bg-gray-100 transition-colors"
            aria-label={`알림 ${unreadCount > 0 ? `(읽지않음 ${unreadCount}개)` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 max-h-96 p-0 shadow-lg border border-gray-200"
          sideOffset={5}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">알림</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 p-1 h-auto"
                >
                  모두 읽음
                </Button>
              )}
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                알림을 불러오는 중...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 text-sm">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-gray-50 last:border-0 transition-colors ${
                      notification.isRead 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    {notification.actionUrl ? (
                      <Link
                        href={notification.actionUrl}
                        className="block p-4 hover:no-underline"
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <NotificationContent notification={notification} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// 알림 내용 컴포넌트
function NotificationContent({ notification }: { notification: FirebaseRealtimeNotification }) {
  const getNotificationIcon = (type: FirebaseRealtimeNotification['type']) => {
    const iconClass = "h-4 w-4 mr-2 flex-shrink-0"
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />
      default:
        return <Info className={`${iconClass} text-blue-500`} />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return '방금'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex items-start space-x-2">
      {getNotificationIcon(notification.type)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium truncate ${
            notification.isRead ? 'text-gray-700' : 'text-gray-900'
          }`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
          )}
        </div>
        <p className={`text-xs mt-1 line-clamp-2 ${
          notification.isRead ? 'text-gray-500' : 'text-gray-700'
        }`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>
    </div>
  )
}