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
    <>
      {/* 메인 헤더 */}
      <header className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-lg border-b border-emerald-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          {/* 상단 브랜딩 및 네비게이션 */}
          <div className="flex items-center justify-between mb-4">
            {/* 브랜드 로고 */}
            <Link href="/" className="hover:scale-105 transition-transform duration-200">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-full shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    질문톡톡! 논제샘솟!
                  </h1>
                  <p className="text-xs text-emerald-600 font-medium">토론 교육 플랫폼</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    질문톡톡!
                  </h1>
                </div>
              </div>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {backLabel}
              </Button>
              
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
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
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
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
                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 p-2"
              >
                <svg
                  className="h-6 w-6"
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
                <div className="absolute right-4 top-16 w-56 bg-white rounded-xl shadow-xl border border-emerald-100 z-50">
                  <div className="p-2 space-y-1">
                    <Button
                      onClick={() => {
                        handleBack()
                        setIsMobileMenuOpen(false)
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-emerald-700 hover:bg-emerald-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      {backLabel}
                    </Button>
                    
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-emerald-700 hover:bg-emerald-50"
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
                        className="w-full justify-start text-emerald-700 hover:bg-emerald-50"
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

          {/* 페이지 정보 영역 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-3 rounded-full shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-emerald-800">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-emerald-600 text-sm md:text-base mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* 세션 및 사용자 정보 */}
            {showSessionInfo && (sessionCode || studentName) && (
              <div className="flex flex-wrap items-center gap-2">
                {sessionCode && (
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                    <span className="text-xs font-medium text-emerald-700">
                      세션: <span className="font-bold">{sessionCode}</span>
                    </span>
                  </div>
                )}
                
                {studentName && (
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                    <span className="text-xs font-medium text-emerald-800 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {studentName}
                      {studentGroup && (
                        <>
                          <span className="text-emerald-600 mx-1">|</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {studentGroup} 모둠
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 브레드크럼 네비게이션 */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-1 text-sm text-gray-500">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              홈
            </Link>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-emerald-600 font-medium">토론 시스템</span>
            {sessionCode && (
              <>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900">{sessionCode}</span>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}