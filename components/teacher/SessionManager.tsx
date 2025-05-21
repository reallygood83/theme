'use client'

import { useEffect, useState, useRef } from 'react'
import { ref, onValue, getDatabase, Database } from 'firebase/database'
import { database } from '@/lib/firebase'
import { initializeApp } from 'firebase/app'
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
  
  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false)
  
  // 논제 편집 상태
  const [isEditingAgendas, setIsEditingAgendas] = useState(false)
  const [editedAgendas, setEditedAgendas] = useState<any[]>([])
  const [isSavingAgendas, setIsSavingAgendas] = useState(false)
  
  // 용어 편집 상태
  const [isEditingTerms, setIsEditingTerms] = useState(false)
  const [editedTerms, setEditedTerms] = useState<any[]>([])
  const [isSavingTerms, setIsSavingTerms] = useState(false)
  
  // 실시간 질문 업데이트 수신
  useEffect(() => {
    // Firebase 라이브러리가 정상적으로 초기화되었는지 확인
    let db: Database | null = database;
    
    // Firebase 환경 변수 확인 및 필요시 재초기화
    if (!db) {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
          (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
            ? `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` 
            : undefined)
      };
      
      if (!firebaseConfig.databaseURL) {
        console.error('Firebase 설정이 완료되지 않았습니다. 환경 변수를 확인하세요.');
        return;
      }
      
      try {
        const app = initializeApp(firebaseConfig);
        db = getDatabase(app);
      } catch (error) {
        console.error('Firebase 초기화 오류:', error);
        return;
      }
    }
    
    const questionsRef = ref(db, `sessions/${sessionId}/questions`)
    
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
    const sessionRef = ref(db, `sessions/${sessionId}`)
    
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
  
  // 세션 변경시 논제 데이터 초기화
  useEffect(() => {
    if (session.aiAnalysisResult?.recommendedAgendas) {
      setEditedAgendas(JSON.parse(JSON.stringify(session.aiAnalysisResult.recommendedAgendas)))
      setAnalysisComplete(true)
    }
  }, [session.aiAnalysisResult])
  
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
  
  // 논제 편집 시작
  const handleEditAgendas = () => {
    setIsEditingAgendas(true)
  }
  
  // 논제 편집 취소
  const handleCancelEditAgendas = () => {
    if (session.aiAnalysisResult?.recommendedAgendas) {
      setEditedAgendas(JSON.parse(JSON.stringify(session.aiAnalysisResult.recommendedAgendas)))
    }
    setIsEditingAgendas(false)
  }
  
  // 개별 논제 항목 변경
  const handleAgendaChange = (index: number, field: string, value: string) => {
    const updatedAgendas = [...editedAgendas]
    updatedAgendas[index] = {
      ...updatedAgendas[index],
      [field]: value
    }
    setEditedAgendas(updatedAgendas)
  }
  
  // 논제 추가
  const handleAddAgenda = () => {
    const newAgenda = {
      agendaId: `custom-${Date.now()}`,
      agendaTitle: '',
      reason: '',
      type: '찬반형'
    }
    setEditedAgendas([...editedAgendas, newAgenda])
  }
  
  // 논제 삭제
  const handleDeleteAgenda = (index: number) => {
    const updatedAgendas = [...editedAgendas]
    updatedAgendas.splice(index, 1)
    setEditedAgendas(updatedAgendas)
  }
  
  // 논제 저장
  const handleSaveAgendas = async () => {
    // 제목 필드가 비어있는지 확인
    const emptyTitleIndex = editedAgendas.findIndex(agenda => !agenda.agendaTitle.trim())
    if (emptyTitleIndex !== -1) {
      alert(`${emptyTitleIndex + 1}번 논제의 제목을 입력해주세요.`)
      return
    }
    
    setIsSavingAgendas(true)
    
    try {
      const response = await fetch('/api/sessions/update-agendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          agendas: editedAgendas
        }),
      })
      
      if (!response.ok) {
        throw new Error('논제 업데이트에 실패했습니다.')
      }
      
      // 수정 모드 종료
      setIsEditingAgendas(false)
    } catch (error) {
      console.error('논제 업데이트 오류:', error)
      alert('논제 저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSavingAgendas(false)
    }
  }
  
  return (
    <div className="space-y-8 relative">
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in-out">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
          세션 코드가 클립보드에 복사되었습니다
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">토론 세션 관리</h1>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-gray-600">
              세션 코드: <span className="font-medium">{sessionCode}</span>
            </p>
            <button
              type="button"
              className="inline-flex items-center text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md border border-primary/20"
              onClick={() => {
                navigator.clipboard.writeText(sessionCode);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              복사하기
            </button>
          </div>
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
              <div className="flex justify-between items-center mb-4">
                <div>
                  {session.aiAnalysisResult?.isCustomized && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      맞춤 수정됨
                    </span>
                  )}
                </div>
                
                {isEditingAgendas ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      onClick={handleCancelEditAgendas}
                      disabled={isSavingAgendas}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
                      onClick={handleSaveAgendas}
                      disabled={isSavingAgendas}
                    >
                      {isSavingAgendas ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          저장 중...
                        </span>
                      ) : '저장'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary/5"
                    onClick={handleEditAgendas}
                  >
                    논제 수정
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {isEditingAgendas ? (
                  // 편집 모드
                  <div className="space-y-6">
                    {editedAgendas.map((agenda, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-accent/10 text-accent rounded-full w-8 h-8 flex items-center justify-center font-medium">
                              {index + 1}
                            </div>
                            <input
                              type="text"
                              value={agenda.agendaTitle}
                              onChange={(e) => handleAgendaChange(index, 'agendaTitle', e.target.value)}
                              className="font-medium text-lg border-b border-gray-200 focus:border-primary focus:outline-none px-2 py-1 w-full"
                              placeholder="논제 제목을 입력하세요"
                            />
                          </div>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteAgenda(index)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <textarea
                          value={agenda.reason}
                          onChange={(e) => handleAgendaChange(index, 'reason', e.target.value)}
                          className="text-gray-600 mb-2 border border-gray-200 rounded w-full p-2 focus:outline-none focus:border-primary"
                          placeholder="이 논제를 추천하는 이유"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={agenda.type}
                            onChange={(e) => handleAgendaChange(index, 'type', e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-primary"
                          >
                            <option value="찬반형">찬반형</option>
                            <option value="원인탐구형">원인탐구형</option>
                            <option value="문제해결형">문제해결형</option>
                            <option value="가치판단형">가치판단형</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      className="w-full py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-gray-500"
                      onClick={handleAddAgenda}
                    >
                      + 논제 추가하기
                    </button>
                  </div>
                ) : (
                  // 보기 모드
                  <>
                    {editedAgendas.map((agenda, index) => (
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
                  </>
                )}
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