'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { logoutUser } from '@/lib/auth'

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, userProfile, loading } = useAuth()
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
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
    <header className="bg-white shadow-sm mb-8 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="z-20">
          <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="hidden sm:inline">질문톡톡! 논제샘솟!</span>
            <span className="sm:hidden">질문톡톡!</span>
          </h1>
        </Link>
        
        {/* 모바일 햄버거 메뉴 버튼 */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 z-20"
          onClick={toggleMenu}
          aria-label="메뉴 열기/닫기"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:block">
          <div className="flex items-center gap-6">
            <ul className="flex gap-6">
              <li>
                <Link 
                  href="/"
                  className={`text-gray-600 hover:text-primary ${pathname === '/' ? 'font-medium text-primary' : ''}`}
                >
                  홈
                </Link>
              </li>
              <li>
                <div className="relative group">
                  <Link 
                    href="/teacher/dashboard"
                    className={`text-gray-600 hover:text-primary ${pathname?.startsWith('/teacher') ? 'font-medium text-primary' : ''}`}
                  >
                    교사용
                  </Link>
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 z-10">
                    <div className="py-1">
                      <Link 
                        href="/teacher/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        대시보드
                      </Link>
                      <Link 
                        href="/teacher/session/create"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        세션 생성
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <Link 
                  href="/guide"
                  className={`text-gray-600 hover:text-primary ${pathname === '/guide' ? 'font-medium text-primary' : ''}`}
                >
                  이용 가이드
                </Link>
              </li>
            </ul>
            
            {/* 인증 관련 버튼 */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-gray-700 hover:text-primary">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </div>
                      <span className="hidden lg:inline">{userProfile?.displayName || '사용자'}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 z-10">
                      <div className="py-1">
                        <Link 
                          href="/teacher/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          내 대시보드
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link 
                      href="/auth/login"
                      className="text-gray-600 hover:text-primary"
                    >
                      로그인
                    </Link>
                    <Link 
                      href="/auth/register"
                      className="bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </nav>
        
        {/* 모바일 네비게이션 오버레이 */}
        <div 
          className={`fixed inset-0 bg-white z-10 transition-transform duration-300 md:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <ul className="flex flex-col gap-8 text-center">
              <li>
                <Link 
                  href="/"
                  className={`text-xl ${pathname === '/' ? 'font-medium text-primary' : 'text-gray-600'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  홈
                </Link>
              </li>
              <li>
                <div className="flex flex-col space-y-4">
                  <Link 
                    href="/teacher/dashboard"
                    className={`text-xl ${pathname === '/teacher/dashboard' ? 'font-medium text-primary' : 'text-gray-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    교사 대시보드
                  </Link>
                  <Link 
                    href="/teacher/session/create"
                    className={`text-xl ${pathname === '/teacher/session/create' ? 'font-medium text-primary' : 'text-gray-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    세션 생성
                  </Link>
                </div>
              </li>
              <li>
                <Link 
                  href="/guide"
                  className={`text-xl ${pathname === '/guide' ? 'font-medium text-primary' : 'text-gray-600'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  이용 가이드
                </Link>
              </li>
              
              {/* 모바일 인증 메뉴 */}
              {!loading && (
                <li className="border-t border-gray-100 pt-6 mt-4 w-full">
                  {user ? (
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          {userProfile?.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <span>{userProfile?.displayName || '사용자'}</span>
                      </div>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="text-gray-600 hover:text-primary"
                      >
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <Link 
                        href="/auth/login"
                        className="text-xl text-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        로그인
                      </Link>
                      <Link 
                        href="/auth/register"
                        className="text-xl text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        회원가입
                      </Link>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}