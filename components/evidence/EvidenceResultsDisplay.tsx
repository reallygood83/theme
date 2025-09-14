'use client'

import { useState, useMemo } from 'react'
import { EvidenceResult, EVIDENCE_TYPES, getReliabilityGrade } from '@/lib/types/evidence'

interface EvidenceResultsDisplayProps {
  results: EvidenceResult[]
  topic: string
  stance: string
  searchTime?: Date
}

export default function EvidenceResultsDisplay({ 
  results, 
  topic, 
  stance, 
  searchTime 
}: EvidenceResultsDisplayProps) {
  const [activeFilter, setActiveFilter] = useState<string>('전체')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 유튜브 결과와 기타 결과 분리
  const { youtubeResults, otherResults } = useMemo(() => {
    const youtube = results.filter(r => r.type === '유튜브 영상')
    const others = results.filter(r => r.type !== '유튜브 영상')
    return { youtubeResults: youtube, otherResults: others }
  }, [results])

  // 필터링된 결과
  const filteredResults = useMemo(() => {
    if (activeFilter === '전체') return otherResults
    if (activeFilter === '유튜브 영상') return youtubeResults
    return otherResults.filter(result => result.type === activeFilter)
  }, [otherResults, youtubeResults, activeFilter])

  // 결과 통계
  const stats = useMemo(() => {
    const counts = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return counts
  }, [results])

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getTypeColor = (type: string) => {
    const evidenceType = EVIDENCE_TYPES.find(t => t.value === type)
    return evidenceType?.color || '#6b7280'
  }

  const getTypeBadge = (type: string) => {
    const evidenceType = EVIDENCE_TYPES.find(t => t.value === type)
    return evidenceType?.label || type
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR')
    } catch {
      return dateString
    }
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
        <p className="text-gray-600">다른 키워드나 조건으로 다시 검색해보세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 결과 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          🎯 AI 근거 자료 검색 결과
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium opacity-90">토론 주제</div>
            <div className="font-semibold">{topic}</div>
          </div>
          <div>
            <div className="font-medium opacity-90">나의 입장</div>
            <div className="font-semibold">
              {stance === 'positive' ? '👍 찬성' : '👎 반대'}
            </div>
          </div>
          <div>
            <div className="font-medium opacity-90">찾은 자료</div>
            <div className="font-semibold">{results.length}개</div>
          </div>
        </div>
        {searchTime && (
          <div className="mt-3 text-xs opacity-75">
            검색 시간: {searchTime.toLocaleString('ko-KR')}
          </div>
        )}
      </div>

      {/* 필터 버튼들 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('전체')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === '전체'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체 ({otherResults.length})
        </button>
        
        {EVIDENCE_TYPES.map(type => {
          const count = stats[type.value] || 0
          if (count === 0) return null
          
          return (
            <button
              key={type.value}
              onClick={() => setActiveFilter(type.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === type.value
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: activeFilter === type.value ? type.color : undefined
              }}
            >
              {type.label} ({count})
            </button>
          )
        })}
      </div>

      {/* 유튜브 결과 (별도 섹션) */}
      {youtubeResults.length > 0 && activeFilter === '유튜브 영상' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            🎥 YouTube 영상 ({youtubeResults.length}개)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {youtubeResults.map((result) => (
              <div key={result.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* 썸네일 */}
                {result.videoData?.snippet?.thumbnails?.medium && (
                  <img
                    src={result.videoData.snippet.thumbnails.medium.url}
                    alt={result.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <h5 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {result.title}
                  </h5>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {result.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{result.source}</span>
                    {result.publishedDate && (
                      <span>{formatDate(result.publishedDate)}</span>
                    )}
                  </div>
                  
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    영상 보기
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기타 결과 */}
      {activeFilter !== '유튜브 영상' && (
        <div className="space-y-4">
          {filteredResults.map((result) => {
            const isExpanded = expandedItems.has(result.id)
            
            return (
              <div 
                key={result.id} 
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white mr-3"
                        style={{ backgroundColor: getTypeColor(result.type) }}
                      >
                        {getTypeBadge(result.type)}
                      </span>
                      {result.reliability && (() => {
                        const gradeInfo = getReliabilityGrade(result.reliability)
                        return (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2"
                            style={{ 
                              color: gradeInfo.color,
                              backgroundColor: gradeInfo.backgroundColor 
                            }}
                            title={gradeInfo.description}
                          >
                            {gradeInfo.grade} 등급
                          </span>
                        )
                      })()}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {result.title}
                    </h4>
                  </div>
                  
                  <button
                    onClick={() => toggleExpand(result.id)}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* 요약 정보 */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {result.summary || result.content.substring(0, 150) + '...'}
                  </p>
                </div>

                {/* 상세 내용 (확장 시) */}
                {isExpanded && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">상세 내용</h5>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {result.content}
                      </p>
                    </div>
                    
                    {result.author && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">작성자</h5>
                        <p className="text-gray-600">{result.author}</p>
                      </div>
                    )}
                    
                    {result.tags && result.tags.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">관련 키워드</h5>
                        <div className="flex flex-wrap gap-1">
                          {result.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 푸터 */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">📍 {result.source}</span>
                    {result.publishedDate && (
                      <span>📅 {formatDate(result.publishedDate)}</span>
                    )}
                  </div>
                  
                  {result.url && result.url.trim() !== '' && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      원문 보기
                    </a>
                  )}
                  {(!result.url || result.url.trim() === '') && result.type === '뉴스 기사' && (
                    <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md" title="제목과 신문사 이름으로 직접 검색해보세요!">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      🔍 직접 검색해보세요
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {filteredResults.length === 0 && activeFilter !== '전체' && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>선택한 유형의 자료가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 결과 요약 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">📊 검색 결과 요약</h4>
        <div className="text-sm text-gray-600">
          <p>총 <strong>{results.length}개</strong>의 근거자료를 찾았습니다.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(stats).map(([type, count]) => (
              <span key={type} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                {getTypeBadge(type)}: {count}개
              </span>
            ))}
          </div>
        </div>
        
        {/* 친근한 사용 안내 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
          <div className="flex items-start">
            <div className="text-blue-400 mr-2">💡</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">📰 뉴스 기사 이용 안내</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 일부 기사는 저작권 보호로 원문 링크가 제공되지 않을 수 있어요</li>
                <li>• 제목과 신문사 이름으로 네이버나 구글에서 직접 검색해보세요!</li>
                <li>• 모든 자료는 교육용으로 선별된 신뢰할 수 있는 출처입니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}