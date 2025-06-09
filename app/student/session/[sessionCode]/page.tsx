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
  const [isMaterialsExpanded, setIsMaterialsExpanded] = useState(false) // 기본적으로 접힌 상태
  
  // AI 논제 추천 관련 상태
  const [showAgendaRecommender, setShowAgendaRecommender] = useState(false)
  const [isGeneratingAgendas, setIsGeneratingAgendas] = useState(false)
  const [studentAgendas, setStudentAgendas] = useState<any[]>([])
  
  // 세션 코드로 세션 정보 조회
  useEffect(() => {
    console.log('세션 정보 조회 시작 - 현재 학생 정보:', { 
      이름: studentName, 
      모둠: studentGroup,
      세션코드: sessionCode
    });
    
    const fetchSessionByCode = async () => {
      try {
        // Firebase 연결 확인
        if (!database) {
          console.error('Firebase 데이터베이스 연결 실패');
          setError('데이터베이스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
          setLoading(false);
          return;
        }
        
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
                
                // 학생 논제 데이터 있는지 확인
                if (updatedSession.studentAgendas) {
                  const agendaArray = Object.entries(updatedSession.studentAgendas).map(([key, value]) => ({
                    agendaId: key,
                    ...(value as any)
                  }))
                  
                  // 학생 이름과 모둠 정보가 있을 때만 필터링 적용
                  if (studentName && studentGroup) {
                    // 현재 학생/모둠의 논제만 필터링
                    const filteredAgendas = agendaArray.filter(
                      a => a.studentGroup === studentGroup || a.studentName === studentName
                    )
                    
                    setStudentAgendas(filteredAgendas)
                    
                    // 논제가 생성되었으면 추천기 숨기기
                    if (filteredAgendas.length > 0) {
                      setShowAgendaRecommender(false)
                    }
                  }
                }
              }
            })
            
            // 클로저 문제를 피하기 위한 함수 정의
            const setupAgendaListener = () => {
              if (!database) return () => {}; // database가 null인 경우 빈 함수 반환
              const studentAgendasRef = ref(database, `sessions/${foundSessionId}/studentAgendas`);
              
              return onValue(studentAgendasRef, (snapshot) => {
                if (snapshot.exists()) {
                  const agendasData = snapshot.val();
                  const agendaArray = Object.entries(agendasData).map(([key, value]) => ({
                    agendaId: key,
                    ...(value as any)
                  }));
                  
                  // 컴포넌트의 최신 상태에서 이름과 모둠 가져오기
                  const currentName = studentName?.trim() || sessionStorage.getItem(`session_${sessionCode}_name`)?.trim() || '';
                  const currentGroup = studentGroup?.trim() || sessionStorage.getItem(`session_${sessionCode}_group`)?.trim() || '';
                  
                  console.log('학생 정보 확인:', { 
                    이름: currentName, 
                    모둠: currentGroup,
                    세션스토리지_이름: sessionStorage.getItem(`session_${sessionCode}_name`),
                    세션스토리지_모둠: sessionStorage.getItem(`session_${sessionCode}_group`),
                    상태_이름: studentName,
                    상태_모둠: studentGroup
                  });
                  
                  // 유효한 학생 정보가 있을 때만 필터링
                  if (currentName && currentGroup) {
                    // 모든 논제를 먼저 로깅
                    console.log('모든 논제 데이터:', agendaArray.map(a => ({ 
                      id: a.agendaId, 
                      studentName: a.studentName, 
                      studentGroup: a.studentGroup 
                    })));
                    
                    // 현재 학생/모둠의 논제만 필터링
                    const filteredAgendas = agendaArray.filter(a => 
                      (a.studentGroup && a.studentGroup.trim() === currentGroup) || 
                      (a.studentName && a.studentName.trim() === currentName)
                    );
                    
                    console.log('학생 논제 실시간 업데이트:', { 
                      count: filteredAgendas.length, 
                      모둠: currentGroup, 
                      이름: currentName,
                      필터링_전_전체갯수: agendaArray.length
                    });
                    
                    setStudentAgendas(filteredAgendas);
                    
                    // 논제가 생성되었으면 추천기 숨기기
                    if (filteredAgendas.length > 0) {
                      setShowAgendaRecommender(false);
                    }
                  } else {
                    console.warn('유효한 학생 정보가 없어 논제를 필터링할 수 없습니다.');
                  }
                }
              });
            };
            
            // 실시간 리스너 설정
            const agendasUnsubscribe = setupAgendaListener();
            
            return () => {
              unsubscribe()
              agendasUnsubscribe()
            }
          } else {
            setError('유효하지 않은 세션 코드입니다.')
          }
        } else {
          console.log('세션 데이터가 존재하지 않습니다.')
          setError('세션 정보를 찾을 수 없습니다.')
        }
      } catch (err) {
        console.error('세션 조회 오류:', err)
        if (err instanceof Error) {
          setError(`세션 정보를 불러오는 중 오류가 발생했습니다: ${err.message}`)
        } else {
          setError('세션 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchSessionByCode()
    
    // 이름이나 모둠이 변경되면 데이터를 다시 필터링해야 함
    return () => {
      console.log('세션 정보 조회 정리 - 학생 정보 변경됨');
    };
  }, [sessionCode, studentName, studentGroup])
  
  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = studentName.trim();
    const trimmedGroup = studentGroup.trim();
    
    if (!trimmedName || !trimmedGroup) {
      alert('이름과 모둠 정보를 모두 입력해주세요.');
      return;
    }
    
    // 입력값 업데이트
    setStudentName(trimmedName);
    setStudentGroup(trimmedGroup);
    setHasJoined(true);
    
    // 브라우저 세션 스토리지에 저장
    sessionStorage.setItem(`session_${sessionCode}_name`, trimmedName);
    sessionStorage.setItem(`session_${sessionCode}_group`, trimmedGroup);
    
    console.log('세션 참여 정보:', { 이름: trimmedName, 모둠: trimmedGroup });
  }
  
  // 세션 스토리지에서 참여 정보 복원
  useEffect(() => {
    const savedName = sessionStorage.getItem(`session_${sessionCode}_name`) || '';
    const savedGroup = sessionStorage.getItem(`session_${sessionCode}_group`) || '';
    
    if (savedName.trim() && savedGroup.trim()) {
      setStudentName(savedName.trim());
      setStudentGroup(savedGroup.trim());
      setHasJoined(true);
      console.log('세션 정보 복원됨:', { 이름: savedName.trim(), 모둠: savedGroup.trim() });
    } else {
      console.log('저장된 세션 정보 없음');
    }
  }, [sessionCode])
  
  // AI 논제 추천 요청 처리
  const handleRequestAgendas = async (topic: string, description: string, useQuestions: boolean = false) => {
    if (!sessionId || (!topic && !useQuestions)) return
    
    if (!studentName.trim() || !studentGroup.trim()) {
      alert('이름과 모둠 정보가 필요합니다. 다시 로그인해주세요.');
      return;
    }
    
    setIsGeneratingAgendas(true)
    
    try {
      console.log('논제 추천 요청 시작:', { 
        topic, 
        useQuestions,
        studentName: studentName.trim(), 
        studentGroup: studentGroup.trim() 
      });
      
      const response = await fetch('/api/ai/recommend-agendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          topic,
          description,
          studentName: studentName.trim(),
          studentGroup: studentGroup.trim(),
          useQuestions
        }),
      })
      
      console.log('논제 추천 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error('논제 추천 요청에 실패했습니다.')
      }
      
      try {
        // 디버깅을 위해 응답 내용 로깅
        const responseData = await response.json();
        console.log('논제 추천 성공:', { 
          success: responseData.success,
          agendasCount: responseData.recommendedAgendas?.length || 0,
          hasQuestionAnalysis: !!responseData.questionAnalysis
        });
      } catch (jsonError) {
        console.warn('응답 JSON 파싱 실패:', jsonError);
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
          <p className="mt-2 text-sm text-gray-500">세션 코드: {sessionCode}</p>
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
        
        <Card 
          title={
            <div className="flex items-center justify-between">
              <span>학습 자료</span>
              <button
                onClick={() => setIsMaterialsExpanded(!isMaterialsExpanded)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform duration-200 ${isMaterialsExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          }
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          {/* 자료 개수 및 요약 표시 */}
          {!isMaterialsExpanded && (
            <div className="bg-gray-50 rounded-lg p-3 -mx-6 -mb-6 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {session.materials && session.materials.length > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="font-medium">자료 {session.materials.length}개</span>
                      <div className="flex gap-2">
                        {session.materials.map((material: any, index: number) => (
                          <span key={index} className="inline-flex items-center">
                            {material.type === 'text' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                            {material.type === 'youtube' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {material.type === 'link' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                            {material.type === 'file' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : session.materialText || session.materialUrl ? (
                    <span className="font-medium">자료 1개</span>
                  ) : (
                    <span className="text-gray-500">자료 없음</span>
                  )}
                </div>
                <button
                  onClick={() => setIsMaterialsExpanded(true)}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  자료 보기
                </button>
              </div>
            </div>
          )}
          
          {/* 다중 자료 지원 */}
          {isMaterialsExpanded && session.materials && session.materials.length > 0 ? (
            <div className="space-y-6">
              {session.materials.map((material: any, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">자료 {index + 1}</h3>
                  
                  {material.type === 'text' && material.content && (
                    <div className="prose max-w-none text-sm md:text-base">
                      <p className="whitespace-pre-wrap">{material.content}</p>
                    </div>
                  )}
                  
                  {material.type === 'youtube' && material.url && (
                    <div className="aspect-video rounded-md overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYoutubeVideoId(material.url)}`}
                        className="w-full h-full"
                        title={`학습 자료 영상 ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                  
                  {material.type === 'link' && material.url && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{material.linkTitle || '제목 없음'}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{material.url}</p>
                          </div>
                        </div>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          링크 열기
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {material.type === 'file' && material.fileUrl && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{material.fileName}</p>
                            <p className="text-xs text-gray-500">파일 자료</p>
                          </div>
                        </div>
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          다운로드
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : isMaterialsExpanded && session.materialText ? (
            /* 기존 단일 자료와의 호환성 유지 */
            <div className="prose max-w-none text-sm md:text-base">
              <p className="whitespace-pre-wrap">{session.materialText}</p>
            </div>
          ) : isMaterialsExpanded && session.materialUrl ? (
            <div className="aspect-video rounded-md overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeVideoId(session.materialUrl)}`}
                className="w-full h-full"
                title="학습 자료 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : isMaterialsExpanded && (
            <p className="text-gray-500">학습 자료가 없습니다.</p>
          )}
          
          {isMaterialsExpanded && session.keywords && session.keywords.length > 0 && (
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
        
        {/* 네비게이션 탭 (데스크톱 & 모바일) */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap justify-center md:justify-start gap-2 md:gap-8 overflow-x-auto pb-1 scrollbar-hide">
              <a href="#questions" className="whitespace-nowrap py-3 px-3 border-b-2 border-primary font-medium text-primary">
                질문 작성 및 목록
              </a>
              <a href="#ai-agenda" className="whitespace-nowrap py-3 px-3 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                AI 논제 추천
              </a>
              <a href="#helper" className="whitespace-nowrap py-3 px-3 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                질문 도우미
              </a>
              {showAnalysisResult && (
                <a href="#result" className="whitespace-nowrap py-3 px-3 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  교사 분석 결과
                </a>
              )}
            </nav>
          </div>
        </div>
        
        {/* 질문 작성 및 목록 섹션 */}
        <div id="questions" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">질문 작성하기</h2>
          <QuestionInput 
            sessionId={sessionId!} 
            studentName={studentName}
            onQuestionSubmit={() => {}}
          />
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">학생 질문 목록</h2>
            <QuestionList
              sessionId={sessionId!}
              studentName={studentName}
            />
          </div>
        </div>
        
        {/* AI 논제 추천 섹션 */}
        <div id="ai-agenda" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">AI 논제 추천</h2>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
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
                <div className="text-center py-8">
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
        </div>
        
        {/* 질문 도우미 섹션 */}
        <div id="helper" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">질문 도우미</h2>
          <QuestionHelper />
        </div>
        
        {/* 교사 분석 결과 */}
        {showAnalysisResult && session.aiAnalysisResult && (
          <div id="result" className="mb-8">
            <h2 className="text-xl font-semibold mb-4">교사 분석 결과</h2>
            
            <Card title="교사 추천 논제" className="shadow-md hover:shadow-lg transition-shadow mb-6">
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
            
            <div className="mb-6">
              <AgendaValidator />
            </div>
            
            <div>
              <TermDefinition
                sessionId={sessionId!}
                studentGroup={studentGroup}
                initialTerms={session.aiAnalysisResult.extractedTerms}
              />
            </div>
          </div>
        )}
        
        
        {/* 모바일 하단 탭 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-2 px-4 lg:hidden">
          <div className="flex justify-around max-w-md mx-auto">
            <a href="#questions" className="flex flex-col items-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-xs mt-1">질문</span>
            </a>
            <a href="#ai-agenda" className="flex flex-col items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs mt-1">논제 추천</span>
            </a>
            <a href="#helper" className="flex flex-col items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs mt-1">도우미</span>
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