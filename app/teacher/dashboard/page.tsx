'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import RequireAuth from '@/components/auth/RequireAuth'
import { Card } from '@/components/common/Card'
import SessionList from '@/components/teacher/SessionList'
import { Button } from '@/components/common/Button'
import DebateScenarioModal from '@/components/teacher/DebateScenarioModal'
import EvidenceSearchModalContainer from '@/components/evidence/EvidenceSearchModalContainer'
import DebateStatistics from '@/components/teacher/DebateStatistics'
import { Session } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, onValue, off } from 'firebase/database'
import { useAuth } from '@/contexts/AuthContext'

function TeacherDashboardContent() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDebateScenarioModalOpen, setIsDebateScenarioModalOpen] = useState(false)
  const [isEvidenceSearchModalOpen, setIsEvidenceSearchModalOpen] = useState(false)
  
  // 심사위원 모드 확인
  const viewAsUid = searchParams.get('viewAs')
  const isJudgeMode = !!viewAsUid
  const effectiveUserId = viewAsUid || user?.uid

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('세션 목록 조회 시작...')
      
      const response = await fetch('/api/sessions/list', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      console.log('세션 목록 응답 상태:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('세션 목록 조회 오류:', errorData)
        throw new Error('세션 목록을 불러오는데 실패했습니다.')
      }
      
      const data = await response.json()
      console.log('받아온 세션 데이터:', data)
      console.log('세션 개수:', data.sessions?.length || 0)
      
      // 각 세션의 ID 목록 출력 (디버깅용)
      if (data.sessions && data.sessions.length > 0) {
        const sessionIds = data.sessions.map((s: Session) => s.sessionId)
        console.log('조회된 세션 ID 목록:', sessionIds)
      }
      
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('세션 목록 로드 오류:', err)
      setError('세션 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // Firebase 실시간 리스너가 자동으로 처리하므로 불필요

  useEffect(() => {
    // 인증 정보가 아직 로딩 중이면 대기
    if (authLoading) {
      console.log('인증 정보 로딩 중...')
      return
    }
    
    // user가 없으면 (로그아웃 상태) 빈 배열 설정
    if (!user) {
      console.log('사용자가 로그인하지 않음')
      setSessions([])
      setLoading(false)
      return
    }
    
    if (!database) {
      console.error('Firebase database가 초기화되지 않음')
      fetchSessions() // 폴백으로 API 호출
      return
    }

    console.log('Firebase 실시간 리스너 설정 중... 교사 ID:', user.uid)
    const sessionsRef = ref(database, 'sessions')
    
    // Firebase 실시간 리스너 설정
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      setLoading(true)
      console.log('Firebase 실시간 데이터 변화 감지됨')
      
      if (snapshot.exists()) {
        const sessionsData = snapshot.val()
        console.log('실시간으로 받은 세션 데이터:', sessionsData)
        
        // 세션 데이터를 배열로 변환
        const sessionsArray = Object.entries(sessionsData).map(([sessionId, data]) => ({
          sessionId,
          ...(data as any)
        }))
        
        // 현재 로그인한 교사의 세션만 필터링 (심사위원 모드 시 특정 UID 필터링)
        const mySessionsArray = sessionsArray.filter(session => {
          if (!session) return false
          return session.teacherId === effectiveUserId || (!session.teacherId && !isJudgeMode)
        })
        
        console.log('=== 세션 필터링 디버깅 ===')
        console.log('현재 User UID:', user.uid)
        console.log('심사위원 모드:', isJudgeMode)
        console.log('유효 사용자 ID:', effectiveUserId)
        console.log('전체 세션 정보:')
        sessionsArray.forEach(s => {
          console.log(`- 세션 ID: ${s.sessionId}, teacherId: ${s.teacherId}, 일치: ${s.teacherId === effectiveUserId}`)
        })
        
        // 최신순으로 정렬
        mySessionsArray.sort((a, b) => {
          const aTime = a?.createdAt || 0
          const bTime = b?.createdAt || 0
          return bTime - aTime
        })
        
        console.log('전체 세션:', sessionsArray.length, '개')
        console.log('내 세션:', mySessionsArray.length, '개')
        console.log('내 세션 ID 목록:', mySessionsArray.map((s: Session) => s?.sessionId || 'unknown'))
        
        setSessions(mySessionsArray)
        setError(null)
      } else {
        console.log('Firebase에 세션 데이터 없음')
        setSessions([])
      }
      
      setLoading(false)
    }, (error) => {
      console.error('Firebase 실시간 리스너 오류:', error)
      setError('실시간 데이터 연결에 문제가 발생했습니다.')
      setLoading(false)
      
      // 실시간 연결 실패 시 폴백으로 API 호출
      fetchSessions()
    })

    return () => {
      console.log('Firebase 실시간 리스너 해제')
      unsubscribe()
    }
  }, [user, authLoading, effectiveUserId, isJudgeMode])

  return (
    <RequireAuth>
      <Header />
      <div className="max-w-4xl mx-auto">
        {isJudgeMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-800">심사위원 모드</h3>
                <p className="text-sm text-blue-700">
                  공모전 심사를 위해 특정 교사 계정의 대시보드를 열람하고 있습니다. (UID: {viewAsUid})
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isJudgeMode ? '심사용 교사 대시보드' : '교사 대시보드'}
            </h1>
            <p className="text-gray-600">
              {isJudgeMode 
                ? '이 교사가 생성한 토론 세션들을 확인할 수 있습니다.' 
                : '토론 교육을 위한 모든 기능을 한 곳에서 이용하세요.'
              }
            </p>
          </div>

          {/* 주요 기능 카드 섹션 */}
          {!isJudgeMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* 새 토론 세션 만들기 카드 */}
              <Link href="/teacher/session/create" className="group">
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">새 토론 세션 만들기</h3>
                  <p className="text-sm text-gray-600">학습 자료와 함께 토론 세션을 생성하고 학생들의 질문을 수집하세요.</p>
                </div>
              </Link>

              {/* AI 토론 시나리오 생성기 카드 */}
              <div className="group cursor-pointer" onClick={() => setIsDebateScenarioModalOpen(true)}>
                <div className="bg-white border-2 border-secondary/20 rounded-xl p-6 hover:border-secondary hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-secondary/10 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">AI 토론 시나리오 생성</h3>
                  <p className="text-sm text-gray-600">키워드를 입력하면 AI가 교육 목적에 맞는 토론 주제와 시나리오를 추천합니다.</p>
                </div>
              </div>

              {/* 근거자료 검색 카드 */}
              <div className="group cursor-pointer" onClick={() => setIsEvidenceSearchModalOpen(true)}>
                <div className="bg-white border-2 border-accent/20 rounded-xl p-6 hover:border-accent hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-accent/10 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">근거자료 검색</h3>
                  <p className="text-sm text-gray-600">토론 주제에 맞는 신뢰할 수 있는 근거자료를 AI가 찾아드립니다.</p>
                </div>
              </div>

              {/* 토론 의견 관리 카드 */}
              <Link href="/teacher/debate" className="group">
                <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">토론 의견 관리</h3>
                  <p className="text-sm text-gray-600">학생들의 토론 의견을 확인하고 AI/교사 피드백을 제공하세요.</p>
                </div>
              </Link>
            </div>
          )}
        </div>
        
        <Card title={isJudgeMode ? "교사의 토론 세션" : "내 토론 세션"}>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              총 {sessions?.length || 0}개의 세션
            </div>
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="text-sm text-primary hover:text-primary-dark disabled:opacity-50 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              새로고침
            </button>
          </div>
          <SessionList 
            sessions={sessions} 
            loading={loading || authLoading} 
            error={error}
            onRefresh={fetchSessions}
          />
        </Card>
        
        {/* 통계 대시보드 */}
        {!isJudgeMode && (
          <div className="mt-8">
            <DebateStatistics />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="퀵 가이드">
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-medium mb-1">세션 생성하기</h3>
                <p className="text-sm text-gray-600">
                  "새 토론 세션 만들기" 버튼을 클릭하여 학습 자료와 키워드를 입력한 후 세션을 생성합니다.
                </p>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="font-medium mb-1">세션 코드 공유하기</h3>
                <p className="text-sm text-gray-600">
                  생성된 세션 코드를 학생들에게 공유하여 질문 작성에 참여하도록 합니다.
                </p>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="font-medium mb-1">AI 분석 시작하기</h3>
                <p className="text-sm text-gray-600">
                  충분한 질문이 모이면 "AI 분석 시작" 버튼을 클릭하여 질문 유형화 및 논제 추천을 받습니다.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">토론 활동 진행하기</h3>
                <p className="text-sm text-gray-600">
                  추천된 논제와 주요 용어를 활용하여 학생들과 토론 활동을 진행합니다.
                </p>
              </div>
            </div>
          </Card>
          
          <Card title="기본 통계">
            <div className="space-y-5">
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 세션 수</p>
                  <p className="text-2xl font-bold">{loading ? "-" : sessions?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-secondary/10 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">이번 주 생성된 세션</p>
                  <p className="text-2xl font-bold">
                    {loading ? "-" : (sessions?.filter(session => {
                      if (!session || !session.createdAt) return false
                      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
                      return session.createdAt > oneWeekAgo
                    })?.length || 0)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-accent/10 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">AI 분석 완료 세션</p>
                  <p className="text-2xl font-bold">
                    {loading ? "-" : (sessions?.filter(session => session?.aiAnalysisResult)?.length || 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* AI 토론 시나리오 생성기 모달 */}
        <DebateScenarioModal 
          isOpen={isDebateScenarioModalOpen}
          onClose={() => setIsDebateScenarioModalOpen(false)}
        />

        {/* 근거자료 검색 모달 */}
        <EvidenceSearchModalContainer
          isOpen={isEvidenceSearchModalOpen}
          onClose={() => setIsEvidenceSearchModalOpen(false)}
        />
      </div>
    </RequireAuth>
  )
}

export default function TeacherDashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">로딩 중...</div>}>
      <TeacherDashboardContent />
    </Suspense>
  )
}