'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import RequireAuth from '@/components/auth/RequireAuth'
import Breadcrumb from '@/components/common/Breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SessionList from '@/components/teacher/SessionList'
import SharedTopicsLibrary from '@/components/teacher/SharedTopicsLibrary'
import SharedSessionsLibrary from '@/components/teacher/SharedSessionsLibrary'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DebateScenarioGenerator from '@/components/teacher/DebateScenarioGenerator'
import EvidenceSearchModalContainer from '@/components/evidence/EvidenceSearchModalContainer'
import DebateStatsCard from '@/components/teacher/DebateStatsCard'
import NotificationCenter from '@/components/teacher/NotificationCenter'
import { Session } from '@/lib/utils'
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

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('세션 목록 조회 시작...')
      
      // 현재 사용자의 ID 가져오기
      const currentUserId = getCurrentUserId()
      if (!currentUserId) {
        console.log('사용자 ID가 없어서 세션 조회 중단')
        setSessions([])
        setLoading(false)
        return
      }
      
      console.log('API로 전송할 teacherId:', currentUserId)
      
      const response = await fetch(`/api/sessions/list?teacherId=${encodeURIComponent(currentUserId)}`, {
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
      // 에러 발생 시에도 빈 배열로 설정하여 UI가 정상 동작하도록 함
      setSessions([])
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
    
    // 보안을 위해 API 호출로만 세션 데이터 가져오기
    console.log('보안 강화된 API 호출로 세션 목록 조회 중... 교사 ID:', getCurrentUserId())
    fetchSessions()
    
    // 실시간 업데이트를 위한 주기적 갱신 (선택사항)
    const intervalId = setInterval(() => {
      if (user && getCurrentUserId()) {
        fetchSessions()
      }
    }, 30000) // 30초마다 갱신
    
    return () => {
      console.log('주기적 갱신 해제')
      clearInterval(intervalId)
    }
  }, [user, authLoading])

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
          {(!isJudgeMode || isAdmin) && (
            <div className="space-y-8 mb-8">
              {/* Hero CTA - 주요 액션 강조 */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">🚀 새로운 토론 세션 시작하기</h2>
                  <p className="text-purple-600 text-lg">{isAdmin ? '관리자 권한으로 토론 세션을 생성하고 관리하세요!' : '학습 자료와 함께 재미있는 토론을 만들어보세요!'}</p>
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
                  <p className="text-gray-600">{isAdmin ? '관리자용 AI 도구와 관리 기능을 활용해보세요' : 'AI 도구와 관리 기능을 활용해보세요'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        
        <Tabs defaultValue="my-sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-slate-100 rounded-xl p-1">
            <TabsTrigger value="my-sessions" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">{isAdmin ? "관리 중인 세션" : isJudgeMode ? "교사의 세션" : "내 세션"}</span>
            </TabsTrigger>
            <TabsTrigger value="shared-sessions" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 relative">
              <div className="flex items-center gap-2 relative">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">토론 세션 공유</span>
                <div className="absolute -top-1 -right-2 w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="shared-topics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-medium">토론 주제 공유</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-sessions" className="mt-6">
            <Card className="border-2 border-purple-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-purple-900 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      {isAdmin ? "관리 중인 토론 세션" : isJudgeMode ? "교사의 토론 세션" : "내 토론 세션"}
                    </CardTitle>
                    <CardDescription className="text-purple-700 mt-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      총 {sessions?.length || 0}개의 세션 · 언제든지 새로운 세션을 만들어 보세요!
                    </CardDescription>
                  </div>
                  <Button
                    onClick={fetchSessions}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    새로고침
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Safe session list render */}
                {Array.isArray(sessions) ? (
                  <SessionList
                    sessions={sessions}
                    loading={loading || authLoading}
                    error={error}
                    onRefresh={fetchSessions}
                  />
                ) : (
                  <div className="text-center py-8">
                    <LoadingSpinner size="sm" />
                    <p className="text-sm text-gray-500 mt-2">세션 데이터를 준비 중입니다...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shared-sessions" className="mt-6 space-y-6">
            {/* 세션 공유 섹션 헤더 */}
            <Card className="border-2 border-blue-100 shadow-lg bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50">
              <CardHeader className="text-center py-8">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                  📚 토론 세션 공유 라이브러리
                </CardTitle>
                <CardDescription className="text-blue-700 text-lg max-w-2xl mx-auto">
                  다른 교사들이 만든 우수한 토론 세션을 탐색하고, 클릭 한 번으로 내 세션으로 가져와 보세요!
                  검증된 학습 자료와 효과적인 토론 주제를 즉시 활용할 수 있습니다.
                </CardDescription>
                
                {/* 공유 기능 하이라이트 */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-blue-200 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-900 mb-1">🔍 탐색</h3>
                    <p className="text-sm text-blue-700">카테고리별로 세션을 찾아보세요</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-blue-200 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-1">👀 미리보기</h3>
                    <p className="text-sm text-green-700">자료를 미리 확인하고 선택하세요</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-blue-200 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-1">💜 가져오기</h3>
                    <p className="text-sm text-purple-700">원클릭으로 내 세션에 추가하세요</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* 공유 세션 라이브러리 */}
            <SharedSessionsLibrary />
          </TabsContent>
          
          <TabsContent value="shared-topics" className="mt-6 space-y-6">
            {/* 토론 주제 공유 섹션 헤더 */}
            <Card className="border-2 border-orange-100 shadow-lg bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50">
              <CardHeader className="text-center py-8">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3">
                  💡 AI 토론 주제 공유 라이브러리
                </CardTitle>
                <CardDescription className="text-orange-700 text-lg max-w-2xl mx-auto">
                  AI가 생성한 창의적이고 교육적인 토론 주제들을 발견하고 활용해보세요!
                  다양한 주제로 학생들의 사고력을 키워주는 토론을 시작할 수 있습니다.
                </CardDescription>
                
                {/* AI 주제 특징 하이라이트 */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-orange-200 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-orange-900 mb-1">🤖 AI 생성</h3>
                    <p className="text-sm text-orange-700">창의적이고 교육적인 주제들</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-orange-200 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-yellow-900 mb-1">✅ 검증된 품질</h3>
                    <p className="text-sm text-yellow-700">교육 현장에서 검증된 주제들</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-orange-200 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-red-900 mb-1">⚡ 즉시 활용</h3>
                    <p className="text-sm text-red-700">바로 수업에 적용 가능</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* 토론 주제 라이브러리 */}
            <SharedTopicsLibrary />
          </TabsContent>
        </Tabs>
        
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
        {isDebateScenarioModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">🎯 AI 토론 시나리오 생성기</h2>
                    <p className="text-sm text-gray-600">학생들의 사고력 향상을 위한 전문적인 토론 시나리오를 생성해보세요</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDebateScenarioModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* 생성기 콘텐츠 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <DebateScenarioGenerator />
              </div>
            </div>
          </div>
        )}

        {/* 근거자료 검색 모달 */}
        <EvidenceSearchModalContainer
          isOpen={isEvidenceSearchModalOpen}
          onClose={() => setIsEvidenceSearchModalOpen(false)}
        />
        </div>
      </div>
      
      {/* 플로팅 액션 버튼 - 데스크톱용 */}
      <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col gap-4">
          {/* 토론 시나리오 생성기 (Primary FAB) */}
          <Button
            onClick={() => setIsDebateScenarioModalOpen(true)}
            className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl hover:shadow-blue-500/25 rounded-full p-4 transition-all duration-300 transform hover:scale-110"
            aria-label="AI 토론 시나리오 생성"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              🎯 AI 토론 시나리오 생성
            </span>
          </Button>

          {/* 근거자료 검색 */}
          <Button
            onClick={() => setIsEvidenceSearchModalOpen(true)}
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

          {/* 빠른 세션 생성 */}
          <Link href="/teacher/session/create">
            <Button
              className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl hover:shadow-green-500/25 rounded-full p-3 transition-all duration-300 transform hover:scale-110"
              aria-label="빠른 세션 생성"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                ⚡ 빠른 세션 생성
              </span>
            </Button>
          </Link>

          {/* 맨 위로 */}
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-2xl hover:shadow-gray-500/25 rounded-full p-3 transition-all duration-300 transform hover:scale-110"
            aria-label="맨 위로"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              ⬆️ 맨 위로
            </span>
          </Button>
        </div>
      </div>
      
      {/* 플로팅 버튼 - 모바일용 (주요 기능 2개만) */}
      <div className="lg:hidden fixed bottom-6 right-4 z-40">
        <div className="flex flex-col gap-3">
          {/* 토론 시나리오 생성기 - 모바일 */}
          <Button
            onClick={() => setIsDebateScenarioModalOpen(true)}
            className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-2xl rounded-full p-3 transition-all duration-300 transform hover:scale-110"
            aria-label="AI 토론 시나리오 생성"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
              AI
            </span>
          </Button>
          
          {/* 근거자료 검색 - 모바일 */}
          <Button
            onClick={() => setIsEvidenceSearchModalOpen(true)}
            className="group relative bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-2xl rounded-full p-3 transition-all duration-300 transform hover:scale-110"
            aria-label="AI 근거자료 검색"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Button>
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