'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function Home() {
  const [sessionCode, setSessionCode] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigationLinks = [
    { name: "이용 가이드", url: "/guide", target: "_self" }
  ]

  return (
    <div className="landing-container w-full min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 safe-area prevent-layout-shift">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-32 right-10 w-80 h-80 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float-slow"></div>
      </div>

      {/* Navigation Bar */}
      <header className="landing-header sticky top-0 left-0 right-0 z-20 p-4 md:p-6 bg-transparent">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Q</span>
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                질문톡톡! 논제샘솟!
              </h1>
              <p className="text-xs text-gray-600">AI 토론 교육 플랫폼</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-full px-6 py-2 shadow-lg border border-white/20">
              {navigationLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.url} 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 px-3 py-2 rounded-full hover:bg-purple-50"
                >
                  📖 {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/20 transition-all duration-200 hover:scale-105"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기/닫기"
          >
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="absolute top-full mt-2 right-6 md:hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 min-w-[200px] border border-white/20 animate-fadeIn">
              {navigationLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={link.url} 
                  className="block text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 px-3 py-3 rounded-lg hover:bg-purple-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📖 {link.name}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="landing-main z-10 flex flex-col items-center justify-center gap-4 md:gap-6 px-3 md:px-4 pb-12 md:pb-16">
        {/* Hero Section */}
        <div className="text-center max-w-6xl mx-auto animate-fadeInUp flex-shrink-0 px-2">
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
            <span className="px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full text-sm font-medium text-purple-700 border border-white/20 shadow-lg">
              ✨ 초등학생 맞춤
            </span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full text-sm font-medium text-blue-700 border border-white/20 shadow-lg">
              🤖 AI 지원
            </span>
            <span className="px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full text-sm font-medium text-pink-700 border border-white/20 shadow-lg">
              ⚡ 실시간 협업
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-3 md:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-shimmer">
              질문톡톡! 논제샘솟!
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-3 md:mb-4 max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-purple-700">AI가 도와주는</span> 스마트한 토론 교육
          </p>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            학생들의 질문으로 토론 논제를 발굴하고, 근거자료까지 자동으로 찾아주는 혁신적인 교육 플랫폼
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl animate-fadeInUp delay-200 px-2">
          {/* Teacher Card */}
          <Card className="group relative border-0 bg-white/40 backdrop-blur-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent group-hover:from-purple-500/20 group-hover:via-pink-500/10 transition-all duration-500"></div>
            <CardHeader className="text-center relative z-10 pb-6">
              <div className="mx-auto bg-gradient-to-br from-purple-400 to-pink-400 p-6 rounded-3xl mb-6 w-24 h-24 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <span className="text-5xl">👩‍🏫</span>
              </div>
              <CardTitle className="text-3xl font-bold text-purple-800 mb-3">선생님이신가요?</CardTitle>
              <CardDescription className="text-purple-600 text-lg leading-relaxed">
                새로운 토론 세션을 만들고<br/>
                <span className="font-semibold">AI 분석으로 스마트하게 관리하세요</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Link href="/teacher/dashboard" className="block">
                <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  교사 대시보드 시작하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="group relative border-0 bg-white/40 backdrop-blur-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent group-hover:from-blue-500/20 group-hover:via-cyan-500/10 transition-all duration-500"></div>
            <CardHeader className="text-center relative z-10 pb-6">
              <div className="mx-auto bg-gradient-to-br from-blue-400 to-cyan-400 p-6 rounded-3xl mb-6 w-24 h-24 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <span className="text-5xl">🙋‍♂️</span>
              </div>
              <CardTitle className="text-3xl font-bold text-blue-800 mb-3">학생이신가요?</CardTitle>
              <CardDescription className="text-blue-600 text-lg leading-relaxed">
                선생님이 제공한 세션 코드를 입력하여<br/>
                <span className="font-semibold">흥미진진한 토론에 참여하세요</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="세션 코드 입력 (예: ABC123)"
                    className="text-center uppercase tracking-widest border-blue-200/50 bg-white/70 backdrop-blur-xl focus:border-blue-400 focus:ring-blue-200/50 font-bold text-xl placeholder-gray-400 px-6 py-4 rounded-2xl"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    autoComplete="off"
                  />
                  {sessionCode && (
                    <button 
                      type="button" 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setSessionCode('')}
                      aria-label="코드 초기화"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!sessionCode}
                  >
                    <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    토론 세션 참여하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section - 간소화된 4개 핵심 기능 */}
        <section className="w-full max-w-6xl mx-auto animate-fadeInUp delay-400 mt-4 flex-shrink-0 px-2">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "💭",
                title: "질문기반 토론 세션",
                description: "학생들의 자연스러운 질문으로 토론 주제를 발굴"
              },
              {
                icon: "🤖",
                title: "AI 토론 시나리오",
                description: "인공지능이 생성하는 맞춤형 토론 시나리오"
              },
              {
                icon: "🔍",
                title: "근거 자료 검색",
                description: "토론에 필요한 신뢰할 수 있는 자료를 자동 검색"
              },
              {
                icon: "👥",
                title: "교사간 공유",
                description: "우수한 세션과 주제를 동료 교사들과 공유"
              }
            ].map((feature, index) => (
              <Card key={index} className="group border-0 bg-white/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/40">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer - 간소화 */}
      <footer className="relative z-10 py-2 md:py-3 mt-auto">
        <div className="text-center px-4">
          <p className="text-xs text-gray-500">
            © 2025 질문톡톡! 논제샘솟! - AI 기반 토론 교육 플랫폼
          </p>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes shimmer-delayed {
          0% { background-position: 1000px 0; }
          100% { background-position: -1000px 0; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-shimmer {
          background-size: 2000px 100%;
          animation: shimmer 3s linear infinite;
        }
        
        .animate-shimmer-delayed {
          background-size: 2000px 100%;
          animation: shimmer-delayed 3s linear infinite;
          animation-delay: 0.5s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  )
}