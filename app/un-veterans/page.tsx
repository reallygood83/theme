'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import WorldMap from '@/components/un-veterans/WorldMap'
import NationStats from '@/components/un-veterans/NationStats'
import { getNations } from '@/lib/un-nations'

export default function UNVeterans() {
  const [nations, setNations] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadNations = async () => {
      setLoading(true)
      const nationsData = await getNations()
      setNations(nationsData)
      setLoading(false)
    }
    
    loadNations()
  }, [])
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            6.25 UN 참전국 감사 편지
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            한국전쟁 당시 UN 참전국에 대한 감사의 마음을 표현하는 교육용 플랫폼입니다.
            참전국에 대해 배우고 감사 편지를 작성해보세요.
          </p>
        </div>
        
        <div className="mb-12">
          <WorldMap nations={nations} loading={loading} />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              참전국 정보
            </h2>
            <p className="text-gray-600 mb-4">
              16개 전투병 파병국, 6개 의료 지원국, 약 40개 물자 지원국 등 총 67개국의 상세 정보를 확인하세요.
            </p>
            <Link href="/un-veterans/nations" className="btn-primary block text-center">
              참전국 보기
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              감사 편지 작성
            </h2>
            <p className="text-gray-600 mb-4">
              참전국에 감사의 마음을 담아 편지를 작성하세요. AI 번역 기술로 해당 국가의 언어로 번역됩니다.
            </p>
            <Link href="/un-veterans/write-letter" className="btn-primary block text-center">
              편지 작성하기
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              교육 자료
            </h2>
            <p className="text-gray-600 mb-4">
              6.25 전쟁과 UN의 역할, 참전국의 역사와 문화에 대한 교육 자료를 제공합니다.
            </p>
            <Link href="/un-veterans/resources" className="btn-primary block text-center">
              교육 자료 보기
            </Link>
          </div>
        </div>
        
        <div className="mt-12">
          <NationStats nations={nations} loading={loading} />
        </div>
      </div>
    </>
  )
}