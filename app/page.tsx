'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [sessionCode, setSessionCode] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 md:gap-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          <span className="hidden sm:inline">질문톡톡! 논제샘솟!</span>
          <span className="sm:hidden">질문톡톡!</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
          학생들의 질문으로 Gemini 2.0 Flash AI가 토론 논제를 발굴하는 교육 플랫폼
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
          <div className="bg-indigo-100 p-3 md:p-4 rounded-full mb-3 md:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">6.25 참전국</h2>
          <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
            6.25 전쟁 UN 참전국에 감사 편지를 작성하고 역사를 배워보세요.
          </p>
          <Link href="/un-veterans" className="btn-primary bg-indigo-600 hover:bg-indigo-700 w-full py-3 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            참전국 방문하기
          </Link>
        </div>
      </div>
      
      <div className="mt-6 md:mt-8 text-center">
        <p className="text-xs md:text-sm text-gray-500">
          © 2025 질문톡톡! 논제샘솟! | Google Gemini 2.0 Flash 활용
        </p>
      </div>
    </div>
  )
}