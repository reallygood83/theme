'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logoutUser } from '@/lib/auth'
import NotificationBell from '@/components/notifications/NotificationBell'
import { Button } from '@/components/ui/button'

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isTeacherMenuOpen, setIsTeacherMenuOpen] = useState(false)
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false)
  const { user, userProfile, loading } = useAuth()
  
  const teacherMenuRef = useRef<HTMLDivElement>(null)
  const studentMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teacherMenuRef.current && !teacherMenuRef.current.contains(event.target as Node)) {
        setIsTeacherMenuOpen(false)
      }
      if (studentMenuRef.current && !studentMenuRef.current.contains(event.target as Node)) {
        setIsStudentMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  const handleLogout = async () => {
    try {
      await logoutUser()
      // 홈페이지로 이동은 필요시
      window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }
  
  return (
    <header className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 shadow-lg mb-8 sticky top-0 z-10 backdrop-blur-sm border-b border-purple-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="z-20 hover:scale-105 transition-transform duration-200">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">질문톡톡! 논제샘솟!</span>
            <span className="sm:hidden bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">질문톡톡!</span>
          </h1>
        </Link>
        
        {/* 모바일 햄버거 메뉴 버튼 */}
        <button 
          className="md:hidden bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg z-20 hover:scale-105 transition-all duration-200 border border-purple-100"
          onClick={toggleMenu}
          aria-label="메뉴 열기/닫기"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:block">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                asChild
                variant={pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                className="text-sm font-medium"
              >
                <Link href="/">
                  🏠 홈
                </Link>
              </Button>
              
              <div 
                className="relative"
                ref={teacherMenuRef}
                onMouseEnter={() => setIsTeacherMenuOpen(true)}
                onMouseLeave={() => setIsTeacherMenuOpen(false)}
              >
                <Button
                  variant={pathname?.startsWith('/teacher') ? 'default' : 'ghost'}
                  size="sm"
                  className="text-sm font-medium"
                  onClick={() => setIsTeacherMenuOpen(!isTeacherMenuOpen)}
                >
                  👩‍🏫 교사용
                </Button>
                <div className={`absolute left-0 mt-2 w-52 rounded-xl shadow-xl bg-white ring-1 ring-purple-100 transition-all duration-200 z-50 border border-purple-100 ${
                  isTeacherMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  <div className="p-2">
                    <Link 
                      href="/teacher/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                      onClick={() => setIsTeacherMenuOpen(false)}
                    >
                      📊 대시보드
                    </Link>
                    <Link 
                      href="/teacher/session/create"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                      onClick={() => setIsTeacherMenuOpen(false)}
                    >
                      ➕ 세션 생성
                    </Link>
                    <Link 
                      href="/teacher/debate"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                      onClick={() => setIsTeacherMenuOpen(false)}
                    >
                      💬 토론 관리
                    </Link>
                  </div>
                </div>
              </div>
              
              <div 
                className="relative"
                ref={studentMenuRef}
                onMouseEnter={() => setIsStudentMenuOpen(true)}
                onMouseLeave={() => setIsStudentMenuOpen(false)}
              >
                <Button
                  variant={pathname?.startsWith('/student') ? 'default' : 'ghost'}
                  size="sm"
                  className="text-sm font-medium"
                  onClick={() => setIsStudentMenuOpen(!isStudentMenuOpen)}
                >
                  🙋‍♂️ 학생용
                </Button>
                <div className={`absolute left-0 mt-2 w-52 rounded-xl shadow-xl bg-white ring-1 ring-blue-100 transition-all duration-200 z-50 border border-blue-100 ${
                  isStudentMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}>
                  <div className="p-2">
                    <Link 
                      href="/"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => setIsStudentMenuOpen(false)}
                    >
                      🎯 토론 세션 참여
                    </Link>
                    <Link 
                      href="/student/debate"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => setIsStudentMenuOpen(false)}
                    >
                      ✍️ 토론 의견 제출
                    </Link>
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant={pathname === '/materials' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-sm font-medium"
              >
                <Link href="/materials">
                  📚 교육자료실
                </Link>
              </Button>
              
              <Button
                asChild
                variant={pathname === '/guide' ? 'fun' : 'ghost'}
                size="sm"
                className="text-sm font-medium"
              >
                <Link href="/guide">
                  📖 가이드
                </Link>
              </Button>
            </div>
            
            {/* 인증 관련 버튼 */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    {/* 알림 벨 */}
                    <NotificationBell />
                    
                    <div 
                      className="relative"
                      ref={userMenuRef}
                      onMouseEnter={() => setIsUserMenuOpen(true)}
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-purple-200 hover:border-purple-300"
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <span className="hidden lg:inline text-gray-700">{userProfile?.displayName || '사용자'}</span>
                      </Button>
                      
                      <div 
                        className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-purple-100 transition-all duration-150 z-50 border border-purple-100 ${
                          isUserMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                      >
                      <div className="p-2">
                        <Link 
                          href="/teacher/dashboard"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📊 내 대시보드
                        </Link>
                        <button 
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🚪 로그아웃
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium"
                    >
                      <Link href="/auth/login">
                        🔑 로그인
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="text-sm font-medium"
                    >
                      <Link href="/auth/register">
                        ✨ 회원가입
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </nav>
        
        {/* 모바일 네비게이션 오버레이 */}
        <div 
          className={`fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 z-10 transition-transform duration-300 md:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="flex flex-col gap-6 w-full max-w-sm">
              <Button
                asChild
                variant={pathname === '/' ? 'default' : 'ghost'}
                size="lg"
                className="justify-start text-lg font-medium w-full"
              >
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  🏠 홈
                </Link>
              </Button>
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-600 px-4">👩‍🏫 교사 메뉴</div>
                <Button
                  asChild
                  variant={pathname === '/teacher/dashboard' ? 'default' : 'ghost'}
                  size="lg"
                  className="justify-start text-lg font-medium w-full"
                >
                  <Link href="/teacher/dashboard" onClick={() => setIsMenuOpen(false)}>
                    📊 교사 대시보드
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === '/teacher/session/create' ? 'default' : 'ghost'}
                  size="lg"
                  className="justify-start text-lg font-medium w-full"
                >
                  <Link href="/teacher/session/create" onClick={() => setIsMenuOpen(false)}>
                    ➕ 세션 생성
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === '/teacher/debate' ? 'default' : 'ghost'}
                  size="lg"
                  className="justify-start text-lg font-medium w-full"
                >
                  <Link href="/teacher/debate" onClick={() => setIsMenuOpen(false)}>
                    💬 토론 관리
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-600 px-4">🙋‍♂️ 학생 메뉴</div>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="justify-start text-lg font-medium w-full"
                >
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    🎯 토론 세션 참여
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={pathname === '/student/debate' ? 'secondary' : 'ghost'}
                  size="lg"
                  className="justify-start text-lg font-medium w-full"
                >
                  <Link href="/student/debate" onClick={() => setIsMenuOpen(false)}>
                    ✍️ 토론 의견 제출
                  </Link>
                </Button>
              </div>

              <Button
                asChild
                variant={pathname === '/materials' ? 'secondary' : 'ghost'}
                size="lg"
                className="justify-start text-lg font-medium w-full"
              >
                <Link href="/materials" onClick={() => setIsMenuOpen(false)}>
                  📚 교육자료실
                </Link>
              </Button>
              
              <Button
                asChild
                variant={pathname === '/guide' ? 'fun' : 'ghost'}
                size="lg"
                className="justify-start text-lg font-medium w-full"
              >
                <Link href="/guide" onClick={() => setIsMenuOpen(false)}>
                  📖 이용 가이드
                </Link>
              </Button>
              
              {/* 모바일 인증 메뉴 */}
              {!loading && (
                <div className="border-t border-purple-200 pt-6 mt-4 w-full space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center justify-center gap-3 p-4 bg-white/70 rounded-xl border border-purple-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <span className="text-lg font-medium text-gray-700">{userProfile?.displayName || '사용자'}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center text-lg font-medium border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        🚪 로그아웃
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="w-full justify-center text-lg font-medium"
                      >
                        <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                          🔑 로그인
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="default"
                        size="lg"
                        className="w-full justify-center text-lg font-medium"
                      >
                        <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                          ✨ 회원가입
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}