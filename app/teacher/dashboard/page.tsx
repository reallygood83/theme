'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import RequireAuth from '@/components/auth/RequireAuth'
import Breadcrumb from '@/components/common/Breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SessionList from '@/components/teacher/SessionList'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DebateScenarioModal from '@/components/teacher/DebateScenarioModal'
import EvidenceSearchModalContainer from '@/components/evidence/EvidenceSearchModalContainer'
import DebateStatsCard from '@/components/teacher/DebateStatsCard'
import { Session } from '@/lib/utils'
import { database } from '@/lib/firebase'
import { ref, onValue, off } from 'firebase/database'
import { useAuth } from '@/contexts/AuthContext'

function TeacherDashboardContent() {
  const { user, loading: authLoading, getCurrentUserId, isAdminAccount } = useAuth()
  const searchParams = useSearchParams()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDebateScenarioModalOpen, setIsDebateScenarioModalOpen] = useState(false)
  const [isEvidenceSearchModalOpen, setIsEvidenceSearchModalOpen] = useState(false)
  
  // 관리자 모드 확인 (기존 심사위원 모드와 새로운 관리자 계정 모드 모두 지원)
  const viewAsUid = searchParams.get('viewAs')
  const isJudgeMode = !!viewAsUid
  const isAdmin = isAdminAccount()
  const effectiveUserId = viewAsUid || getCurrentUserId()

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
      
      // Ensure sessions is always an array
      setSessions(Array.isArray(data.sessions) ? data.sessions : [])
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
        // Ensure sessionsData exists and is object
        if (!sessionsData || typeof sessionsData !== 'object') {
          console.log('Invalid sessionsData, setting empty array')
          setSessions([])
          setLoading(false)
          return
        }
        
        const sessionsArray = Object.entries(sessionsData).map(([sessionId, data]) => ({
          sessionId,
          ...(data as any)
        })).filter(session => session && session.sessionId) // Filter invalid entries
        
        // 현재 로그인한 교사의 세션만 필터링 (심사위원 모드 시 특정 UID 필터링)
        const mySessionsArray = sessionsArray.filter(session => {
          if (!session) return false
          return session.teacherId === effectiveUserId || (!session.teacherId && !isJudgeMode)
        })
        
        console.log('전체 세션:', sessionsArray.length, '개')
        console.log('내 세션:', mySessionsArray.length, '개')
        console.log('내 세션 ID 목록:', mySessionsArray.map((s: Session) => s?.sessionId || 'unknown'))
        
        // Ensure mySessionsArray is always an array
        setSessions(Array.isArray(mySessionsArray) ? mySessionsArray : [])
        setError(null)
        
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
        // Ensure empty state is array
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
      <div className="max-container mx-auto px-4 py-6">
        {/* 브레드크럼 네비게이션 */}
        <Breadcrumb 
          items={[
            { label: '교사용', href: '/teacher/dashboard' },
            { label: '대시보드' }
          ]}
          className="mb-6"
        />

        <div className="space-y-8">
        {(isJudgeMode || isAdmin) && (
          <div className={`${isAdmin ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
            <div className="flex items-center">
              <svg className={`w-6 h-6 ${isAdmin ? 'text-purple-600' : 'text-blue-600'} mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAdmin ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
              <div>
                <h3 className={`font-semibold ${isAdmin ? 'text-purple-800' : 'text-blue-800'}`}>
                  {isAdmin ? '🔒 관리자 모드' : '심사위원 모드'}
                </h3>
                <p className={`text-sm ${isAdmin ? 'text-purple-700' : 'text-blue-700'}`}>
                  {isAdmin 
                    ? '관리자 계정으로 로그인하여 기존 교사 계정의 데이터에 접근하고 있습니다.'
                    : `공모전 심사를 위해 특정 교사 계정의 대시보드를 열람하고 있습니다. (UID: ${viewAsUid})`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white mx-auto mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="gradient-card text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              {isAdmin ? '🔒 관리자 대시보드' : isJudgeMode ? '🏆 심사용 교사 대시보드' : '👩‍🏫 교사 대시보드'}
            </h1>
            <p className="gradient-card text-lg text-gray-700 max-w-2xl mx-auto">
              {isAdmin
                ? '🔒 관리자 권한으로 기존 교사 계정의 토론 세션들을 관리할 수 있습니다.'
                : isJudgeMode 
                  ? '🔍 이 교사가 생성한 토론 세션들을 확인할 수 있습니다.' 
                  : '✨ 재미있고 의미 있는 토론 교육을 위한 모든 기능을 한 곳에서 이용하세요!'
              }
            </p>
          </div>

          {/* 효율적인 기능 섹션 */}
          {!isJudgeMode && !isAdmin && (
            <div className="space-y-8 mb-8">
              {/* Hero CTA - 주요 액션 강조 */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">🚀 새로운 토론 세션 시작하기</h2>
                  <p className="text-purple-600 text-lg">학습 자료와 함께 재미있는 토론을 만들어보세요!</p>
                </div>
                <div className="flex justify-center">
                  <Link href="/teacher/session/create">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      📝 새 토론 세션 만들기
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Actions - AI 도구 및 관리 기능 */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">🛠️ 토론 지원 도구</h3>
                  <p className="text-gray-600">AI 도구와 관리 기능을 활용해보세요</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* AI 토론 시나리오 생성기 - 컴팩트 카드 */}
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50" onClick={() => setIsDebateScenarioModalOpen(true)}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-full mr-4 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">🤖 AI 시나리오 생성</h4>
                          <p className="text-sm text-blue-600">교육용 토론 주제 자동 생성</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 근거자료 검색 - 컴팩트 카드 */}
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" onClick={() => setIsEvidenceSearchModalOpen(true)}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-full mr-4 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-800">🔍 근거자료 검색</h4>
                          <p className="text-sm text-green-600">신뢰할 수 있는 자료 검색</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 토론 의견 관리 - 컴팩트 카드 */}
                  <Link href="/teacher/debate" className="block">
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-3 rounded-full mr-4 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-orange-800">💬 토론 의견 관리</h4>
                            <p className="text-sm text-orange-600">학생 의견 확인 및 피드백</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  📋 {isAdmin ? "관리 중인 토론 세션" : isJudgeMode ? "교사의 토론 세션" : "내 토론 세션"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  총 {sessions?.length || 0}개의 세션이 있어요
                </CardDescription>
              </div>
              <Button
                onClick={fetchSessions}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Safe session list render */}
            {Array.isArray(sessions) ? (
              <SessionList
                sessions={sessions}
                loading={loading || authLoading}
                error={error}
                onRefresh={fetchSessions}
              />
            ) : (
              <div className="text-center py-4">
                <LoadingSpinner size="sm" />
                <p className="text-sm text-gray-500 mt-2">세션 데이터를 준비 중입니다...</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 통계 대시보드 */}
        {!isJudgeMode && !isAdmin && (
          <div className="mt-8">
            <DebateStatsCard />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🎯</span> 퀵 가이드
              </CardTitle>
              <CardDescription>
                토론 세션 운영의 4단계를 따라해보세요!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold mb-2 text-purple-800 flex items-center gap-2">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    세션 생성하기
                  </h3>
                  <p className="text-sm text-purple-700">
                    📝 "새 토론 세션 만들기" 버튼으로 학습 자료와 키워드를 입력해주세요.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    세션 코드 공유하기
                  </h3>
                  <p className="text-sm text-blue-700">
                    🔗 생성된 세션 코드를 학생들에게 공유하여 참여를 유도해보세요.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold mb-2 text-green-800 flex items-center gap-2">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    AI 분석 시작하기
                  </h3>
                  <p className="text-sm text-green-700">
                    🤖 충분한 질문이 모이면 "AI 분석 시작"으로 논제를 추천받으세요.
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold mb-2 text-orange-800 flex items-center gap-2">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                    토론 활동 진행하기
                  </h3>
                  <p className="text-sm text-orange-700">
                    🎭 추천된 논제로 학생들과 재미있는 토론을 시작해보세요!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">📊</span> 기본 통계
              </CardTitle>
              <CardDescription>
                한눈에 보는 나의 토론 세션 현황
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex items-center bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 mr-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700 font-medium">📋 총 세션 수</p>
                    <p className="text-3xl font-bold text-purple-800">{loading ? "-" : (Array.isArray(sessions) ? sessions.length : 0)}</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full p-3 mr-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">📅 이번 주 생성된 세션</p>
                    <p className="text-3xl font-bold text-blue-800">
                      {loading ? "-" : (sessions?.filter(session => {
                        if (!session || !session.createdAt) return false
                        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
                        return session.createdAt > oneWeekAgo
                      })?.length || 0)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-3 mr-4 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">🤖 AI 분석 완료 세션</p>
                    <p className="text-3xl font-bold text-green-800">
                      {loading ? "-" : (Array.isArray(sessions) ? sessions.filter(session => session?.aiAnalysisResult).length : 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
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