'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Session } from '@/lib/utils'
import Button from '../common/Button'

interface EditSessionModalProps {
  session: Session | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function EditSessionModal({ session, isOpen, onClose, onUpdate }: EditSessionModalProps) {
  const [sessionTitle, setSessionTitle] = useState('')
  const [materialType, setMaterialType] = useState<'text' | 'youtube'>('text')
  const [materialText, setMaterialText] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 모달이 열릴 때 세션 데이터로 폼 초기화
  useEffect(() => {
    if (session && isOpen) {
      setSessionTitle(session.title || '')
      setMaterialText(session.materialText || '')
      setMaterialUrl(session.materialUrl || '')
      setKeywords(session.keywords || [])
      setMaterialType(session.materialUrl ? 'youtube' : 'text')
      setKeywordInput('')
    }
  }, [session, isOpen])

  const handleAddKeyword = () => {
    if (keywordInput.trim() && keywords.length < 3 && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!session) return
    
    setIsLoading(true)

    try {
      const updateData = {
        sessionId: session.sessionId,
        title: sessionTitle.trim() || '제목 없음',
        materialText: materialType === 'text' ? materialText : '',
        materialUrl: materialType === 'youtube' ? materialUrl : '',
        keywords
      }

      const response = await fetch('/api/sessions/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('세션 수정에 실패했습니다.')
      }

      onUpdate()
      onClose()
    } catch (error) {
      console.error('세션 수정 오류:', error)
      alert('세션 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">세션 수정</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">학습 자료 유형 선택</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학습 자료 텍스트
              </label>
              <textarea
                value={materialText}
                onChange={(e) => setMaterialText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={6}
                placeholder="학생들이 질문을 생성할 학습 자료를 입력하세요..."
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유튜브 영상 URL
              </label>
              <input
                type="url"
                value={materialUrl}
                onChange={(e) => setMaterialUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키워드 (선택사항, 최대 3개)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="키워드를 입력하세요"
                disabled={keywords.length >= 3}
              />
              <Button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim() || keywords.length >= 3}
                variant="secondary"
              >
                추가
              </Button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="ml-2 hover:text-primary-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !sessionTitle.trim() || (materialType === 'text' && !materialText.trim()) || (materialType === 'youtube' && !materialUrl.trim())}
              className="flex-1"
            >
              {isLoading ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}