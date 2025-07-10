'use client'

import { useState } from 'react'
import Card from '../common/Card'

export default function AgendaValidator() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  
  // 좋은 논제 검증을 위한 질문 목록
  const validationQuestions = [
    {
      id: 1,
      question: '이 논제는 찬성과 반대 입장이 명확하게 나뉘나요?',
      description: '좋은 토론 논제는 서로 다른 의견이 존재하며, 어느 한쪽으로 쉽게 결론이 나지 않아야 합니다.'
    },
    {
      id: 2,
      question: '이 논제는 한 문장으로 명확하게 표현되어 있나요?',
      description: '논제는 간결하고 명확해야 하며, 여러 해석이 가능한 모호한 표현은 피해야 합니다.'
    },
    {
      id: 3,
      question: '이 논제는 학생들의 수준에 적합한가요?',
      description: '초등학생들이 이해하고 토론할 수 있는 주제여야 합니다. 너무 어렵거나 전문적인 내용은 적합하지 않습니다.'
    },
    {
      id: 4,
      question: '이 논제는 학습 자료와 관련이 있나요?',
      description: '학습 자료에서 다룬 내용을 바탕으로 한 논제여야 학생들이 더 깊은 이해와 토론이 가능합니다.'
    },
    {
      id: 5,
      question: '이 논제는 윤리적 문제나 편향성이 없나요?',
      description: '특정 집단에 대한 차별이나 부적절한 내용을 담고 있지 않아야 합니다.'
    }
  ]
  
  return (
    <Card title="좋은 논제 검증 질문">
      <p className="mb-4 text-gray-600">
        모둠에서 선택한 논제가 토론에 적합한지 다음 질문들을 통해 검증해보세요.
      </p>
      
      <ul className="space-y-3">
        {validationQuestions.map((item) => (
          <li key={item.id}>
            <button
              className="w-full text-left p-3 border rounded-md hover:bg-gray-50 transition-colors flex justify-between items-center"
              onClick={() => setActiveQuestion(activeQuestion === item.id ? null : item.id)}
            >
              <span className="font-medium">{item.question}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${activeQuestion === item.id ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeQuestion === item.id && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
                {item.description}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}