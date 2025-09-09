'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user?.uid) {
      fetchUnreadCount()
      // 30초마다 알림 개수 업데이트
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.uid])

  const fetchUnreadCount = async () => {
    if (!user?.uid) return

    try {
      // API가 마이그레이션되어 임시로 비활성화
      // const response = await fetch(`/api/notifications?userId=${user.uid}&unreadOnly=true&limit=0`)
      
      // 임시로 알림 개수를 0으로 설정
      setUnreadCount(0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-5 5v-5zM10.94 14H2a2 2 0 01-2-2V4a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2l-4 4v-4z" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px] h-[18px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}