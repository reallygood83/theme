'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [sessionCode, setSessionCode] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationLinks = [
    { name: "이용 가이드", url: "/guide", target: "_self" }
  ]

  return (
    <div className="relative min-h-screen">
      {/* 네비게이션 바 */}
      <div className="absolute top-0 right-0 p-4 z-10 w-full flex justify-end">
        {/* 모바일 메뉴 버튼 */}
        <button 
          className="md:hidden bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md z-20"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="메뉴 열기/닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:flex gap-6 bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md">
          {navigationLinks.map((link, index) => (
            <Link 
              key={index}
              href={link.url} 
              target={link.target}
              className="relative text-gray-700 hover:text-primary font-medium transition-colors duration-200 group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="absolute top-14 right-4 md:hidden bg-white rounded-lg shadow-xl p-4 z-10 min-w-[150px] animate-fadeIn">
            <div className="flex flex-col gap-3">
              {navigationLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.url} 
                  target={link.target}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 px-2 py-1 hover:bg-gray-50 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 md:gap-8 px-4 pt-16">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          <span className="hidden sm:inline">질문톡톡! 논제샘솟!</span>
          <span className="sm:hidden">질문톡톡!</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
          학생들의 질문으로 토론 논제를 발굴하는 교육 플랫폼
        </p>
      </div>
      
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <div className="card flex flex-col items-center justify-center text-center p-4 md:p-8 shadow-md hover:shadow-lg transition-shadow">
          <div className="bg-primary/10 p-3 md:p-4 rounded-full mb-3 md:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">선생님이신가요?</h2>
          <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
            새로운 토론 세션을 만들고 학생들의 질문을 수집하세요.
          </p>
          <Link href="/teacher/dashboard" className="btn-primary w-full py-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            교사 대시보드
          </Link>
        </div>
        
        <div className="card flex flex-col items-center justify-center text-center p-4 md:p-8 shadow-md hover:shadow-lg transition-shadow">
          <div className="bg-secondary/10 p-3 md:p-4 rounded-full mb-3 md:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">학생이신가요?</h2>
          <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
            선생님이 제공한 세션 코드를 입력하여 참여하세요.
          </p>
          <div className="w-full">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="세션 코드 입력"
                className="input-field pr-10 text-center uppercase tracking-wider"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                maxLength={6}
                pattern="[A-Z0-9]{6}"
                autoComplete="off"
              />
              {sessionCode && (
                <button 
                  type="button" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSessionCode('')}
                  aria-label="코드 초기화"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <Link 
              href={sessionCode ? `/student/session/${sessionCode}` : '#'}
              className={`btn-secondary w-full py-3 flex items-center justify-center ${!sessionCode && 'opacity-50 cursor-not-allowed'}`}
              onClick={(e) => !sessionCode && e.preventDefault()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              세션 참여하기
            </Link>
          </div>
        </div>
        
        <div className="card flex flex-col items-center justify-center text-center p-4 md:p-8 shadow-md hover:shadow-lg transition-shadow">
          <div className="bg-purple-100 p-3 md:p-4 rounded-full mb-3 md:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">교육자료실</h2>
          <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
            토론 활동지를 다운로드하거나 바로 인쇄해보세요.
          </p>
          <Link href="/materials" className="btn-primary bg-purple-600 hover:bg-purple-700 w-full py-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            교육자료실 가기
          </Link>
        </div>
      </div>
      
      <div className="mt-6 md:mt-8 text-center">
        <div className="mb-4">
          <Link 
            href="/auth/judge-login" 
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            심사위원 로그인
          </Link>
        </div>
        <p className="text-xs md:text-sm text-gray-500">
          © 2025 질문톡톡! 논제샘솟! - 교육용 토론 플랫폼
        </p>
      </div>
    </div>
    </div>
  )
}