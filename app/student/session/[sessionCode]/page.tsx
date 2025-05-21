'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import QuestionInput from '@/components/student/QuestionInput'
import QuestionList from '@/components/student/QuestionList'
import QuestionHelper from '@/components/student/QuestionHelper'
import AgendaValidator from '@/components/student/AgendaValidator'
import AgendaRecommender from '@/components/student/AgendaRecommender'
import AgendaDisplay from '@/components/student/AgendaDisplay'
import TermDefinition from '@/components/student/TermDefinition'
import { database } from '@/lib/firebase'
import { ref, get, onValue, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'
import { Session, extractYoutubeVideoId } from '@/lib/utils'

interface StudentSessionPageProps {
  params: {
    sessionCode: string
  }
}

export default function StudentSessionPage({ params }: StudentSessionPageProps) {
  const { sessionCode } = params
  const router = useRouter()
  
  const [studentName, setStudentName] = useState('')
  const [studentGroup, setStudentGroup] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnalysisResult, setShowAnalysisResult] = useState(false)
  
  // AI 논제 추천 관련 상태
  const [showAgendaRecommender, setShowAgendaRecommender] = useState(false)
  const [isGeneratingAgendas, setIsGeneratingAgendas] = useState(false)
  const [studentAgendas, setStudentAgendas] = useState<any[]>([])
  
  // 세션 코드로 세션 정보 조회
  useEffect(() => {
    const fetchSessionByCode = async () => {
      try {
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
            setError('Firebase 설정이 완료되지 않았습니다. 환경 변수를 확인하세요.');
            setLoading(false);
            return;
          }
          
          const app = initializeApp(firebaseConfig);
          db = getDatabase(app);
        }
        
        // 세션 코드로 세션 ID 조회
        const sessionsRef = ref(db, 'sessions')
        const snapshot = await get(sessionsRef)
        
        if (snapshot.exists()) {
          let foundSessionId: string | null = null
          let foundSession: Session | null = null
          
          snapshot.forEach((childSnapshot) => {
            const sessionData = childSnapshot.val()
            if (sessionData.accessCode === sessionCode) {
              foundSessionId = childSnapshot.key
              foundSession = {
                sessionId: childSnapshot.key,
                ...sessionData
              }
              return true // forEach 순회 중단
            }
            return false
          })
          
          if (foundSessionId && foundSession) {
            setSessionId(foundSessionId)
            setSession(foundSession)
            
            // 이 세션에 대한 실시간 업데이트 수신
            const sessionRef = ref(db, `sessions/${foundSessionId}`)
            const unsubscribe = onValue(sessionRef, (snapshot) => {
              const updatedSession = snapshot.val()
              if (updatedSession) {
                setSession({
                  sessionId: foundSessionId,
                  ...updatedSession
                })
                
                // AI 분석 결과가 있으면 표시 설정
                if (updatedSession.aiAnalysisResult) {
                  setShowAnalysisResult(true)
                }
                
                // 학생 논제 데이터 있는지 확인
                if (updatedSession.studentAgendas) {
                  const agendaArray = Object.entries(updatedSession.studentAgendas).map(([key, value]) => ({
                    agendaId: key,
                    ...(value as any)
                  }))
                  
                  // 현재 학생/모둠의 논제만 필터링
                  const filteredAgendas = agendaArray.filter(
                    a => a.studentGroup === studentGroup || a.studentName === studentName
                  )
                  
                  setStudentAgendas(filteredAgendas)
                }
              }
            })
            
            // 학생 논제 실시간 업데이트 수신
            const studentAgendasRef = ref(db, `sessions/${foundSessionId}/studentAgendas`)
            const agendasUnsubscribe = onValue(studentAgendasRef, (snapshot) => {
              if (snapshot.exists()) {
                const agendasData = snapshot.val()
                const agendaArray = Object.entries(agendasData).map(([key, value]) => ({
                  agendaId: key,
                  ...(value as any)
                }))
                
                // 현재 학생/모둠의 논제만 필터링
                const filteredAgendas = agendaArray.filter(
                  a => a.studentGroup === studentGroup || a.studentName === studentName
                )
                
                setStudentAgendas(filteredAgendas)
              }
            })
            
            return () => {
              unsubscribe()
              agendasUnsubscribe()
            }
          } else {
            setError('유효하지 않은 세션 코드입니다.')
          }
        } else {
          setError('세션 정보를 찾을 수 없습니다.')
        }
      } catch (err) {
        console.error('세션 조회 오류:', err)
        setError('세션 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSessionByCode()
  }, [sessionCode])
  
  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (studentName.trim() && studentGroup.trim()) {
      setHasJoined(true)
      
      // 브라우저 세션 스토리지에 저장
      sessionStorage.setItem(`session_${sessionCode}_name`, studentName.trim())
      sessionStorage.setItem(`session_${sessionCode}_group`, studentGroup.trim())
    }
  }
  
  // 세션 스토리지에서 참여 정보 복원
  useEffect(() => {
    const savedName = sessionStorage.getItem(`session_${sessionCode}_name`)
    const savedGroup = sessionStorage.getItem(`session_${sessionCode}_group`)
    
    if (savedName && savedGroup) {
      setStudentName(savedName)
      setStudentGroup(savedGroup)
      setHasJoined(true)
    }
  }, [sessionCode])
  
  // AI 논제 추천 요청 처리
  const handleRequestAgendas = async (topic: string, description: string, useQuestions: boolean = false) => {
    if (!sessionId || (!topic && !useQuestions)) return
    
    setIsGeneratingAgendas(true)
    
    try {
      const response = await fetch('/api/ai/recommend-agendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          topic,
          description,
          studentName,
          studentGroup,
          useQuestions
        }),
      })
      
      if (!response.ok) {
        throw new Error('논제 추천 요청에 실패했습니다.')
      }
      
      // 서버 응답을 기다릴 필요가 없음 - Firebase 실시간 업데이트로 데이터를 수신함
      setShowAgendaRecommender(false)
    } catch (error) {
      console.error('AI 논제 추천 오류:', error)
      alert('논제 추천 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsGeneratingAgendas(false)
    }
  }
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">세션 정보를 불러오는 중...</p>
        </div>
      </>
    )
  }
  
  if (error || !session) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block">
            <p className="font-medium">{error || '세션 정보를 찾을 수 없습니다.'}</p>
            <p className="mt-2 text-sm">
              올바른 세션 코드를 확인하여 다시 시도해주세요.
            </p>
          </div>
        </div>
      </>
    )
  }
  
  if (!hasJoined) {
    return (
      <>
        <Header />
        <div className="max-w-md mx-auto px-4 md:px-0">
          <Card title="토론 세션 참여하기">
            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  id="studentName"
                  type="text"
                  className="input-field"
                  placeholder="이름을 입력하세요"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  autoComplete="name"
                  autoCapitalize="words"
                />
              </div>
              
              <div>
                <label htmlFor="studentGroup" className="block text-sm font-medium text-gray-700 mb-1">
                  모둠명
                </label>
                <input
                  id="studentGroup"
                  type="text"
                  className="input-field"
                  placeholder="모둠명을 입력하세요"
                  value={studentGroup}
                  onChange={(e) => setStudentGroup(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              
              <Button type="submit" variant="primary" fullWidth>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                참여하기
              </Button>
            </form>
          </Card>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">토론 세션</h1>
            <div className="bg-accent/10 text-accent inline-flex items-center px-3 py-1 rounded-full text-sm mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{studentName}</span> ({studentGroup} 모둠)
            </div>
          </div>
        </div>
        
        <Card title="학습 자료" className="shadow-md hover:shadow-lg transition-shadow">
          {session.materialText ? (
            <div className="prose max-w-none text-sm md:text-base">
              <p className="whitespace-pre-wrap">{session.materialText}</p>
            </div>
          ) : session.materialUrl ? (
            <div className="aspect-video rounded-md overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeVideoId(session.materialUrl)}`}
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
        
        {/* 모바일에서는 탭 형태로 전환 */}
        <div className="block lg:hidden">
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1 scrollbar-hide">
              <a href="#questions" className="whitespace-nowrap py-2 px-1 border-b-2 border-primary font-medium text-sm text-primary">
                질문 작성 및 목록
              </a>
              <a href="#helper" className="whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                질문 도우미
              </a>
              <a href="#ai-agenda" className="whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                AI 논제 추천
              </a>
              {showAnalysisResult && (
                <a href="#result" className="whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  교사 분석 결과
                </a>
              )}
            </nav>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2" id="questions">
            <QuestionInput 
              sessionId={sessionId!} 
              studentName={studentName}
              onQuestionSubmit={() => {}}
            />
            
            <div className="mt-4 md:mt-6">
              <QuestionList
                sessionId={sessionId!}
                studentName={studentName}
              />
            </div>
          </div>
          
          <div className="space-y-4 md:space-y-6 mt-6 lg:mt-0">
            <div id="helper">
              <QuestionHelper />
            </div>
            
            {/* AI 논제 관련 컴포넌트 */}
            <div id="ai-agenda" className="mt-4 md:mt-6">
              {showAgendaRecommender ? (
                <AgendaRecommender
                  onRequestAgendas={handleRequestAgendas}
                  isLoading={isGeneratingAgendas}
                />
              ) : studentAgendas.length > 0 ? (
                <AgendaDisplay
                  agendas={studentAgendas}
                  onCreateNew={() => setShowAgendaRecommender(true)}
                />
              ) : (
                <Card title="AI 논제 추천">
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">
                      모둠에서 토론하고 싶은 주제에 대해 AI가 논제를 추천해드립니다.
                    </p>
                    <Button 
                      variant="primary"
                      onClick={() => setShowAgendaRecommender(true)}
                    >
                      AI 논제 추천 시작하기
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            
            {showAnalysisResult && session.aiAnalysisResult && (
              <div id="result" className="mt-4 md:mt-6">
                <Card title="교사 분석 논제" className="shadow-md hover:shadow-lg transition-shadow">
                  {session.aiAnalysisResult.recommendedAgendas && (
                    <div className="space-y-4">
                      {session.aiAnalysisResult.recommendedAgendas.map((agenda: any, index: number) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                          <h3 className="font-medium mb-1 text-sm md:text-base">{agenda.agendaTitle}</h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-2">{agenda.reason}</p>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {agenda.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                
                <div className="mt-4 md:mt-6">
                  <AgendaValidator />
                </div>
                
                <div className="mt-4 md:mt-6">
                  <TermDefinition
                    sessionId={sessionId!}
                    studentGroup={studentGroup}
                    initialTerms={session.aiAnalysisResult.extractedTerms}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 모바일 탭 전환을 위한 하단 탭 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-2 px-4 lg:hidden">
          <div className="flex justify-around max-w-md mx-auto">
            <a href="#questions" className="flex flex-col items-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-xs mt-1">질문</span>
            </a>
            <a href="#helper" className="flex flex-col items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs mt-1">도우미</span>
            </a>
            <a href="#ai-agenda" className="flex flex-col items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs mt-1">AI 논제</span>
            </a>
            {showAnalysisResult && (
              <a href="#result" className="flex flex-col items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs mt-1">교사 논제</span>
              </a>
            )}
          </div>
        </div>
        
        {/* 모바일 하단 탭 영역 패딩 */}
        <div className="h-16 lg:hidden"></div>
      </div>
    </>
  )
}