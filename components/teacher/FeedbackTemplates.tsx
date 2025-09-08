'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import ErrorAlert from '@/components/common/ErrorAlert'
import SuccessAlert from '@/components/common/SuccessAlert'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface FeedbackTemplate {
  _id: string
  title: string
  content: string
  category: 'positive' | 'constructive' | 'question' | 'custom'
  createdAt: string
  updatedAt: string
}

interface FeedbackTemplatesProps {
  onTemplateSelect?: (template: string) => void
}

const defaultTemplates: Omit<FeedbackTemplate, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: '의견 격려',
    content: '훌륭한 생각입니다! 논리적이고 구체적으로 의견을 표현해주었네요. 이런 관점에서 생각해본 적이 없었는데 새로운 시각을 제공해주어서 고맙습니다.',
    category: 'positive'
  },
  {
    title: '근거 보완 필요',
    content: '흥미로운 의견이네요! 조금 더 구체적인 근거나 예시를 들어주시면 더욱 설득력 있는 의견이 될 것 같습니다. 어떤 경험이나 자료에서 이런 생각을 하게 되었나요?',
    category: 'constructive'
  },
  {
    title: '반대 의견 고려',
    content: '좋은 의견입니다. 다만 이와 반대되는 입장에서는 어떻게 생각할 수 있을까요? 다른 관점도 함께 고려해보면 더 균형 잡힌 토론이 될 것 같습니다.',
    category: 'constructive'
  },
  {
    title: '심화 질문',
    content: '흥미로운 주제를 제시해주었네요! 이 문제를 해결하기 위한 구체적인 방법이나 대안이 있다면 무엇일까요? 더 깊이 생각해보는 시간을 가져보세요.',
    category: 'question'
  },
  {
    title: '창의적 사고 격려',
    content: '정말 창의적인 아이디어네요! 남들이 생각하지 못한 독특한 관점을 제시해주어서 토론이 더욱 풍성해졌습니다. 이런 창의적 사고를 계속 발전시켜나가길 바랍니다.',
    category: 'positive'
  },
  {
    title: '논리 구조 개선',
    content: '의견의 핵심은 잘 파악했습니다. 다만 논리의 흐름을 조금 더 명확하게 정리해보면 어떨까요? 첫 번째로 ~ 두 번째로 ~ 마지막으로 ~ 와 같은 순서로 정리해보세요.',
    category: 'constructive'
  }
]

export default function FeedbackTemplates({ onTemplateSelect }: FeedbackTemplatesProps) {
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<FeedbackTemplate | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'custom' as FeedbackTemplate['category']
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/feedback/templates')
      const data = await response.json()
      
      if (data.success) {
        const userTemplates = data.data || []
        // 기본 템플릿과 사용자 템플릿 합치기
        const allTemplates = [
          ...defaultTemplates.map((template, index) => ({
            ...template,
            _id: `default-${index}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })),
          ...userTemplates
        ]
        setTemplates(allTemplates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setError('템플릿을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      const url = editingTemplate ? `/api/feedback/templates/${editingTemplate._id}` : '/api/feedback/templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(editingTemplate ? '템플릿이 수정되었습니다.' : '새 템플릿이 생성되었습니다.')
        setFormData({ title: '', content: '', category: 'custom' })
        setShowCreateForm(false)
        setEditingTemplate(null)
        fetchTemplates()
      } else {
        setError(data.error || '템플릿 저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      setError('템플릿 저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (templateId: string) => {
    if (templateId.startsWith('default-')) {
      setError('기본 템플릿은 삭제할 수 없습니다.')
      return
    }

    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/feedback/templates/${templateId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('템플릿이 삭제되었습니다.')
        fetchTemplates()
      } else {
        setError(data.error || '템플릿 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      setError('템플릿 삭제 중 오류가 발생했습니다.')
    }
  }

  const startEdit = (template: FeedbackTemplate) => {
    if (template._id.startsWith('default-')) {
      setError('기본 템플릿은 수정할 수 없습니다.')
      return
    }
    
    setEditingTemplate(template)
    setFormData({
      title: template.title,
      content: template.content,
      category: template.category
    })
    setShowCreateForm(true)
  }

  const getCategoryColor = (category: FeedbackTemplate['category']) => {
    switch (category) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'constructive':
        return 'bg-blue-100 text-blue-800'
      case 'question':
        return 'bg-purple-100 text-purple-800'
      case 'custom':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category: FeedbackTemplate['category']) => {
    switch (category) {
      case 'positive':
        return '격려'
      case 'constructive':
        return '건설적'
      case 'question':
        return '질문'
      case 'custom':
        return '사용자정의'
      default:
        return category
    }
  }

  if (loading) {
    return <LoadingSpinner message="피드백 템플릿을 불러오는 중..." className="py-8" />
  }

  return (
    <div className="space-y-6">
      <ErrorAlert error={error} onClose={() => setError(null)} />
      <SuccessAlert message={success} onClose={() => setSuccess(null)} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">피드백 템플릿</h2>
          <p className="text-gray-600">자주 사용하는 피드백을 템플릿으로 저장하여 효율적으로 활용하세요.</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(true)
            setEditingTemplate(null)
            setFormData({ title: '', content: '', category: 'custom' })
          }}
        >
          새 템플릿 만들기
        </Button>
      </div>

      {/* 템플릿 생성/수정 폼 */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTemplate ? '템플릿 수정' : '새 템플릿 만들기'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                템플릿 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="템플릿 제목을 입력하세요"
                className="input-field"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as FeedbackTemplate['category'] }))}
                className="input-field"
              >
                <option value="positive">격려</option>
                <option value="constructive">건설적</option>
                <option value="question">질문</option>
                <option value="custom">사용자정의</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                피드백 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="피드백 내용을 입력하세요"
                className="input-field min-h-[100px] resize-none"
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/1000자
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingTemplate ? '수정 완료' : '템플릿 저장'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingTemplate(null)
                  setFormData({ title: '', content: '', category: 'custom' })
                }}
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 템플릿 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template._id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 line-clamp-1">{template.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                {getCategoryText(template.category)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{template.content}</p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onTemplateSelect?.(template.content)}
                className="flex-1"
              >
                사용하기
              </Button>
              {!template._id.startsWith('default-') && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => startEdit(template)}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDelete(template._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    삭제
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">아직 생성된 피드백 템플릿이 없습니다.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            첫 템플릿 만들기
          </Button>
        </Card>
      )}
    </div>
  )
}