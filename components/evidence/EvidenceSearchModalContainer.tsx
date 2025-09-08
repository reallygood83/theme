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
    
    try {
      console.log('근거자료 검색 시작:', { topic, stance, types })
      
      // 5단계 프로그레스 시뮬레이션과 API 호출을 병렬 처리
      const progressPromise = (async () => {
        for (let step = 1; step <= 5; step++) {
          setCurrentStep(step)
          await new Promise(resolve => setTimeout(resolve, 1000))
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

      if (!response.ok) {
        throw new Error('검색 요청이 실패했습니다.')
      }

      const data = await response.json()
      console.log('근거자료 검색 결과:', data)
      
      if (data.success && data.evidences) {
        // API 완료 후 6단계로 설정하여 완료 상태 표시
        setCurrentStep(6)
        
        // 잠시 완료 메시지를 보여준 후 결과 표시
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setResults(data.evidences)
        setSearchTime(new Date())
        setCurrentStep(0) // 결과 표시 모드로 전환
      } else {
        throw new Error(data.error || '검색 결과를 가져올 수 없습니다.')
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
  }, [])

  // 모달 닫기 함수
  const handleClose = useCallback(() => {
    setCurrentStep(0)
    setResults([])
    setSearchTime(null)
    setLoading(false)
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

          {/* 검색 폼 (결과가 없을 때만 표시) */}
          {!loading && results.length === 0 && (
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