'use client'

import { useState, FormEvent } from 'react'
import Button from '../common/Button'

interface QuestionInputProps {
  sessionId: string
  studentName: string
  onQuestionSubmit: () => void
}

export default function QuestionInput({
  sessionId,
  studentName,
  onQuestionSubmit
}: QuestionInputProps) {
  const [questionText, setQuestionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!questionText.trim()) return
    
    setIsSubmitting(true)
    
    try {
      // API 엔드포인트에 질문 제출
      const response = await fetch('/api/questions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          studentName,
          text: questionText.trim(),
          createdAt: Date.now()
        }),
      })
      
      if (!response.ok) {
        throw new Error('질문 제출에 실패했습니다.')
      }
      
      // 입력 필드 초기화
      setQuestionText('')
      
      // 부모 컴포넌트에 알림
      onQuestionSubmit()
    } catch (error) {
      console.error('질문 제출 오류:', error)
      alert('질문 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
          질문 작성
        </label>
        <textarea
          id="questionText"
          className="textarea-field"
          placeholder="학습 자료에 대한 질문을 작성해주세요..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          rows={3}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!questionText.trim() || isSubmitting}
        >
          질문 제출하기
        </Button>
      </div>
    </form>
  )
}