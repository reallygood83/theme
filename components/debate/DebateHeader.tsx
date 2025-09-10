'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Home, MessageCircle, Users } from 'lucide-react'

interface DebateHeaderProps {
  title?: string
  subtitle?: string
  sessionCode?: string
  studentName?: string
  studentGroup?: string
  isTeacher?: boolean
  backHref?: string
  backLabel?: string
  showSessionInfo?: boolean
}

export default function DebateHeader({
  title = '토론 시스템',
  subtitle,
  sessionCode,
  studentName,
  studentGroup,
  isTeacher = false,
  backHref = '/',
  backLabel = '홈으로',
  showSessionInfo = true
}: DebateHeaderProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 shadow-lg mb-8 sticky top-0 z-10 backdrop-blur-sm border-b border-purple-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* 브랜드 로고 */}
        <Link href="/" className="hover:scale-105 transition-transform duration-200">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full shadow-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              질문톡톡! 논제샘솟!
            </span>
            <span className="sm:hidden bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              질문톡톡!
            </span>
          </h1>
        </Link>

        {/* 페이지 제목 및 정보 */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-purple-800">
              {title}
            </h2>
            {subtitle && (
              <p className="text-purple-600 text-xs md:text-sm">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* 세션 정보 */}
          {showSessionInfo && (sessionCode || studentName) && (
            <div className="flex items-center gap-2">
              {sessionCode && (
                <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-purple-200 shadow-sm">
                  <span className="text-xs font-medium text-purple-700">
                    {sessionCode}
                  </span>
                </div>
              )}
              
              {studentName && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded-full border border-purple-200 shadow-sm">
                  <span className="text-xs font-medium text-purple-800 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {studentName}
                    {studentGroup && (
                      <>
                        <span className="text-purple-600 mx-1">|</span>
                        {studentGroup}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 네비게이션 */}
        <div className="flex items-center gap-2">
          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="text-purple-700 hover:text-purple-800 hover:bg-purple-100"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backLabel}
            </Button>
            
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-purple-700 hover:text-purple-800 hover:bg-purple-100"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-1" />
                홈
              </Link>
            </Button>

            {isTeacher && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-purple-700 hover:text-purple-800 hover:bg-purple-100"
              >
                <Link href="/teacher/dashboard">
                  <Users className="h-4 w-4 mr-1" />
                  대시보드
                </Link>
              </Button>
            )}
          </div>

          {/* 모바일 햄버거 메뉴 */}
          <div className="md:hidden mobile-menu-container">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-purple-700 hover:text-purple-800 hover:bg-purple-100 p-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="m6 18 12-12M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </Button>

            {/* 모바일 드롭다운 메뉴 */}
            {isMobileMenuOpen && (
              <div className="absolute right-4 top-16 w-56 bg-white rounded-xl shadow-xl border border-purple-100 z-50">
                <div className="p-2 space-y-1">
                  <Button
                    onClick={() => {
                      handleBack()
                      setIsMobileMenuOpen(false)
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-purple-700 hover:bg-purple-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {backLabel}
                  </Button>
                  
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-purple-700 hover:bg-purple-50"
                  >
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <Home className="h-4 w-4 mr-2" />
                      홈
                    </Link>
                  </Button>

                  {isTeacher && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-purple-700 hover:bg-purple-50"
                    >
                      <Link href="/teacher/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Users className="h-4 w-4 mr-2" />
                        대시보드
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}