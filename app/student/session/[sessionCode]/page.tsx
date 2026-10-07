'use client'

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation'
import Header from '@/components/common/Header'
import Breadcrumb from '@/components/common/Breadcrumb'
import NavigationActions from '@/components/common/NavigationActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import QuestionInput from '@/components/student/QuestionInput'
import QuestionList from '@/components/student/QuestionList'
import QuestionHelper from '@/components/student/QuestionHelper'
import AgendaValidator from '@/components/student/AgendaValidator'
import AgendaRecommender from '@/components/student/AgendaRecommender'
import AgendaDisplay from '@/components/student/AgendaDisplay'
import TermDefinition from '@/components/student/TermDefinition'
import EvidenceSearchModalContainer from '@/components/evidence/EvidenceSearchModalContainer'
import DebateOpinionInput from '@/components/student/DebateOpinionInput'
import DebateOpinionList from '@/components/student/DebateOpinionList'
import { database, getFirebaseDatabase, isInitialized } from '@/lib/firebase'
import { ref, get, onValue, getDatabase, Database } from 'firebase/database'
import { initializeApp } from 'firebase/app'
import { Session, extractYoutubeVideoId } from '@/lib/utils'
import type { EvidenceResult } from '@/lib/types/evidence'

interface StudentSessionPageProps {
  params: Promise<{
    sessionCode: string
  }>
}

