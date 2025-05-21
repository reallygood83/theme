'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
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
              <Link 
                href="/teacher/session/create"
                className={`text-gray-600 hover:text-primary ${pathname?.startsWith('/teacher') ? 'font-medium text-primary' : ''}`}
              >
                교사용
              </Link>
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
                <Link 
                  href="/teacher/session/create"
                  className={`text-xl ${pathname?.startsWith('/teacher') ? 'font-medium text-primary' : 'text-gray-600'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  교사용
                </Link>
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
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}