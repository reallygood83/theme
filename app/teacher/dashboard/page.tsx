'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import RequireAuth from '@/components/auth/RequireAuth'
import Card from '@/components/common/Card'
import SessionList from '@/components/teacher/SessionList'
import Button from '@/components/common/Button'
import { Session } from '@/lib/utils'

export default function TeacherDashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('세션 목록 조회 시작...')
      
      const response = await fetch('/api/sessions/list', {
        cache: 'no-store' // 캐시 무시하고 매번 새로 가져오기
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
      
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('세션 목록 로드 오류:', err)
      setError('세션 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return (
    <RequireAuth>
      <Header />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">교사 대시보드</h1>
            <p className="text-gray-600">
              토론 세션을 생성하고 관리할 수 있습니다.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link href="/teacher/session/create">
              <Button variant="primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                새 토론 세션 만들기
              </Button>
            </Link>
          </div>
        </div>
        
        <Card title="내 토론 세션">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              총 {sessions.length}개의 세션
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
            loading={loading} 
            error={error} 
          />
        </Card>
        
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
          
          <Card title="통계">
            <div className="space-y-5">
              <div className="flex items-center">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">총 세션 수</p>
                  <p className="text-2xl font-bold">{loading ? "-" : sessions.length}</p>
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
                    {loading ? "-" : sessions.filter(session => {
                      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
                      return session.createdAt > oneWeekAgo
                    }).length}
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
                    {loading ? "-" : sessions.filter(session => session.aiAnalysisResult).length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}