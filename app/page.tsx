'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const [sessionCode, setSessionCode] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationLinks = [
    { name: "이용 가이드", url: "/guide", target: "_self" },
    { name: "교육자료실", url: "/materials", target: "_self" }
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* 네비게이션 바 */}
      <div className="absolute top-0 right-0 p-4 z-10 w-full flex justify-end">
        {/* 모바일 메뉴 버튼 */}
        <button 
          className="md:hidden bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg z-20 hover:scale-105 transition-transform"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="메뉴 열기/닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:flex gap-4 bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg">
          {navigationLinks.map((link, index) => (
            <Link 
              key={index}
              href={link.url} 
              target={link.target}
              className="relative text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 group px-3 py-1"
            >
              {link.name === "교육자료실" && (
                <span className="mr-1">📚</span>
              )}
              {link.name === "이용 가이드" && (
                <span className="mr-1">📖</span>
              )}
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="absolute top-14 right-4 md:hidden bg-white rounded-xl shadow-2xl p-4 z-10 min-w-[150px] animate-fadeIn">
            <div className="flex flex-col gap-3">
              {navigationLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.url} 
                  target={link.target}
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 px-3 py-2 hover:bg-purple-50 rounded-lg flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name === "교육자료실" && (
                    <span className="mr-2">📚</span>
                  )}
                  {link.name === "이용 가이드" && (
                    <span className="mr-2">📖</span>
                  )}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 md:gap-8 px-4 pt-16">
        {/* 타이틀 섹션 */}
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              질문톡톡! 
            </span>
            <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              논제샘솟!
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            학생들의 질문으로 토론 논제를 발굴하는 교육 플랫폼
          </p>
        </div>
        
        {/* 메인 카드 그리드 - 3개로 축소 */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* 선생님 카드 */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-br from-purple-400 to-pink-400 p-4 rounded-full mb-3 w-20 h-20 flex items-center justify-center shadow-lg">
                <span className="text-4xl">👩‍🏫</span>
              </div>
              <CardTitle className="text-2xl text-purple-800">선생님이신가요?</CardTitle>
              <CardDescription className="text-purple-600">
                새로운 토론 세션을 만들고<br/>학생들의 질문을 수집하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teacher/dashboard" className="block">
                <Button className="w-full" variant="default">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  교사 대시보드
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* 학생 카드 */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-br from-blue-400 to-cyan-400 p-4 rounded-full mb-3 w-20 h-20 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🙋‍♂️</span>
              </div>
              <CardTitle className="text-2xl text-blue-800">학생이신가요?</CardTitle>
              <CardDescription className="text-blue-600">
                선생님이 제공한<br/>세션 코드를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="세션 코드 입력"
                    className="w-full px-4 py-3 text-center uppercase tracking-wider rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-bold text-lg"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    pattern="[A-Z0-9]{6}"
                    autoComplete="off"
                  />
                  {sessionCode && (
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className={`block ${!sessionCode && 'pointer-events-none'}`}
                  onClick={(e) => !sessionCode && e.preventDefault()}
                >
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    disabled={!sessionCode}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    세션 참여하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* 토론 시스템 카드 */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-br from-green-400 to-emerald-400 p-4 rounded-full mb-3 w-20 h-20 flex items-center justify-center shadow-lg">
                <span className="text-4xl">💬</span>
              </div>
              <CardTitle className="text-2xl text-green-800">토론 시스템</CardTitle>
              <CardDescription className="text-green-600">
                AI 피드백과 함께하는<br/>체계적인 토론 의견 관리
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/teacher/debate" className="block">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  교사: 토론 관리
                </Button>
              </Link>
              <Link href="/student/debate" className="block">
                <Button className="w-full" variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  학생: 의견 제출
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* 하단 정보 */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-xs md:text-sm text-gray-600">
            © 2025 질문톡톡! 논제샘솟! - 교육용 토론 플랫폼
          </p>
        </div>
      </div>
    </div>
  )
}