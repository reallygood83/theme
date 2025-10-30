'use client'

import { useState, useCallback } from 'react'
import EvidenceSearchForm from './EvidenceSearchForm'
import EvidenceSearchModal from './EvidenceSearchModal'
import EvidenceResultsDisplay from './EvidenceResultsDisplay'
import { EvidenceResult } from '@/lib/types/evidence'

interface EvidenceSearchModalContainerProps {
  isOpen: boolean
  onClose: () => void
  initialTopic?: string
}

export default function EvidenceSearchModalContainer({ 
  isOpen, 
  onClose, 
  initialTopic = '' 
}: EvidenceSearchModalContainerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [searchParams, setSearchParams] = useState({
    topic: '',
    stance: 'positive' as 'positive' | 'negative',
    types: ['뉴스 기사', '유튜브 영상']
  })
  const [results, setResults] = useState<EvidenceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTime, setSearchTime] = useState<Date | null>(null)
  const [filteringMessage, setFilteringMessage] = useState<string | null>(null)
  const [wasFiltered, setWasFiltered] = useState(false)

  // 검색 시작 함수
  const handleSearch = useCallback(async (topic: string, stance: string, types: string[]) => {
    setSearchParams({
      topic: topic.trim(),
      stance: stance as 'positive' | 'negative',
      types
    })
    setLoading(true)
    setCurrentStep(1)
    setResults([])
    setFilteringMessage(null)
    setWasFiltered(false)
    
    try {
      console.log('근거자료 검색 시작:', { topic, stance, types })
      
      // 5단계 프로그레스 시뮬레이션과 API 호출을 병렬 처리 (학생 페이지와 동일한 타이밍)
      const progressPromise = (async () => {
        for (let step = 1; step <= 5; step++) {
          setCurrentStep(step)
          console.log('📊 교사 대시보드 진행 상황:', step)
          await new Promise(resolve => setTimeout(resolve, step < 5 ? 18000 : 5000)) // 18초씩 진행, 마지막은 5초
        }
      })()
      
      // API 호출 시작
      const apiPromise = fetch('/api/evidence/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic.trim(),
          stance,
          selectedTypes: types
        })
      })

      // 프로그레스 시뮬레이션 완료를 기다림
      await progressPromise
      
      // API 응답을 기다림
      const response = await apiPromise
      const data = await response.json()
      console.log('근거자료 검색 결과:', data)

      // 콘텐츠 필터링으로 인한 차단 처리
      if (!response.ok) {
        if (data.blocked && data.severity) {
          console.log('🛡️ 콘텐츠 필터링 차단:', data.error)
          setFilteringMessage(data.error)
          setWasFiltered(true)
          setCurrentStep(0)
          setLoading(false)
          return
        }
        throw new Error(data.error || '검색 요청이 실패했습니다.')
      }
      
      if (data.evidences && Array.isArray(data.evidences) && data.evidences.length > 0) {
        // API 완료 후 6단계로 설정하여 완료 상태 표시
        setCurrentStep(6)
        
        // 잠시 완료 메시지를 보여준 후 결과 표시
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setResults(data.evidences)
        setSearchTime(new Date())
        
        // 필터링으로 인한 결과 감소 확인
        if (data.filtered && data.message) {
          setFilteringMessage(data.message)
          setWasFiltered(true)
        }
        
        setCurrentStep(0) // 결과 표시 모드로 전환
      } else if (data.success === false) {
        throw new Error(data.error || '검색 결과를 가져올 수 없습니다.')
      } else if (!data.evidences || data.evidences.length === 0) {
        // 빈 결과 처리 - 필터링으로 인한 것인지 확인
        setCurrentStep(6)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setResults([])
        setSearchTime(new Date())
        
        if (data.filtered && data.message) {
          setFilteringMessage(data.message)
          setWasFiltered(true)
        }
        
        setCurrentStep(0)
      } else {
        throw new Error('예상하지 못한 응답 형식입니다.')
      }
    } catch (error) {
      console.error('근거자료 검색 오류:', error)
      alert('근거자료 검색 중 오류가 발생했습니다.')
      setCurrentStep(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // 검색 모달 자동 닫기 함수
  const handleSearchModalAutoClose = useCallback(() => {
    setCurrentStep(0) // 결과 표시 모드로 전환
  }, [])

  // 새 검색 시작 함수
  const handleNewSearch = useCallback(() => {
    setResults([])
    setSearchTime(null)
    setCurrentStep(0)
    setFilteringMessage(null)
    setWasFiltered(false)
  }, [])

  // 모달 닫기 함수
  const handleClose = useCallback(() => {
    setCurrentStep(0)
    setResults([])
    setSearchTime(null)
    setLoading(false)
    setFilteringMessage(null)
    setWasFiltered(false)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">🔍 AI 근거자료 검색</h2>
              <p className="text-sm text-gray-600">토론 주제에 대한 근거자료를 AI가 찾아드립니다</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {results.length > 0 && (
              <button
                onClick={handleNewSearch}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-md hover:bg-blue-50"
              >
                새 검색
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {/* 검색 진행 모달 */}
          {loading && currentStep > 0 && (
            <EvidenceSearchModal
              isVisible={true}
              currentStep={currentStep}
              onClose={() => setLoading(false)}
              onAutoClose={handleSearchModalAutoClose}
            />
          )}

          {/* 콘텐츠 필터링 안내 메시지 */}
          {!loading && filteringMessage && wasFiltered && (
            <div className="p-6">
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      🛡️ 콘텐츠 필터링 안내
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>{filteringMessage}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleNewSearch}
                        className="bg-orange-100 px-4 py-2 rounded-md text-sm font-medium text-orange-800 hover:bg-orange-200 transition-colors"
                      >
                        새로운 주제로 검색하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 검색 폼 (결과가 없고 필터링되지 않았을 때만 표시) */}
          {!loading && results.length === 0 && !wasFiltered && (
            <div className="p-6">
              <EvidenceSearchForm
                onSearch={handleSearch}
                isLoading={loading}
                initialTopic={initialTopic}
              />
            </div>
          )}

          {/* 검색 결과 */}
          {!loading && results.length > 0 && (
            <div className="p-6">
              {/* 필터링 알림 (결과가 있지만 일부 필터링된 경우) */}
              {filteringMessage && wasFiltered && (
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        ℹ️ {filteringMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <EvidenceResultsDisplay
                results={results}
                topic={searchParams.topic}
                stance={searchParams.stance}
                searchTime={searchTime || undefined}
              />
            </div>
          )}

          {/* 로딩 상태가 아니고 결과도 없을 때의 기본 상태는 검색 폼으로 처리됨 */}
        </div>
      </div>
    </div>
  )
}