'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../common/Button'
import { generateSessionCode } from '@/lib/utils'

export default function CreateSessionForm() {
  const router = useRouter()
  const [sessionTitle, setSessionTitle] = useState('')
  const [materialType, setMaterialType] = useState<'text' | 'youtube'>('text')
  const [materialText, setMaterialText] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleAddKeyword = () => {
    if (keywordInput.trim() && keywords.length < 3) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }
  
  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // 세션 정보 준비
      const sessionCode = generateSessionCode()
      const sessionData = {
        title: sessionTitle.trim() || '제목 없음',
        materialText: materialType === 'text' ? materialText : '',
        materialUrl: materialType === 'youtube' ? materialUrl : '',
        keywords,
        accessCode: sessionCode,
        createdAt: Date.now()
      }
      
      // API 엔드포인트에 세션 생성 요청
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })
      
      if (!response.ok) {
        throw new Error('세션 생성에 실패했습니다.')
      }
      
      const { sessionId } = await response.json()
      
      console.log('세션 생성 성공:', sessionId)
      
      // 세션 생성 이벤트를 localStorage에 저장 (대시보드 새로고침용)
      localStorage.setItem('newSessionCreated', Date.now().toString())
      
      // 생성된 세션 페이지로 이동
      router.push(`/teacher/session/${sessionId}?code=${sessionCode}`)
    } catch (error) {
      console.error('세션 생성 오류:', error)
      alert('세션 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          세션 제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="예: 환경보호와 경제발전의 균형"
          required
          maxLength={100}
        />
        <p className="text-sm text-gray-500 mt-1">
          토론 세션을 쉽게 구분할 수 있는 제목을 입력하세요. (최대 100자)
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">학습 자료 유형 선택</h2>
        <div className="flex gap-4">
          <button
            type="button"
            className={`flex-1 p-4 border rounded-lg ${materialType === 'text' ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
            onClick={() => setMaterialType('text')}
          >
            <div className="flex justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-center">텍스트</p>
          </button>
          
          <button
            type="button"
            className={`flex-1 p-4 border rounded-lg ${materialType === 'youtube' ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
            onClick={() => setMaterialType('youtube')}
          >
            <div className="flex justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium text-center">유튜브 영상</p>
          </button>
        </div>
      </div>
      
      {materialType === 'text' ? (
        <div>
          <label htmlFor="materialText" className="block text-sm font-medium text-gray-700 mb-1">
            학습 자료 텍스트
          </label>
          <textarea
            id="materialText"
            className="textarea-field"
            placeholder="학생들이 질문을 생성할 텍스트 자료를 입력하세요..."
            value={materialText}
            onChange={(e) => setMaterialText(e.target.value)}
            required
            rows={8}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="materialUrl" className="block text-sm font-medium text-gray-700 mb-1">
            유튜브 영상 URL
          </label>
          <input
            id="materialUrl"
            type="url"
            className="input-field"
            placeholder="https://www.youtube.com/watch?v=..."
            value={materialUrl}
            onChange={(e) => setMaterialUrl(e.target.value)}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            유튜브 영상 URL을 입력하세요. 예: https://www.youtube.com/watch?v=abcdefghijk
          </p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          핵심 키워드 (선택, 최대 3개)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="키워드 입력..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            disabled={keywords.length >= 3}
          />
          <Button 
            variant="outline"
            onClick={handleAddKeyword}
            disabled={!keywordInput.trim() || keywords.length >= 3}
          >
            추가
          </Button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          자료의 핵심 키워드를 최대 3개까지 입력하세요. AI가 더 정확한 논제를 제안하는 데 도움이 됩니다.
        </p>
        
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {keywords.map((keyword, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          size="lg"
          isLoading={isLoading}
        >
          세션 생성하기
        </Button>
      </div>
    </form>
  )
}