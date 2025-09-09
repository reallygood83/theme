'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import ErrorAlert from '@/components/common/ErrorAlert'
import SuccessAlert from '@/components/common/SuccessAlert'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { validateOpinion } from '@/lib/validation'

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

interface OpinionManagerProps {
  studentName: string
  studentClass: string
  studentId: string
  sessionCode?: string
  onOpinionSubmitted: () => void
}

export default function OpinionManager({ 
  studentName, 
  studentClass,
  studentId,
  sessionCode,
  onOpinionSubmitted 
}: OpinionManagerProps) {
  const [opinions, setOpinions] = useState<Opinion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    topic: '',
    content: ''
  })

  // 컴포넌트 마운트 시 기존 의견들 불러오기
  useEffect(() => {
    if (studentId) {
      fetchMyOpinions()
    }
  }, [studentId])

  const fetchMyOpinions = async () => {
    try {
      const url = sessionCode 
        ? `/api/debate/opinions?studentId=${studentId}&sessionCode=${sessionCode}`
        : `/api/debate/opinions?studentId=${studentId}`
      
      const response = await fetch(url)
      
      const data = await response.json()
      if (data.success) {
        setOpinions(data.data?.opinions || [])
      }
    } catch (error) {
      console.error('Error fetching opinions:', error)
    } finally {
      setLoading(false)
    }
  }

  // 의견 제출/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // 클라이언트 검증
    const validation = validateOpinion(formData.topic, formData.content)
    if (!validation.isValid) {
      setError(validation.errors.join(' '))
      return
    }

    setSubmitting(true)

    try {
      const url = editingId 
        ? `/api/debate/opinions/${editingId}`
        : '/api/debate/opinions'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          content: formData.content,
          studentName,
          studentId,
          classId: studentClass,
          sessionCode: sessionCode || undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(editingId ? '의견이 수정되었습니다.' : '의견이 제출되었습니다.')
        setFormData({ topic: '', content: '' })
        setEditingId(null)
        fetchMyOpinions()
        onOpinionSubmitted()
      } else {
        setError(data.error || (data.errors && data.errors.join(' ')) || '오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error submitting opinion:', error)
      setError('의견 제출 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 의견 삭제
  const handleDelete = async (opinionId: string) => {
    if (!confirm('정말로 이 의견을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/debate/opinions/${opinionId}?studentName=${encodeURIComponent(studentName)}&studentClass=${encodeURIComponent(studentClass)}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('의견이 삭제되었습니다.')
        fetchMyOpinions()
      } else {
        setError(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error deleting opinion:', error)
      setError('삭제 중 오류가 발생했습니다.')
    }
  }

  // 수정 모드 시작
  const startEditing = (opinion: Opinion) => {
    setEditingId(opinion._id)
    setFormData({
      topic: opinion.topic,
      content: opinion.content
    })
    setError(null)
    setSuccess(null)
  }

  // 수정 취소
  const cancelEditing = () => {
    setEditingId(null)
    setFormData({ topic: '', content: '' })
    setError(null)
  }

  // 수정/삭제 가능 여부 확인
  const canModify = (opinion: Opinion) => {
    if (opinion.status !== 'pending') return false
    
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    const submittedAt = new Date(opinion.submittedAt)
    return submittedAt > thirtyMinutesAgo
  }

  if (loading) {
    return <LoadingSpinner message="기존 의견을 불러오는 중..." className="py-8" />
  }

  return (
    <div className="space-y-6">
      {/* 알림 메시지 */}
      <ErrorAlert error={error} onClose={() => setError(null)} />
      <SuccessAlert message={success} onClose={() => setSuccess(null)} />

      {/* 의견 제출/수정 폼 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? '의견 수정' : '새 의견 작성'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              토론 주제 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="토론하고 싶은 주제를 입력하세요"
              className="input-field"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.topic.length}/100자
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              나의 의견 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="주제에 대한 자신의 의견을 자세히 작성해주세요"
              className="input-field min-h-[120px] resize-none"
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/1000자
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">{editingId ? '수정 중...' : '제출 중...'}</span>
                </>
              ) : (
                editingId ? '수정 완료' : '의견 제출'
              )}
            </Button>
            
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={cancelEditing}
              >
                취소
              </Button>
            )}
          </div>
        </form>

        {!editingId && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>알려드려요:</strong> 의견은 제출 후 30분 이내에만 수정하거나 삭제할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* 내 의견 목록 */}
      {opinions.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">내가 제출한 의견들</h3>
          
          <div className="space-y-4">
            {opinions.map((opinion) => (
              <div key={opinion._id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{opinion.topic}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      opinion.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : opinion.status === 'feedback_given'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {opinion.status === 'pending' ? '대기중' : 
                       opinion.status === 'feedback_given' ? '피드백 완료' : '검토 완료'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-3">{opinion.content}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(opinion.submittedAt).toLocaleString('ko-KR')}
                  </span>
                  
                  {canModify(opinion) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(opinion)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(opinion._id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {/* AI 피드백 표시 */}
                {opinion.aiFeedback && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <h5 className="text-sm font-medium text-blue-800 mb-1">AI 피드백</h5>
                    <p className="text-sm text-blue-700">{opinion.aiFeedback}</p>
                  </div>
                )}

                {/* 교사 피드백 표시 */}
                {opinion.teacherFeedback && (
                  <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                    <h5 className="text-sm font-medium text-green-800 mb-1">선생님 피드백</h5>
                    <p className="text-sm text-green-700">{opinion.teacherFeedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}