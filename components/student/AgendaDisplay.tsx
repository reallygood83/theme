'use client'

import { useState, useEffect } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'

interface Agenda {
  agendaTitle: string
  reason: string
  type: string
}

interface StudentAgenda {
  recommendedAgendas: Agenda[]
  questionAnalysis?: string  // 질문 분석 결과 (선택적)
  topic: string
  description: string
  studentName: string
  studentGroup: string
  createdAt: number
}

interface AgendaDisplayProps {
  agendas: StudentAgenda[]
  onCreateNew: () => void
}

export default function AgendaDisplay({ agendas, onCreateNew }: AgendaDisplayProps) {
  const [selectedAgenda, setSelectedAgenda] = useState<StudentAgenda | null>(null)
  
  // 가장 최신 논제 세트를 기본 선택
  useEffect(() => {
    if (agendas.length > 0) {
      // 시간순으로 정렬
      const sortedAgendas = [...agendas].sort((a, b) => b.createdAt - a.createdAt)
      setSelectedAgenda(sortedAgendas[0])
    }
  }, [agendas])
  
  if (agendas.length === 0) {
    return (
      <Card title="AI 추천 논제">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            아직 생성된 AI 논제 추천이 없습니다.
          </p>
          <Button variant="primary" onClick={onCreateNew}>
            논제 추천 받기
          </Button>
        </div>
      </Card>
    )
  }
  
  return (
    <div className="space-y-4">
      <Card title="AI 추천 논제">
        {/* 논제 세트 선택기 */}
        {agendas.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              논제 세트 선택
            </label>
            <select
              className="select-field"
              value={selectedAgenda?.createdAt.toString() || ''}
              onChange={(e) => {
                const selected = agendas.find(a => a.createdAt.toString() === e.target.value)
                if (selected) setSelectedAgenda(selected)
              }}
            >
              {agendas
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((agenda, index) => (
                  <option key={agenda.createdAt} value={agenda.createdAt.toString()}>
                    {new Date(agenda.createdAt).toLocaleString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {agenda.topic}
                  </option>
                ))
              }
            </select>
          </div>
        )}

        {/* 선택된 논제 정보 */}
        {selectedAgenda && (
          <div className="mb-4">
            <div className="bg-primary/5 p-4 rounded-md mb-4">
              <h3 className="font-medium text-primary mb-1">주제: {selectedAgenda.topic || '(질문 기반 분석)'}</h3>
              {selectedAgenda.description && (
                <p className="text-sm text-gray-600">{selectedAgenda.description}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                {selectedAgenda.studentName} ({selectedAgenda.studentGroup} 모둠) • 
                {new Date(selectedAgenda.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>
            
            {/* 질문 분석 결과 표시 (있는 경우) */}
            {selectedAgenda.questionAnalysis && (
              <div className="mb-4 bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-1">질문 분석 결과</h3>
                <p className="text-sm text-blue-700">{selectedAgenda.questionAnalysis}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {selectedAgenda.recommendedAgendas.map((agenda, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="bg-accent/10 text-accent rounded-full w-8 h-8 flex items-center justify-center font-medium shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{agenda.agendaTitle}</h3>
                      <p className="text-sm text-gray-600 mb-2">{agenda.reason}</p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {agenda.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onCreateNew}>
            새 논제 추천 받기
          </Button>
        </div>
      </Card>
    </div>
  )
}