export default function StudentSessionPage(props: StudentSessionPageProps) {
  const params = use(props.params);
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
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // 근거자료 검색 상태 (공통 컴포넌트 사용)
  const [isEvidenceSearchModalOpen, setIsEvidenceSearchModalOpen] = useState(false)

  // 디버깅 정보 추가 함수
  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }

  // 세션 코드로 세션 정보 조회
  useEffect(() => {
    addDebugInfo('=== 세션 조회 시작 ===');
    
    const envInfo = {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      브라우저: typeof window !== 'undefined' ? window.navigator.vendor : 'server',
      뷰포트: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'server',
      연결상태: typeof window !== 'undefined' && 'onLine' in window.navigator ? window.navigator.onLine : 'unknown'
    };
    addDebugInfo(`환경 정보: ${JSON.stringify(envInfo)}`);
    addDebugInfo(`세션 정보: 이름=${studentName}, 모둠=${studentGroup}, 세션코드=${sessionCode}`);
    
    const fetchSessionByCode = async () => {
      try {
        addDebugInfo(`Firebase 초기화 상태: ${isInitialized}`);
        addDebugInfo(`Firebase database 객체: ${database ? '존재함' : 'null'}`);
        
        // Firebase 연결 확인 및 재시도
        const db = getFirebaseDatabase();
        if (!db) {
          addDebugInfo('❌ Firebase 데이터베이스 연결 실패 - database 객체가 null');
          setError('데이터베이스 연결에 실패했습니다. 네트워크 연결을 확인하고 페이지를 새로고침해주세요.');
          setLoading(false);
          return;
        }
        
        addDebugInfo('✅ Firebase 연결 확인됨, 세션 조회 시작...');
        
        // 세션 코드로 세션 ID 조회
        addDebugInfo('📡 세션 데이터 조회 중...');
        const sessionsRef = ref(db, 'sessions')
        const snapshot = await get(sessionsRef)
        
        addDebugInfo(`📡 Firebase 응답: exists=${snapshot.exists()}, hasData=${snapshot.val() !== null}`);
        
        if (snapshot.exists()) {
          let foundSessionId: string | null = null
          let foundSession: Session | null = null
          const allSessions = snapshot.val();
          
          console.log('전체 세션 수:', Object.keys(allSessions || {}).length);
          console.log('찾는 세션 코드:', sessionCode);
          
          snapshot.forEach((childSnapshot) => {
            const sessionData = childSnapshot.val()
            console.log('세션 확인:', {
              sessionId: childSnapshot.key,
              sessionCode: sessionData.sessionCode,
              accessCode: sessionData.accessCode,
              title: sessionData.title,
              sessionCode매치: sessionData.sessionCode === sessionCode,
              accessCode매치: sessionData.accessCode === sessionCode
            });
            
            // sessionCode 또는 accessCode 중 하나라도 일치하면 찾은 것으로 간주 (API와 동일한 로직)
            if (sessionData.sessionCode === sessionCode || sessionData.accessCode === sessionCode) {
              foundSessionId = childSnapshot.key
              foundSession = {
                sessionId: childSnapshot.key,
                ...sessionData
              }
              console.log('🎉 세션 발견!', foundSessionId, `(sessionCode: ${sessionData.sessionCode}, accessCode: ${sessionData.accessCode})`);
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
              if (!db) return () => {}; // database가 null인 경우 빈 함수 반환
              const studentAgendasRef = ref(db, `sessions/${foundSessionId}/studentAgendas`);
              
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
          console.log('❌ 세션 데이터가 존재하지 않습니다.')
          console.log('Firebase 데이터베이스에 세션이 없거나 권한 문제일 수 있습니다.');
          setError('세션 정보를 찾을 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.')
        }
      } catch (err) {
        console.error('❌ 세션 조회 중 오류 발생:', err)
        console.error('에러 상세:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : 'No stack'
        });
        
        if (err instanceof Error) {
          if (err.message.includes('network') || err.message.includes('offline')) {
            setError('네트워크 연결을 확인해주세요. 인터넷에 연결된 상태에서 다시 시도해주세요.')
          } else if (err.message.includes('permission') || err.message.includes('auth')) {
            setError('접근 권한 문제가 발생했습니다. 페이지를 새로고침해주세요.')
          } else {
            setError(`세션 정보를 불러오는 중 오류가 발생했습니다: ${err.message}`)
          }
        } else {
          setError('세션 정보를 불러오는 중 알 수 없는 오류가 발생했습니다. 페이지를 새로고침해주세요.')
        }
      } finally {
        console.log('=== 세션 조회 완료 ===');
        setLoading(false)
      }
    }
    
    // 타임아웃 설정 (모바일 환경에서 네트워크가 느릴 수 있음)
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ 세션 조회 타임아웃 (30초)');
        setError('세션을 불러오는 데 시간이 너무 오래 걸립니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        setLoading(false);
      }
    }, 30000); // 30초 타임아웃
    
    fetchSessionByCode().finally(() => {
      clearTimeout(timeoutId);
    });
    
    // 이름이나 모둠이 변경되면 데이터를 다시 필터링해야 함
    return () => {
      console.log('세션 정보 조회 정리 - 학생 정보 변경됨');
      clearTimeout(timeoutId);
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

  // 근거자료 검색 요청 처리
  // 근거자료 검색 모달 열기 (공통 컴포넌트 사용)
  const handleOpenEvidenceSearch = () => {
    setIsEvidenceSearchModalOpen(true)
  }


  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">세션 정보를 불러오는 중...</p>
            <p className="mt-2 text-sm text-gray-500">세션 코드: {sessionCode}</p>
            <div className="mt-6 text-xs text-gray-400 space-y-1">
              <p>💡 잠시만 기다려주세요</p>
              <p>📱 태블릿이나 모바일에서는 조금 더 오래 걸릴 수 있습니다</p>
              <p>🌐 네트워크 연결을 확인해주세요</p>
            </div>
          </div>
          
          {/* 실시간 디버깅 정보 */}
          {debugInfo.length > 0 && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">🔍 연결 상태</h3>
                <button 
                  onClick={() => setDebugInfo([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  지우기
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto text-xs text-gray-600 space-y-1 font-mono">
                {debugInfo.map((info, index) => (
                  <div key={index} className="break-all">
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  if (error || !session) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto text-center py-12 px-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-md inline-block max-w-md">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="font-medium text-lg mb-3">{error || '세션 정보를 찾을 수 없습니다.'}</p>
            <p className="text-sm mb-4">
              세션 코드: <span className="font-mono font-bold bg-red-100 px-2 py-1 rounded">{sessionCode}</span>
            </p>
            
            <div className="bg-white p-4 rounded-md text-left text-sm space-y-2">
              <p className="font-semibold text-red-800">📱 모바일/태블릿 사용자:</p>
              <ul className="text-red-700 space-y-1 pl-4">
                <li>• 페이지 새로고침 (당겨서 새로고침)</li>
                <li>• Wi-Fi 연결 확인</li>
                <li>• 브라우저 캐시 삭제</li>
                <li>• 다른 브라우저 시도 (Chrome, Safari)</li>
              </ul>
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              🔄 페이지 새로고침
            </button>
          </div>
          
          {/* 에러 시에도 디버깅 정보 표시 */}
          {debugInfo.length > 0 && (
            <div className="mt-8 bg-gray-100 p-4 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-3">🔍 연결 과정 (기술진단용)</h3>
              <div className="max-h-32 overflow-y-auto text-xs text-gray-600 space-y-1 font-mono">
                {debugInfo.slice(-10).map((info, index) => (
                  <div key={index} className="break-all">
                    {info}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 이 정보를 선생님께 보여주시면 문제 해결에 도움이 됩니다
              </p>
            </div>
          )}
        </div>
      </>
    )
  }

  if (!hasJoined) {
    return (
      <>
        <Header />
        <div className="max-w-md mx-auto px-4 md:px-0">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-blue-800">🎯 토론 세션 참여하기</CardTitle>
              <CardDescription className="text-blue-700 text-base mt-2">
                이름과 모둠명을 입력하고 토론에 참여해보세요!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinSession} className="space-y-6">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-bold text-blue-800 mb-2 flex items-center">
                    👤 이름
                  </label>
                  <Input
                    id="studentName"
                    type="text"
                    className="bg-gradient-to-r from-blue-50 to-white border-blue-200 focus:border-blue-400 focus:ring-blue-200 text-gray-800 placeholder-gray-500"
                    placeholder="이름을 입력하세요"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    autoComplete="name"
                    autoCapitalize="words"
                  />
                </div>
                
                <div>
                  <label htmlFor="studentGroup" className="block text-sm font-bold text-blue-800 mb-2 flex items-center">
                    👥 모둠명
                  </label>
                  <Input
                    id="studentGroup"
                    type="text"
                    className="bg-gradient-to-r from-blue-50 to-white border-blue-200 focus:border-blue-400 focus:ring-blue-200 text-gray-800 placeholder-gray-500"
                    placeholder="모둠명을 입력하세요"
                    value={studentGroup}
                    onChange={(e) => setStudentGroup(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                
                <Button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  🚀 참여하기
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-container mx-auto px-4 py-6">
        {/* 브레드크럼 네비게이션 */}
        <Breadcrumb 
          items={[
            { label: '학생용', href: `/student/session/${sessionCode}` },
            { label: '토론 세션', href: `/student/session/${sessionCode}` },
            { label: session?.title || '세션' }
          ]}
          className="mb-6"
        />

        {/* 네비게이션 액션 */}
        <NavigationActions 
          backHref="/"
          backLabel="홈으로 돌아가기"
          className="mb-6"
        />
      
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 md:px-6">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-4 rounded-full shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-1">🎆 토론 세션</h1>
                  <div className="bg-green-200 text-green-800 inline-flex items-center px-4 py-2 rounded-full text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold">👨‍🎓 {studentName}</span>
                    <span className="mx-2 text-green-600">|</span>
                    <span className="font-medium">👥 {studentGroup} 모둠</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-3 rounded-full shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-orange-800">📚 학습 자료</CardTitle>
              </div>
              <button
                onClick={() => setIsMaterialsExpanded(!isMaterialsExpanded)}
                className="bg-white/70 p-2 rounded-full shadow-sm hover:bg-white hover:shadow-md transition-all text-orange-600 hover:text-orange-800"
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
          </CardHeader>
          <CardContent className="pt-0">
            {/* 자료 개수 및 요약 표시 */}
            {!isMaterialsExpanded && (
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-200 rounded-xl p-4 mx-2 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-orange-800">
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
                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    📖 자료 보기
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
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-xl">
                <h3 className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  키워드
                </h3>
                <div className="flex flex-wrap gap-2">
                  {session.keywords.map((keyword, index) => (
                    <span key={index} className="bg-orange-200 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 모던 플로팅 네비게이션 */}
        <div className="mb-6">
          {/* 데스크톱용 안내 메시지 */}
          <div className="hidden lg:block bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">💡 편리한 플로팅 버튼 활용하세요!</p>
                <p className="text-xs text-blue-600">화면 우측에서 AI 논제추천, 근거자료 검색, 토론의견 등의 기능을 바로 사용할 수 있어요</p>
              </div>
            </div>
          </div>
          
          {/* 모바일용 안내 메시지 */}
          <div className="lg:hidden bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">📱 모바일 최적화</p>
                <p className="text-xs text-green-600">하단 탭바와 플로팅 버튼으로 쉽게 기능을 이용하세요</p>
              </div>
            </div>
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
        
        {/* 토론 의견 제출 섹션 */}
        <div id="debate-opinion" className="mb-8">
          <h2 className="text-xl font-semibold mb-4">💬 토론 의견 제출</h2>
          <DebateOpinionInput
            sessionId={sessionId!}
            sessionCode={sessionCode}
            studentName={studentName}
            studentGroup={studentGroup}
            onOpinionSubmit={() => {}}
          />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">📋 제출된 토론 의견</h2>
            <DebateOpinionList
              sessionId={sessionId!}
              sessionCode={sessionCode}
              currentStudentName={studentName}
              currentStudentGroup={studentGroup}
            />
          </div>
        </div>
        
        {/* AI 논제 추천 섹션 */}
        <div id="ai-agenda" className="mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-3 rounded-full shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-blue-800">🤖 AI 논제 추천</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 mb-6 border-2 border-blue-200">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full shadow-lg">
                        <span className="text-3xl">🚀</span>
                      </div>
                    </div>
                    <p className="text-blue-800 font-medium text-lg mb-2">
                      모둠 토론 주제를 AI가 추천해드려요!
                    </p>
                    <p className="text-blue-600 text-sm">
                      궁금한 주제나 관심사를 입력하면 흥미로운 논제를 만들어드립니다
                    </p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => setShowAgendaRecommender(true)}
                  >
                    <span className="mr-2">✨</span>
                    AI 논제 추천 시작하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* 근거자료 검색 섹션 */}
        <div id="evidence-search" className="mb-8">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-400 to-violet-400 p-3 rounded-full shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-purple-800">🔍 AI 근거자료 검색</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl p-6 mb-6 border-2 border-purple-200">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-4 rounded-full shadow-lg">
                      <span className="text-3xl">📚</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-purple-800 mb-3">
                    신뢰할 수 있는 근거자료 찾기
                  </h3>
                  <p className="text-purple-600 text-sm mb-4">
                    토론 주제에 대한 다양한 자료를 AI가 찾아드려요
                  </p>
                  <div className="bg-white/70 rounded-lg p-4 mb-4">
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li className="flex items-center justify-center gap-2">
                        <span>📰</span>
                        <span>뉴스 기사 (신뢰할 수 있는 언론사)</span>
                      </li>
                      <li className="flex items-center justify-center gap-2">
                        <span>🎬</span>
                        <span>유튜브 교육 영상</span>
                      </li>
                      <li className="flex items-center justify-center gap-2">
                        <span>📖</span>
                        <span>토론에 도움이 되는 근거자료</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={handleOpenEvidenceSearch}
                >
                  <span className="mr-2">🚀</span>
                  근거자료 검색 시작하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 질문 도우미 섹션 */}
        <div id="helper" className="mb-8">
          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-pink-400 to-rose-400 p-3 rounded-full shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-pink-800">💡 질문 도우미</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <QuestionHelper />
            </CardContent>
          </Card>
        </div>
        
        {/* 교사 분석 결과 */}
        {showAnalysisResult && session.aiAnalysisResult && (
          <div id="result" className="mb-8">
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-indigo-400 to-blue-400 p-3 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-indigo-800">👨‍🏫 교사 추천 논제</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {session.aiAnalysisResult.recommendedAgendas && (
                  <div className="space-y-4">
                    {session.aiAnalysisResult.recommendedAgendas.map((agenda: any, index: number) => (
                      <div key={index} className="bg-white/70 rounded-lg p-4 border border-indigo-100 hover:border-indigo-200 transition-colors">
                        <h3 className="font-semibold mb-2 text-indigo-800 text-base">{agenda.agendaTitle}</h3>
                        <p className="text-sm text-indigo-600 mb-3 leading-relaxed">{agenda.reason}</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border border-indigo-200">
                          <span className="mr-1">🏷️</span>
                          {agenda.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="mb-6">
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-3 rounded-full shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <CardTitle className="text-xl text-emerald-800">✅ 논제 검증</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <AgendaValidator />
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-3 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-amber-800">📚 용어 정의</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <TermDefinition
                  sessionId={sessionId!}
                  studentGroup={studentGroup}
                  initialTerms={session.aiAnalysisResult.extractedTerms}
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        
        {/* 개선된 모바일 하단 탭 바 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl py-3 px-4 lg:hidden z-50">
          <div className="flex justify-around items-center max-w-lg mx-auto">
            <a href="#questions" className="flex flex-col items-center group transition-all duration-200 hover:scale-110">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-full shadow-lg group-hover:shadow-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium text-blue-600">질문</span>
            </a>
            
            <a href="#debate-opinion" className="flex flex-col items-center group transition-all duration-200 hover:scale-110">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full shadow-lg group-hover:shadow-green-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium text-green-600">토론의견</span>
            </a>
            
            <a href="#ai-agenda" className="flex flex-col items-center group transition-all duration-200 hover:scale-110">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-full shadow-lg group-hover:shadow-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium text-indigo-600">AI논제</span>
            </a>
            
            <a href="#helper" className="flex flex-col items-center group transition-all duration-200 hover:scale-110">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-full shadow-lg group-hover:shadow-pink-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium text-pink-600">도우미</span>
            </a>
            
            {showAnalysisResult && (
              <a href="#result" className="flex flex-col items-center group transition-all duration-200 hover:scale-110">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-full shadow-lg group-hover:shadow-amber-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xs mt-1 font-medium text-amber-600">교사논제</span>
              </a>
            )}
          </div>
        </div>
        
        {/* 모바일 하단 탭 영역 패딩 */}
        <div className="h-20 lg:hidden"></div>
      </div>
      </div>
      
      {/* 플로팅 네비게이션 - 데스크톱용 */}
      <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col gap-4">
          {/* AI 논제 추천 */}
          <Button
            onClick={() => document.getElementById('ai-agenda')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-blue-500/25 rounded-full p-4 transition-all duration-300 transform hover:scale-110"
            aria-label="AI 논제 추천"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              🤖 AI 논제 추천
            </span>
          </Button>

          {/* 근거자료 검색 */}
          <Button
            onClick={handleOpenEvidenceSearch}
            className="group relative bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-2xl hover:shadow-purple-500/25 rounded-full p-4 transition-all duration-300 transform hover:scale-110"
            aria-label="AI 근거자료 검색"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              🔍 AI 근거자료 검색
            </span>
            <span className="absolute top-0 left-0 -ml-1 -mt-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
          </Button>

          {/* 토론 의견 제출 */}
          <Button
            onClick={() => document.getElementById('debate-opinion')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl hover:shadow-green-500/25 rounded-full p-4 transition-all duration-300 transform hover:scale-110"
            aria-label="토론 의견 제출"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              💬 토론 의견 제출
            </span>
          </Button>

          {/* 질문 도우미 */}
          <Button
            onClick={() => document.getElementById('helper')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-2xl hover:shadow-pink-500/25 rounded-full p-4 transition-all duration-300 transform hover:scale-110"
            aria-label="질문 도우미"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              💡 질문 도우미
            </span>
          </Button>

          {/* 위로 스크롤 */}
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-2xl hover:shadow-gray-500/25 rounded-full p-4 transition-all duration-300 transform hover:scale-110"
            aria-label="맨 위로"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              ⬆️ 맨 위로
            </span>
          </Button>
        </div>
      </div>
      
      {/* 플로팅 버튼 - 근거자료 검색 (모바일용) */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40">
        <Button
          onClick={handleOpenEvidenceSearch}
          className="group relative bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-2xl rounded-full p-3 transition-all duration-300 transform hover:scale-110"
          aria-label="AI 근거자료 검색"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            AI
          </span>
        </Button>
      </div>
      
      {/* 근거자료 검색 모달 (공통 컴포넌트 사용) */}
      <EvidenceSearchModalContainer
        isOpen={isEvidenceSearchModalOpen}
        onClose={() => setIsEvidenceSearchModalOpen(false)}
        initialTopic={session?.title || ''}
      />
    </>
  )
}