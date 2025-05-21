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
import TermDefinition from '@/components/student/TermDefinition'
import { database } from '@/lib/firebase'
import { ref, get, onValue } from 'firebase/database'
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
  
  // 세션 코드로 세션 정보 조회
  useEffect(() => {
    const fetchSessionByCode = async () => {
      try {
        // 세션 코드로 세션 ID 조회
        const sessionsRef = ref(database, 'sessions')
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
            const sessionRef = ref(database, `sessions/${foundSessionId}`)
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
              }
            })
            
            return () => unsubscribe()
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
        <div className="max-w-md mx-auto">
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
                />
              </div>
              
              <Button type="submit" variant="primary" fullWidth>
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">토론 세션</h1>
            <p className="text-gray-600">
              참여자: <span className="font-medium">{studentName}</span> ({studentGroup} 모둠)
            </p>
          </div>
        </div>
        
        <Card title="학습 자료">
          {session.materialText ? (
            <div className="prose max-w-none">
              <p>{session.materialText}</p>
            </div>
          ) : session.materialUrl ? (
            <div className="aspect-video">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuestionInput 
              sessionId={sessionId!} 
              studentName={studentName}
              onQuestionSubmit={() => {}}
            />
            
            <div className="mt-6">
              <QuestionList
                sessionId={sessionId!}
                studentName={studentName}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <QuestionHelper />
            
            {showAnalysisResult && session.aiAnalysisResult && (
              <>
                <Card title="AI 추천 논제">
                  {session.aiAnalysisResult.recommendedAgendas && (
                    <div className="space-y-4">
                      {session.aiAnalysisResult.recommendedAgendas.map((agenda: any, index: number) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                          <h3 className="font-medium mb-1">{agenda.agendaTitle}</h3>
                          <p className="text-sm text-gray-600 mb-2">{agenda.reason}</p>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {agenda.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                
                <AgendaValidator />
                
                <TermDefinition
                  sessionId={sessionId!}
                  studentGroup={studentGroup}
                  initialTerms={session.aiAnalysisResult.extractedTerms}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}