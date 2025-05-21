'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/common/Header'
import { getNations, Nation } from '@/lib/un-nations'

export default function NationsPage() {
  const [nations, setNations] = useState<Nation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterRegion, setFilterRegion] = useState<string | null>(null)
  
  useEffect(() => {
    const loadNations = async () => {
      setLoading(true)
      const nationsData = await getNations()
      setNations(nationsData)
      setLoading(false)
    }
    
    loadNations()
  }, [])
  
  // Filter nations based on search term and filters
  const filteredNations = nations.filter(nation => {
    const matchesSearch = 
      nation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nation.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType ? nation.type === filterType : true
    const matchesRegion = filterRegion ? nation.region === filterRegion : true
    
    return matchesSearch && matchesType && matchesRegion
  })
  
  // Sort nations by name
  const sortedNations = [...filteredNations].sort((a, b) => a.name.localeCompare(b.name))
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/un-veterans" className="text-primary hover:underline flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            참전국 메인으로 돌아가기
          </Link>
          
          <h1 className="text-3xl font-bold text-primary mb-4">UN 참전국 목록</h1>
          <p className="text-gray-600 mb-6">
            6.25 전쟁 당시 UN 참전국 67개국의 정보를 확인하세요. 각 국가별로 참전 배경, 주요 활동, 한국과의 관계 등 상세 정보를 제공합니다.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="국가명 검색"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  value={filterType || ''}
                  onChange={(e) => setFilterType(e.target.value || null)}
                >
                  <option value="">유형: 전체</option>
                  <option value="combat">전투병 파병국</option>
                  <option value="medical">의료 지원국</option>
                  <option value="material">물자 지원국</option>
                </select>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  value={filterRegion || ''}
                  onChange={(e) => setFilterRegion(e.target.value || null)}
                >
                  <option value="">지역: 전체</option>
                  <option value="asia">아시아</option>
                  <option value="europe">유럽</option>
                  <option value="north-america">북미</option>
                  <option value="south-america">남미</option>
                  <option value="africa">아프리카</option>
                  <option value="oceania">오세아니아</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-gray-200 rounded mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="mt-3 h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sortedNations.map(nation => (
                    <Link
                      key={nation.id}
                      href={`/un-veterans/nations/${nation.id}`}
                      className="bg-white border border-gray-100 hover:border-primary hover:shadow-md rounded-lg p-4 transition-all"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-8 relative mr-3 overflow-hidden">
                          <Image
                            src={nation.flag}
                            alt={`${nation.name} 국기`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{nation.name}</h3>
                          <p className="text-xs text-gray-500">{nation.nameEn}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          nation.type === 'combat' 
                            ? 'bg-red-100 text-red-800' 
                            : nation.type === 'medical'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {nation.type === 'combat' && '전투병 파병국'}
                          {nation.type === 'medical' && '의료 지원국'}
                          {nation.type === 'material' && '물자 지원국'}
                        </span>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {sortedNations.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
                
                <div className="mt-6 text-center text-sm text-gray-500">
                  총 {sortedNations.length}개 국가 (전체 {nations.length}개 중)
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}