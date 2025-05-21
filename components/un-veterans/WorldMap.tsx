'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Nation = {
  id: string
  name: string
  flag: string
  type: 'combat' | 'medical' | 'material'
  region: string
}

type WorldMapProps = {
  nations: Nation[]
  loading: boolean
}

export default function WorldMap({ nations, loading }: WorldMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [hoveredNation, setHoveredNation] = useState<Nation | null>(null)

  if (loading) {
    return (
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">세계 지도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // Filter nations by region if a region is selected
  const filteredNations = selectedRegion
    ? nations.filter(nation => nation.region === selectedRegion)
    : nations

  // Count by region and type
  const countByRegion = nations.reduce((acc, nation) => {
    acc[nation.region] = (acc[nation.region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const regions = [
    { id: 'asia', name: '아시아' },
    { id: 'europe', name: '유럽' },
    { id: 'north-america', name: '북미' },
    { id: 'south-america', name: '남미' },
    { id: 'africa', name: '아프리카' },
    { id: 'oceania', name: '오세아니아' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary mb-4">UN 참전국 세계 지도</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedRegion(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedRegion === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({nations.length})
          </button>
          
          {regions.map(region => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedRegion === region.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {region.name} ({countByRegion[region.id] || 0})
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-blue-50 rounded-lg overflow-hidden">
        {/* Map will be implemented here. For now, just a placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">세계 지도 플레이스홀더 - 추후 실제 지도로 교체됩니다</p>
        </div>
        
        {/* Nation pins on the map would be positioned absolutely here */}
        
        {/* Tooltip for hovered nation */}
        {hoveredNation && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-center mb-2">
              <div className="w-8 h-6 mr-2 relative overflow-hidden">
                <Image 
                  src={hoveredNation.flag} 
                  alt={`${hoveredNation.name} 국기`}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <h3 className="font-bold">{hoveredNation.name}</h3>
            </div>
            <p className="text-sm text-gray-600">
              {hoveredNation.type === 'combat' && '전투병 파병국'}
              {hoveredNation.type === 'medical' && '의료 지원국'}
              {hoveredNation.type === 'material' && '물자 지원국'}
            </p>
            <Link
              href={`/un-veterans/nations/${hoveredNation.id}`}
              className="text-sm text-primary hover:underline block mt-2"
            >
              상세 정보 보기
            </Link>
          </div>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredNations.slice(0, 10).map(nation => (
          <Link 
            key={nation.id}
            href={`/un-veterans/nations/${nation.id}`}
            className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
            onMouseEnter={() => setHoveredNation(nation)}
            onMouseLeave={() => setHoveredNation(null)}
          >
            <div className="flex items-center">
              <div className="w-8 h-6 mr-2 relative overflow-hidden">
                <Image 
                  src={nation.flag} 
                  alt={`${nation.name} 국기`}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <span className="text-sm font-medium truncate">{nation.name}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {nation.type === 'combat' && '전투병 파병국'}
              {nation.type === 'medical' && '의료 지원국'}
              {nation.type === 'material' && '물자 지원국'}
            </p>
          </Link>
        ))}
        
        {filteredNations.length > 10 && (
          <Link 
            href="/un-veterans/nations"
            className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors text-center"
          >
            <span className="text-primary">+ {filteredNations.length - 10}개 더 보기</span>
          </Link>
        )}
      </div>
    </div>
  )
}