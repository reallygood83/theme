'use client'

import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'

interface AgendaRecommenderProps {
  onRequestAgendas: (topic: string, description: string) => Promise<void>
  isLoading: boolean
}

export default function AgendaRecommender({ onRequestAgendas, isLoading }: AgendaRecommenderProps) {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || !description.trim()) return
    
    setFormSubmitted(true)
    await onRequestAgendas(topic.trim(), description.trim())
  }

  return (
    <Card title="AI 논제 추천 요청">
      <p className="mb-4 text-gray-600">
        토론하고 싶은 주제를 입력하면 AI가 적절한 논제를 추천해드립니다.
      </p>

      {!formSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              토론 주제
            </label>
            <input
              id="topic"
              type="text"
              className="input-field"
              placeholder="예: 기후변화, 인공지능 윤리, 학교 급식 등"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              주제 설명 (선택사항)
            </label>
            <textarea
              id="description"
              className="textarea-field"
              placeholder="토론하고 싶은 주제에 대해 더 자세히 설명해주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!topic.trim() || isLoading}
            >
              논제 추천 요청
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-primary/5 p-4 rounded-md">
          <p className="text-center text-gray-700">
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI가 논제를 생성하고 있습니다...
              </span>
            ) : (
              <>
                <span className="font-medium">"{topic}"</span>에 대한 논제 추천이 완료되었습니다.
                <br />
                <button 
                  onClick={() => setFormSubmitted(false)}
                  className="mt-2 text-primary underline hover:text-primary/80"
                >
                  다른 주제로 논제 추천 받기
                </button>
              </>
            )}
          </p>
        </div>
      )}
    </Card>
  )
}