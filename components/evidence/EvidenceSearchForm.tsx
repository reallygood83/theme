'use client'

import { useState } from 'react'
import { EVIDENCE_TYPES } from '@/lib/types/evidence'

interface EvidenceSearchFormProps {
  onSearch: (topic: string, stance: string, types: string[]) => void
  isLoading: boolean
  initialTopic?: string
}

export default function EvidenceSearchForm({ 
  onSearch, 
  isLoading, 
  initialTopic = '' 
}: EvidenceSearchFormProps) {
  const [topic, setTopic] = useState(initialTopic)
  const [stance, setStance] = useState<'positive' | 'negative'>('positive')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    '뉴스 기사', 
    '유튜브 영상'
  ])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) {
      alert('토론 주제를 입력해주세요.')
      return
    }
    if (selectedTypes.length === 0) {
      alert('최소 하나의 자료 유형을 선택해주세요.')
      return
    }
    
    onSearch(topic.trim(), stance, selectedTypes)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI 근거자료 검색</h3>
          <p className="text-sm text-gray-600">토론 주제에 대한 근거자료를 AI가 찾아드립니다</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 토론 주제 입력 */}
        <div>
          <label htmlFor="evidence-topic" className="block text-sm font-medium text-gray-700 mb-2">
            토론 주제 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="evidence-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="근거자료를 찾고 싶은 토론 주제를 입력하세요..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* 입장 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            나의 입장 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="stance"
                value="positive"
                checked={stance === 'positive'}
                onChange={(e) => setStance(e.target.value as 'positive')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  👍 찬성
                </span>
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stance"
                value="negative"
                checked={stance === 'negative'}
                onChange={(e) => setStance(e.target.value as 'negative')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  👎 반대
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* 자료 유형 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            찾고 싶은 자료 유형 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {EVIDENCE_TYPES.map((type) => (
              <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => handleTypeToggle(type.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span 
                  className="ml-2 text-sm font-medium"
                  style={{ color: type.color }}
                >
                  {type.label}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            선택한 유형: {selectedTypes.length}개 / 전체 {EVIDENCE_TYPES.length}개
          </p>
        </div>

        {/* 검색 버튼 */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim() || selectedTypes.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              검색 중...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              🚀 근거자료 검색
            </div>
          )}
        </button>
      </form>

      {/* 검색 팁 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 검색 팁</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 구체적이고 명확한 주제를 입력할수록 더 정확한 결과를 얻을 수 있습니다</li>
          <li>• 찬성/반대 입장을 정확히 선택해주세요</li>
          <li>• 여러 자료 유형을 선택하면 더 다양한 근거를 찾을 수 있습니다</li>
          <li>• 검색에는 약 15-30초 정도 소요됩니다</li>
        </ul>
      </div>
    </div>
  )
}