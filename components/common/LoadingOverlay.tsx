'use client'

import { useEffect, useState } from 'react'
import { IconSpinner, PulseLoader } from './LoadingSpinner'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  submessage?: string
  type?: 'spinner' | 'pulse' | 'icon'
  icon?: string
  overlay?: boolean
  className?: string
}

export default function LoadingOverlay({
  isVisible,
  message = '처리 중입니다...',
  submessage,
  type = 'spinner',
  icon = '⚙️',
  overlay = true,
  className = ''
}: LoadingOverlayProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* 로딩 애니메이션 */}
      {type === 'spinner' && (
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      )}
      
      {type === 'pulse' && (
        <PulseLoader />
      )}
      
      {type === 'icon' && (
        <IconSpinner icon={icon} />
      )}

      {/* 메시지 */}
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-800">
          {message}{dots}
        </div>
        {submessage && (
          <div className="text-sm text-gray-600 mt-2">
            {submessage}
          </div>
        )}
      </div>
    </div>
  )

  if (!overlay) {
    return content
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full mx-4">
        {content}
      </div>
    </div>
  )
}

// 인라인 로딩 컴포넌트 (버튼 내부 등에서 사용)
export function InlineLoading({ 
  text = '처리 중', 
  size = 'sm',
  className = '' 
}: { 
  text?: string
  size?: 'xs' | 'sm' | 'md'
  className?: string 
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }

  const textClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
      <span className={textClasses[size]}>{text}...</span>
    </div>
  )
}

// 카드 로딩 스켈레톤
export function LoadingSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}