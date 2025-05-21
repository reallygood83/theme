'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function EduHub() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const platforms = [
    {
      title: "질문톡톡! 논제샘솟!",
      description: "학생들의 질문으로 토론 논제를 발굴하는 교육 플랫폼",
      color: "bg-gradient-to-br from-rose-100 to-rose-200 hover:from-rose-200 hover:to-rose-300",
      textColor: "text-rose-800",
      borderColor: "border-rose-300",
      shadowColor: "shadow-rose-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      url: "/platform"
    },
    {
      title: "토론 메이트",
      description: "토론 근거 자료를 검색하고 활용하는 서비스",
      color: "bg-gradient-to-br from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300",
      textColor: "text-sky-800",
      borderColor: "border-sky-300",
      shadowColor: "shadow-sky-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      url: "https://evidence-search.vercel.app/"
    },
    {
      title: "LovableDebate",
      description: "토론 시나리오와 학습 피드백을 제공하는 서비스",
      color: "bg-gradient-to-br from-violet-100 to-violet-200 hover:from-violet-200 hover:to-violet-300",
      textColor: "text-violet-800",
      borderColor: "border-violet-300",
      shadowColor: "shadow-violet-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      url: "https://debate25.vercel.app/"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 md:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-rose-500 to-purple-600 mb-4">
            토론, 생각을 피어나게 하는 공간
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            질문에서 시작해 논제를 발견하고, 근거를 찾아 토론으로 연결되는 따뜻한 배움의 여정
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {platforms.map((platform, index) => (
            <Link 
              href={platform.url} 
              key={index}
              target={index > 0 ? "_blank" : "_self"}
              className={`relative flex flex-col items-center p-8 md:p-10 rounded-2xl border ${platform.borderColor} ${platform.color} ${platform.shadowColor} shadow-lg transform transition-all duration-300 ease-in-out ${hoveredCard === index ? 'scale-105 rotate-1' : 'scale-100 rotate-0'}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`${platform.textColor}`}>
                {platform.icon}
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${platform.textColor}`}>
                {platform.title}
              </h2>
              <p className="text-gray-700 text-center mb-6">
                {platform.description}
              </p>
              <div className={`absolute bottom-0 left-0 w-full h-1 ${hoveredCard === index ? 'bg-gradient-to-r from-transparent via-white to-transparent' : 'bg-transparent'} transition-all duration-500`}></div>
              
              <div className={`mt-auto px-4 py-2 rounded-full ${platform.textColor} font-medium transition-all duration-300 ${hoveredCard === index ? 'bg-white' : 'bg-white/50'}`}>
                {index === 0 ? '시작하기' : '방문하기'}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            🌟 토론으로 성장하는 즐거움을 경험하세요 🌟
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            토론은 단순한 주장의 대립이 아닌, 함께 생각하고 성장하는 과정입니다. 
            다양한 관점을 존중하며 더 나은 해결책을 찾아가는 여정에 초대합니다.
          </p>
        </div>
        
        <div className="mt-20 text-center text-sm text-gray-500">
          <p>
            © 2025 토론교육 플랫폼 시리즈 | 안양 박달초 김문정 | 
            <a 
              href="https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-rose-600 hover:underline ml-1"
            >
              유튜브 배움의 달인
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}