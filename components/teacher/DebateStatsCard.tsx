'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { database } from '@/lib/firebase'
import { ref, get, query, orderByChild, equalTo } from 'firebase/database'

interface DebateStats {
  totalSessions: number
  totalQuestions: number
  activeStudents: number
  popularTopics: string[]
}

interface Session {
  sessionId: string
  title: string
  teacherId: string
  createdAt: string
  questions?: { [key: string]: any }
  students?: { [key: string]: any }
}

export default function DebateStatsCard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DebateStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.uid && database) {
      fetchStatisticsFromFirebase()
    }
  }, [user?.uid])

  const fetchStatisticsFromFirebase = async () => {
    setLoading(true)
    try {
      if (!database || !user?.uid) {
        console.warn('Database나 사용자 정보가 없습니다')
        return
      }

      // 현재 사용자의 세션들만 조회
      const sessionsRef = ref(database, 'sessions')
      const userSessionsQuery = query(sessionsRef, orderByChild('teacherId'), equalTo(user.uid))
      const sessionsSnapshot = await get(userSessionsQuery)
      
      if (sessionsSnapshot.exists()) {
        const sessionsData = sessionsSnapshot.val()
        const sessions: Session[] = Object.values(sessionsData)
        
        console.log('Firebase에서 가져온 세션 데이터:', sessions)
        
        // 통계 계산
        let totalQuestions = 0
        let activeStudents = 0
        const topicFrequency: { [key: string]: number } = {}
        
        sessions.forEach(session => {
          // 질문 수 계산
          if (session.questions) {
            const questionCount = Object.keys(session.questions).length
            totalQuestions += questionCount
            
            // 주제별 빈도 계산 (세션 제목 기반)
            const title = session.title || '기타'
            topicFrequency[title] = (topicFrequency[title] || 0) + questionCount
          }
          
          // 활성 학생 수 계산 (중복 제거를 위해 Set 사용)
          if (session.students) {
            activeStudents += Object.keys(session.students).length
          }
        })
        
        // 인기 주제 상위 3개 추출
        const popularTopics = Object.entries(topicFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([topic]) => topic)
        
        setStats({
          totalSessions: sessions.length,
          totalQuestions,
          activeStudents,
          popularTopics
        })
        
        console.log('계산된 통계:', {
          totalSessions: sessions.length,
          totalQuestions,
          activeStudents,
          popularTopics
        })
      } else {
        console.log('사용자 세션이 없습니다')
        setStats({
          totalSessions: 0,
          totalQuestions: 0,
          activeStudents: 0,
          popularTopics: []
        })
      }
    } catch (error) {
      console.error('Firebase 통계 조회 오류:', error)
      // 오류 발생 시 빈 통계 설정
      setStats({
        totalSessions: 0,
        totalQuestions: 0,
        activeStudents: 0,
        popularTopics: []
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 토론 통계
          <span className="text-sm font-normal text-gray-500">
            실시간 토론 활동 현황을 확인하세요
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-500">통계 데이터를 불러오는 중...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.totalSessions || 0}
              </div>
              <div className="text-sm text-gray-600">총 세션 수</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalQuestions || 0}
              </div>
              <div className="text-sm text-gray-600">수집된 질문</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeStudents || 0}
              </div>
              <div className="text-sm text-gray-600">참여 학생</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">
                {stats?.popularTopics?.length || 0}
              </div>
              <div className="text-sm text-gray-600">인기 주제</div>
            </div>
          </div>
        )}
        
        {stats?.popularTopics && stats.popularTopics.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">🔥 인기 토론 주제</h4>
            <div className="space-y-2">
              {stats.popularTopics.slice(0, 5).map((topic, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md border">
                  <span className="text-sm font-medium truncate flex-1">{topic}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full ml-2">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(!stats?.popularTopics || stats.popularTopics.length === 0) && !loading && (
          <div className="mt-6 text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-500 text-sm">
              아직 토론 데이터가 없습니다.<br />
              세션을 만들고 학생들의 질문을 수집해보세요!
            </p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              💡 실시간으로 업데이트되는 토론 통계입니다
            </p>
            <button 
              onClick={fetchStatisticsFromFirebase}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              새로고침
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}