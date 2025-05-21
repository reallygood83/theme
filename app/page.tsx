'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [sessionCode, setSessionCode] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">질문톡톡! 논제샘솟!</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          학생들의 질문으로 Gemini 2.0 Flash AI가 토론 논제를 발굴하는 교육 플랫폼
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="card flex flex-col items-center justify-center text-center p-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">선생님이신가요?</h2>
          <p className="mb-6 text-gray-600">
            새로운 토론 세션을 만들고 학생들의 질문을 수집하세요.
          </p>
          <Link href="/teacher/session/create" className="btn-primary w-full">
            세션 만들기
          </Link>
        </div>
        
        <div className="card flex flex-col items-center justify-center text-center p-8">
          <div className="bg-secondary/10 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">학생이신가요?</h2>
          <p className="mb-6 text-gray-600">
            선생님이 제공한 세션 코드를 입력하여 참여하세요.
          </p>
          <div className="w-full">
            <input
              type="text"
              placeholder="세션 코드 입력"
              className="input-field mb-4"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
            />
            <Link 
              href={sessionCode ? `/student/session/${sessionCode}` : '#'}
              className={`btn-secondary w-full ${!sessionCode && 'opacity-50 cursor-not-allowed'}`}
              onClick={(e) => !sessionCode && e.preventDefault()}
            >
              세션 참여하기
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2025 질문톡톡! 논제샘솟! | Google Gemini 2.0 Flash 활용
        </p>
      </div>
    </div>
  )
}