'use client'

import { useState, useEffect } from 'react'
import { ref, onValue, Database } from 'firebase/database'
import { database, getFirebaseDatabase } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface DebateOpinion {
  id: string
  sessionId: string
  sessionCode: string
  studentName: string
  studentGroup: string
  selectedAgenda: string
  position: 'agree' | 'disagree'
  opinionText: string
  createdAt: number
  timestamp: string
}

interface DebateOpinionListProps {
  sessionId: string
  sessionCode: string
  currentStudentName: string
  currentStudentGroup: string
}

export default function DebateOpinionList({ 
  sessionId, 
  sessionCode, 
  currentStudentName, 
  currentStudentGroup 
}: DebateOpinionListProps) {
  const [opinions, setOpinions] = useState<DebateOpinion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'my-group' | 'my-opinions'>('all')

  useEffect(() => {
    const db = getFirebaseDatabase()
    if (!db) {
      console.error('Firebase 데이터베이스 연결 실패')
      setLoading(false)
      return
    }

    const opinionsRef = ref(db, `sessions/${sessionId}/debateOpinions`)
    
    const unsubscribe = onValue(opinionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const opinionsData = snapshot.val()
        const opinionsList = Object.entries(opinionsData).map(([key, value]) => ({
          id: key,
          ...(value as Omit<DebateOpinion, 'id'>)
        }))
        
        // 최신순으로 정렬
        opinionsList.sort((a, b) => b.createdAt - a.createdAt)
        setOpinions(opinionsList)
      } else {
        setOpinions([])
      }
      setLoading(false)
    }, (error) => {
      console.error('토론 의견 조회 오류:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [sessionId])

  // 필터링된 의견 목록
  const filteredOpinions = opinions.filter(opinion => {
    switch (filter) {
      case 'my-group':
        return opinion.studentGroup === currentStudentGroup
      case 'my-opinions':
        return opinion.studentName === currentStudentName
      default:
        return true
    }
  })

  // 논제별 통계
  const agendaStats = opinions.reduce((acc, opinion) => {
    if (!acc[opinion.selectedAgenda]) {
      acc[opinion.selectedAgenda] = { agree: 0, disagree: 0 }
    }
    acc[opinion.selectedAgenda][opinion.position]++
    return acc
  }, {} as Record<string, { agree: number; disagree: number }>)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">토론 의견을 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 필터 및 통계 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            📊 토론 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 필터 버튼 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              전체 의견 ({opinions.length})
            </button>
            <button
              onClick={() => setFilter('my-group')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'my-group'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              우리 모둠 ({opinions.filter(o => o.studentGroup === currentStudentGroup).length})
            </button>
            <button
              onClick={() => setFilter('my-opinions')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'my-opinions'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              내 의견 ({opinions.filter(o => o.studentName === currentStudentName).length})
            </button>
          </div>

          {/* 논제별 통계 */}
          {Object.keys(agendaStats).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">논제별 찬반 현황</h4>
              {Object.entries(agendaStats).map(([agenda, stats]) => (
                <div key={agenda} className="bg-white/70 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-800 mb-2 truncate">{agenda}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">👍</span>
                      <span className="text-sm text-green-700 font-medium">찬성 {stats.agree}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">👎</span>
                      <span className="text-sm text-red-700 font-medium">반대 {stats.disagree}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 의견 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            💬 토론 의견 목록
          </CardTitle>
          <CardDescription>
            {filter === 'all' && '모든 학생들의 토론 의견'}
            {filter === 'my-group' && `${currentStudentGroup} 모둠의 토론 의견`}
            {filter === 'my-opinions' && '내가 제출한 토론 의견'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOpinions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-gray-500 text-lg">
                {filter === 'my-opinions' ? '아직 제출한 의견이 없습니다' : '아직 제출된 의견이 없습니다'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                토론 의견을 작성해서 다른 친구들과 생각을 나누어보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOpinions.map((opinion) => (
                <div
                  key={opinion.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    opinion.studentName === currentStudentName
                      ? 'border-emerald-200 bg-emerald-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* 헤더 정보 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        opinion.position === 'agree' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {opinion.position === 'agree' ? '👍' : '👎'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            {opinion.studentName}
                          </span>
                          {opinion.studentName === currentStudentName && (
                            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                              내 의견
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {opinion.studentGroup} 모둠 • {new Date(opinion.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      opinion.position === 'agree'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {opinion.position === 'agree' ? '찬성' : '반대'}
                    </div>
                  </div>

                  {/* 논제 */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">논제</div>
                    <div className="text-sm font-medium text-gray-800">{opinion.selectedAgenda}</div>
                  </div>

                  {/* 의견 내용 */}
                  <div className="text-gray-800 leading-relaxed">
                    <div className="text-xs text-gray-500 mb-2">의견 및 근거</div>
                    <p className="whitespace-pre-wrap">{opinion.opinionText}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}