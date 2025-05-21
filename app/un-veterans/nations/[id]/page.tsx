'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Header from '@/components/common/Header'
import { getNationById, Nation } from '@/lib/un-nations'

export default function NationDetailPage() {
  const { id } = useParams()
  const [nation, setNation] = useState<Nation | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadNationData = async () => {
      setLoading(true)
      if (typeof id === 'string') {
        const nationData = await getNationById(id)
        setNation(nationData)
      }
      setLoading(false)
    }
    
    loadNationData()
  }, [id])
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-60 bg-gray-100 rounded-lg"></div>
              </div>
              <div className="md:w-2/3">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-6"></div>
                
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-6"></div>
                
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
  
  if (!nation) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Link href="/un-veterans/nations" className="text-primary hover:underline flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            참전국 목록으로 돌아가기
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-700 mb-2">찾을 수 없는 국가입니다</h1>
            <p className="text-gray-600 mb-6">요청하신 참전국 정보를 찾을 수 없습니다.</p>
            <Link href="/un-veterans/nations" className="btn-primary inline-block">
              참전국 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </>
    )
  }
  
  const typeLabel = 
    nation.type === 'combat' ? '전투병 파병국' :
    nation.type === 'medical' ? '의료 지원국' : '물자 지원국'
  
  const typeColor = 
    nation.type === 'combat' ? 'bg-red-100 text-red-800' :
    nation.type === 'medical' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  
  const totalCasualties = nation.casualties ? 
    (nation.casualties.killed + nation.casualties.wounded + nation.casualties.missing) : 0
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link href="/un-veterans/nations" className="text-primary hover:underline flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          참전국 목록으로 돌아가기
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-col items-center">
                <div className="w-32 h-20 md:w-full md:h-24 relative mb-4 overflow-hidden">
                  <Image
                    src={nation.flag}
                    alt={`${nation.name} 국기`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <h1 className="text-2xl font-bold text-center mb-1">{nation.name}</h1>
                <p className="text-gray-500 text-sm mb-3">{nation.nameEn}</p>
                <span className={`px-3 py-1 rounded-full text-sm ${typeColor}`}>
                  {typeLabel}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-bold text-gray-700 mb-3">참전 정보</h2>
                
                {nation.deploymentSize && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">파병 규모</p>
                    <p className="font-medium">{nation.deploymentSize.toLocaleString()}명</p>
                  </div>
                )}
                
                {nation.deploymentPeriod && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">참전 기간</p>
                    <p className="font-medium">
                      {new Date(nation.deploymentPeriod.start).toLocaleDateString()} ~ 
                      {new Date(nation.deploymentPeriod.end).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {nation.casualties && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">희생자</p>
                    <p className="font-medium">{totalCasualties.toLocaleString()}명</p>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>전사: {nation.casualties.killed.toLocaleString()}명</p>
                      <p>부상: {nation.casualties.wounded.toLocaleString()}명</p>
                      <p>실종: {nation.casualties.missing.toLocaleString()}명</p>
                    </div>
                  </div>
                )}
                
                {nation.languages && (
                  <div>
                    <p className="text-sm text-gray-500">공식 언어</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {nation.languages.map(lang => (
                        <span key={lang} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {lang === 'en' && '영어'}
                          {lang === 'fr' && '프랑스어'}
                          {lang === 'tr' && '터키어'}
                          {lang === 'sv' && '스웨덴어'}
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Link 
                  href={`/un-veterans/write-letter?nation=${nation.id}`}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  감사 편지 작성하기
                </Link>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 lg:w-3/4">
              {nation.background && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-primary mb-3">참전 배경</h2>
                  <p className="text-gray-700 whitespace-pre-line">{nation.background}</p>
                </div>
              )}
              
              {nation.mainActivities && nation.mainActivities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-primary mb-3">주요 활동</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {nation.mainActivities.map((activity, index) => (
                      <li key={index} className="text-gray-700">{activity}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {nation.koreanRelations && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-primary mb-3">한국과의 관계</h2>
                  <p className="text-gray-700 whitespace-pre-line">{nation.koreanRelations}</p>
                </div>
              )}
              
              {nation.culture && (
                <div>
                  <h2 className="text-xl font-bold text-primary mb-3">문화와 역사</h2>
                  <p className="text-gray-700 whitespace-pre-line">{nation.culture}</p>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-700 mb-4">관련 자료</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/un-veterans/resources" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-gray-700">교육 자료 보기</span>
                  </Link>
                  <Link href={`/un-veterans/gallery?nation=${nation.id}`} className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">사진 갤러리</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}