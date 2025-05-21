'use client'

import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { database } from '@/lib/firebase'
import Button from '../common/Button'
import Card from '../common/Card'
import { Session, Question } from '@/lib/utils'

interface SessionManagerProps {
  sessionId: string
  sessionCode: string
  initialSessionData: Session
}

export default function SessionManager({
  sessionId,
  sessionCode,
  initialSessionData
}: SessionManagerProps) {
  const [session, setSession] = useState<Session>(initialSessionData)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  
  // 실시간 질문 업데이트 수신
  useEffect(() => {
    const questionsRef = ref(database, `sessions/${sessionId}/questions`)
    
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const questionsData = snapshot.val()
      
      if (questionsData) {
        const questionsArray = Object.entries(questionsData).map(([key, value]) => ({
          questionId: key,
          ...(value as any)
        }))
        
        // 시간순 정렬
        questionsArray.sort((a, b) => a.createdAt - b.createdAt)
        
        setQuestions(questionsArray)
      }
    })
    
    // 세션 정보 실시간 동기화
    const sessionRef = ref(database, `sessions/${sessionId}`)
    
    const sessionUnsubscribe = onValue(sessionRef, (snapshot) => {
      const sessionData = snapshot.val()
      
      if (sessionData) {
        setSession({
          sessionId,
          ...sessionData
        })
        
        // AI 분석 결과가 있으면 분석 완료 상태로 설정
        if (sessionData.aiAnalysisResult) {
          setAnalysisComplete(true)
          setIsAnalyzing(false)
        }
      }
    })
    
    return () => {
      unsubscribe()
      sessionUnsubscribe()
    }
  }, [sessionId])
  
  const handleStartAnalysis = async () => {
    if (questions.length < 3) {
      alert('분석을 시작하기 위해서는 최소 3개 이상의 질문이 필요합니다.')
      return
    }
    
    setIsAnalyzing(true)
    
    try {
      // AI 분석 API 호출
      const response = await fetch('/api/ai/analyze-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          questions: questions.map(q => q.text),
          keywords: session.keywords || []
        }),
      })
      
      if (!response.ok) {
        throw new Error('분석 요청에 실패했습니다.')
      }
      
      // 분석 완료
      setAnalysisComplete(true)
    } catch (error) {
      console.error('AI 분석 오류:', error)
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsAnalyzing(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">토론 세션 관리</h1>
          <p className="text-gray-600">
            세션 코드: <span className="font-medium">{sessionCode}</span>
          </p>
        </div>
        
        {!analysisComplete && (
          <Button
            variant="primary"
            onClick={handleStartAnalysis}
            isLoading={isAnalyzing}
            disabled={isAnalyzing || questions.length < 3}
          >
            {isAnalyzing ? 'AI 분석 중...' : 'AI 분석 시작'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="학습 자료">
          {session.materialText ? (
            <div className="prose max-w-none">
              <p>{session.materialText}</p>
            </div>
          ) : session.materialUrl ? (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${new URL(session.materialUrl).searchParams.get('v')}`}
                className="w-full h-full"
                title="학습 자료 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <p className="text-gray-500">학습 자료가 없습니다.</p>
          )}
          
          {session.keywords && session.keywords.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">키워드:</h3>
              <div className="flex flex-wrap gap-2">
                {session.keywords.map((keyword, index) => (
                  <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
        
        <Card title={`학생 질문 목록 (${questions.length})`}>
          <div className="max-h-[400px] overflow-y-auto">
            {questions.length > 0 ? (
              <ul className="space-y-3">
                {questions.map((question) => (
                  <li key={question.questionId} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary/10 text-secondary rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                        {question.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {question.studentName}
                        </p>
                        <p className="text-gray-700">{question.text}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">
                아직 학생들이 질문을 작성하지 않았습니다.
              </p>
            )}
          </div>
        </Card>
      </div>
      
      {analysisComplete && session.aiAnalysisResult && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">AI 분석 결과</h2>
          
          {session.aiAnalysisResult.clusteredQuestions && (
            <Card title="질문 유형 분류">
              <div className="space-y-4">
                {session.aiAnalysisResult.clusteredQuestions.map((cluster: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-lg text-primary mb-2">
                      {cluster.clusterTitle}
                    </h3>
                    <p className="text-gray-600 mb-3">{cluster.clusterSummary}</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {cluster.questions.map((question: string, qIndex: number) => (
                        <li key={qIndex}>{question}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm italic text-gray-500">
                      {cluster.combinationGuide}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {session.aiAnalysisResult.recommendedAgendas && (
            <Card title="추천 토론 논제">
              <div className="space-y-4">
                {session.aiAnalysisResult.recommendedAgendas.map((agenda: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-accent/10 text-accent rounded-full w-8 h-8 flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <h3 className="font-medium text-lg">
                        {agenda.agendaTitle}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-2">{agenda.reason}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {agenda.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {session.aiAnalysisResult.extractedTerms && (
            <Card title="주요 용어">
              <div className="space-y-4">
                {session.aiAnalysisResult.extractedTerms.map((term: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="bg-secondary/10 text-secondary rounded-full w-8 h-8 flex items-center justify-center font-medium shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{term.term}</h3>
                      <p className="text-gray-600">{term.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}