'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/common/Header'

type ResourceType = 'lesson' | 'video' | 'document' | 'image' | 'activity'
type AudienceType = 'elementary' | 'middle' | 'high' | 'teacher'

interface Resource {
  id: string
  title: string
  type: ResourceType
  audience: AudienceType[]
  description: string
  thumbnailUrl: string
  downloadUrl?: string
  externalUrl?: string
}

// Sample resources
const resources: Resource[] = [
  {
    id: 'korean-war-overview',
    title: '6.25 전쟁 개요',
    type: 'lesson',
    audience: ['elementary', 'middle', 'high'],
    description: '6.25 전쟁의 배경, 전개 과정, 결과에 대한 종합적인 학습 자료입니다.',
    thumbnailUrl: '/images/resources/korean-war-map.jpg',
    downloadUrl: '/resources/korean-war-overview.pdf'
  },
  {
    id: 'un-participation',
    title: 'UN의 한국전 참전 배경',
    type: 'document',
    audience: ['middle', 'high', 'teacher'],
    description: 'UN이 한국전쟁에 참여하게 된 배경과 의의에 대한 상세 자료입니다.',
    thumbnailUrl: '/images/resources/un-flag.jpg',
    downloadUrl: '/resources/un-participation.pdf'
  },
  {
    id: 'veterans-stories',
    title: '참전용사들의 이야기',
    type: 'video',
    audience: ['elementary', 'middle', 'high'],
    description: '다양한 국가 출신 참전용사들의 인터뷰와 증언을 담은 영상 모음입니다.',
    thumbnailUrl: '/images/resources/veterans.jpg',
    externalUrl: 'https://www.youtube.com/watch?v=example'
  },
  {
    id: 'letter-writing-guide',
    title: '감사 편지 작성 가이드',
    type: 'activity',
    audience: ['elementary', 'middle', 'high'],
    description: '참전국에 보내는 감사 편지 작성을 위한 가이드와 활동지입니다.',
    thumbnailUrl: '/images/resources/letter.jpg',
    downloadUrl: '/resources/letter-writing-guide.pdf'
  },
  {
    id: 'korean-war-timeline',
    title: '6.25 전쟁 타임라인',
    type: 'image',
    audience: ['elementary', 'middle', 'high', 'teacher'],
    description: '6.25 전쟁의 주요 사건과 전개 과정을 시간순으로 정리한 인포그래픽입니다.',
    thumbnailUrl: '/images/resources/timeline.jpg',
    downloadUrl: '/resources/korean-war-timeline.jpg'
  },
  {
    id: 'lesson-plan',
    title: '6.25 UN 참전국 수업 지도안',
    type: 'lesson',
    audience: ['teacher'],
    description: '교사를 위한 6.25 UN 참전국 관련 수업 지도안과 학습 자료입니다.',
    thumbnailUrl: '/images/resources/lesson-plan.jpg',
    downloadUrl: '/resources/lesson-plan.pdf'
  }
]

export default function ResourcesPage() {
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null)
  const [selectedAudience, setSelectedAudience] = useState<AudienceType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter resources based on selected filters and search term
  const filteredResources = resources.filter(resource => {
    const matchesType = selectedType ? resource.type === selectedType : true
    const matchesAudience = selectedAudience ? resource.audience.includes(selectedAudience) : true
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesAudience && matchesSearch
  })
  
  // Helper to get resource type label in Korean
  const getTypeLabel = (type: ResourceType): string => {
    switch (type) {
      case 'lesson': return '수업 자료'
      case 'video': return '영상'
      case 'document': return '문서'
      case 'image': return '이미지'
      case 'activity': return '활동지'
      default: return type
    }
  }
  
  // Helper to get audience label in Korean
  const getAudienceLabel = (audience: AudienceType): string => {
    switch (audience) {
      case 'elementary': return '초등학생'
      case 'middle': return '중학생'
      case 'high': return '고등학생'
      case 'teacher': return '교사용'
      default: return audience
    }
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Link href="/un-veterans" className="text-primary hover:underline flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          참전국 메인으로 돌아가기
        </Link>
        
        <h1 className="text-3xl font-bold text-primary mb-4">교육 자료</h1>
        <p className="text-gray-600 mb-8">
          6.25 전쟁과 UN의 역할, 참전국의 역사와 문화에 대한 다양한 교육 자료를 제공합니다.
          수업 자료, 영상, 문서 등 다양한 형태의 자료를 활용하여 학생들에게 6.25 전쟁의 의미와 참전국의 희생에 대해 가르치세요.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="자료 검색"
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
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value as ResourceType || null)}
              >
                <option value="">자료 유형: 전체</option>
                <option value="lesson">수업 자료</option>
                <option value="video">영상</option>
                <option value="document">문서</option>
                <option value="image">이미지</option>
                <option value="activity">활동지</option>
              </select>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                value={selectedAudience || ''}
                onChange={(e) => setSelectedAudience(e.target.value as AudienceType || null)}
              >
                <option value="">대상: 전체</option>
                <option value="elementary">초등학생</option>
                <option value="middle">중학생</option>
                <option value="high">고등학생</option>
                <option value="teacher">교사용</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <div key={resource.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-gray-100">
                  <div className="w-full h-full">
                    {/* In a real app, these images would exist */}
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">이미지 썸네일</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${
                      resource.type === 'lesson' ? 'bg-blue-500' :
                      resource.type === 'video' ? 'bg-red-500' :
                      resource.type === 'document' ? 'bg-green-500' :
                      resource.type === 'image' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}>
                      {getTypeLabel(resource.type)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.audience.map(audience => (
                      <span key={audience} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {getAudienceLabel(audience)}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    {resource.downloadUrl && (
                      <a 
                        href={resource.downloadUrl}
                        className="text-primary hover:underline text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        다운로드
                      </a>
                    )}
                    
                    {resource.externalUrl && (
                      <a 
                        href={resource.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        바로가기
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredResources.length === 0 && (
              <div className="col-span-full text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">추천 교육 활동</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">참전국 감사 편지 쓰기 프로젝트</h3>
              <p className="text-gray-600 mb-4">
                학생들이 특정 참전국을 선택하여 해당 국가의 역사와 문화, 참전 배경을 조사한 후 감사 편지를 작성하는 프로젝트입니다.
              </p>
              <Link href="/un-veterans/write-letter" className="text-primary hover:underline">
                편지 쓰기 시작하기 &rarr;
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-2">참전국 문화 교류 활동</h3>
              <p className="text-gray-600 mb-4">
                각 참전국의 음식, 예술, 전통 등 문화적 요소를 학습하고 체험하는 활동입니다. 국제 이해 교육과 연계하여 활용할 수 있습니다.
              </p>
              <Link href="#" className="text-primary hover:underline">
                활동 자료 보기 &rarr;
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            더 많은 교육 자료를 찾으시나요? <Link href="#" className="text-primary hover:underline">자료 요청하기</Link>
          </p>
        </div>
      </div>
    </>
  )
}