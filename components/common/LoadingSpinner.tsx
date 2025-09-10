'use client'

import React, { useEffect, useState } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
  message?: string
  className?: string
  showProgress?: boolean
  duration?: number // in milliseconds
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  message = '로딩 중...',
  className = '',
  showProgress = false,
  duration = 5000
}: LoadingSpinnerProps) {
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!showProgress) return

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (duration / 100)
        return Math.min(prev + increment, 95) // Max 95% until completion
      })
    }, 100)

    return () => clearInterval(interval)
  }, [showProgress, duration])

  // 애니메이션 점 효과
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* 스피너 */}
      <div className="relative">
        <div className={`
          ${sizeClasses[size]} 
          border-2 border-gray-200 rounded-full
        `}>
        </div>
        <div className={`
          ${sizeClasses[size]} 
          border-2 ${colorClasses[color]} border-t-transparent rounded-full 
          animate-spin absolute inset-0
        `}>
        </div>
        
        {/* 진행률 표시 */}
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${
              color === 'white' ? 'text-white' : 'text-gray-600'
            }`}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* 텍스트 */}
      {message && (
        <div className={`
          ${textSizeClasses[size]} 
          ${color === 'white' ? 'text-white' : 'text-gray-600'} 
          font-medium text-center
        `}>
          {message}{dots}
        </div>
      )}

      {/* 진행률 바 (옵션) */}
      {showProgress && (
        <div className="w-32 bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              color === 'primary' ? 'bg-primary' :
              color === 'secondary' ? 'bg-secondary' : 'bg-white'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// 펄스 애니메이션 로딩 컴포넌트
export function PulseLoader({ text, className = '' }: { text?: string, className?: string }) {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      {text && <span className="text-sm text-gray-600 ml-2">{text}</span>}
    </div>
  )
}

// 회전하는 아이콘 로더
export function IconSpinner({ icon, text, className = '' }: { icon: string, text?: string, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className="text-2xl animate-spin">{icon}</div>
      {text && <span className="text-sm text-gray-600 text-center">{text}</span>}
    </div>
  )
}

// 심플한 인라인 로더
export function InlineLoader({ text = '로딩 중' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <span className="text-sm text-gray-600">{text}...</span>
    </div>
  )
}