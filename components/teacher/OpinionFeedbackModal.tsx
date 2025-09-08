'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import ErrorAlert from '@/components/common/ErrorAlert'
import SuccessAlert from '@/components/common/SuccessAlert'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import FeedbackTemplates from './FeedbackTemplates'

interface Opinion {
  _id: string
  topic: string
  content: string
  studentName: string
  studentClass: string
  status: 'pending' | 'feedback_given' | 'reviewed'
  submittedAt: string
  aiFeedback?: string
  teacherFeedback?: string
}

interface OpinionFeedbackModalProps {
  opinion: Opinion
  isOpen: boolean
  onClose: () => void
  onFeedbackSubmitted: () => void
}

export default function OpinionFeedbackModal({ 
  opinion, 
  isOpen, 
  onClose, 
  onFeedbackSubmitted 
}: OpinionFeedbackModalProps) {
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [generateAI, setGenerateAI] = useState(false)

  useEffect(() => {
    if (isOpen && opinion) {
      setFeedback(opinion.teacherFeedback || '')
      setError(null)
      setSuccess(null)
    }
  }, [isOpen, opinion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!feedback.trim()) {
      setError('피드백을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/debate/opinions/${opinion._id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherFeedback: feedback.trim(),
          generateAI
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('피드백이 성공적으로 제출되었습니다.')
        setTimeout(() => {
          onFeedbackSubmitted()
          onClose()
        }, 1500)
      } else {
        setError(data.error || '피드백 제출 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setError('피드백 제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTemplateSelect = (templateContent: string) => {
    setFeedback(templateContent)
    setShowTemplates(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">의견 피드백</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <ErrorAlert error={error} onClose={() => setError(null)} />
          <SuccessAlert message={success} onClose={() => setSuccess(null)} />

          {/* 학생 의견 표시 */}
          <Card className="p-4 mb-6 bg-gray-50">
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">{opinion.topic}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{opinion.studentName}</span>
                  <span>•</span>
                  <span>{opinion.studentClass}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap mb-3">{opinion.content}</p>
            <div className="text-xs text-gray-500">
              제출일: {new Date(opinion.submittedAt).toLocaleString('ko-KR')}
            </div>
          </Card>

          {/* AI 피드백 (있는 경우) */}
          {opinion.aiFeedback && (
            <Card className="p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                🤖 AI 피드백
              </h4>
              <div className="bg-blue-50 p-3 rounded">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{opinion.aiFeedback}</pre>
              </div>
            </Card>
          )}

          {/* 템플릿 토글 */}
          <div className="mb-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowTemplates(!showTemplates)}
              className="mb-4"
            >
              {showTemplates ? '템플릿 숨기기' : '피드백 템플릿 보기'}
            </Button>

            {showTemplates && (
              <div className="mb-6">
                <FeedbackTemplates onTemplateSelect={handleTemplateSelect} />
              </div>
            )}
          </div>

          {/* 피드백 작성 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                교사 피드백 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="학생에게 제공할 피드백을 작성해주세요..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
                maxLength={2000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/2000자
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={generateAI}
                  onChange={(e) => setGenerateAI(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-blue-900">
                  AI 피드백도 함께 생성하기 (추천)
                </span>
              </label>
              <p className="text-xs text-blue-700 mt-1">
                교사 피드백과 함께 AI가 생성한 추가 피드백도 학생에게 제공됩니다.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 효과적인 피드백 작성 팁</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>구체적으로:</strong> "좋다"보다는 "논리적 근거가 명확하다"와 같이 구체적으로</li>
                <li>• <strong>균형있게:</strong> 잘한 점과 개선점을 함께 제시</li>
                <li>• <strong>건설적으로:</strong> 개선방향을 제시하여 학생의 성장을 돕기</li>
                <li>• <strong>격려하며:</strong> 학생의 노력을 인정하고 격려하는 톤 유지</li>
              </ul>
            </div>
          </form>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !feedback.trim()}
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">제출 중...</span>
              </>
            ) : (
              '피드백 제출'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}