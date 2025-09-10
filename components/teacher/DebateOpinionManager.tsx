'use client'

import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { database, getFirebaseDatabase } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

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

interface DebateOpinionManagerProps {
  sessionId: string
  sessionCode: string
}

export default function DebateOpinionManager({ sessionId, sessionCode }: DebateOpinionManagerProps) {
  const [opinions, setOpinions] = useState<DebateOpinion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'group'>('newest')

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

  // 모둠 목록 추출
  const groups = Array.from(new Set(opinions.map(o => o.studentGroup))).sort()

  // 필터링 및 정렬
  const filteredAndSortedOpinions = opinions
    .filter(opinion => filter === 'all' || opinion.studentGroup === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt
        case 'oldest':
          return a.createdAt - b.createdAt
        case 'group':
          return a.studentGroup.localeCompare(b.studentGroup) || b.createdAt - a.createdAt
        default:
          return b.createdAt - a.createdAt
      }
    })

  // 통계 계산
  const totalOpinions = opinions.length
  const agreeCount = opinions.filter(o => o.position === 'agree').length
  const disagreeCount = opinions.filter(o => o.position === 'disagree').length
  const groupStats = groups.map(group => ({
    group,
    count: opinions.filter(o => o.studentGroup === group).length,
    agree: opinions.filter(o => o.studentGroup === group && o.position === 'agree').length,
    disagree: opinions.filter(o => o.studentGroup === group && o.position === 'disagree').length
  }))

  // 논제별 통계
  const agendaStats = opinions.reduce((acc, opinion) => {
    if (!acc[opinion.selectedAgenda]) {
      acc[opinion.selectedAgenda] = { agree: 0, disagree: 0 }
    }
    acc[opinion.selectedAgenda][opinion.position]++
    return acc
  }, {} as Record<string, { agree: number; disagree: number }>)

  // CSV 다운로드 함수
  const downloadCSV = () => {
    const headers = ['제출시간', '학생명', '모둠', '논제', '입장', '의견']
    const csvData = [
      headers.join(','),
      ...opinions.map(opinion => [
        new Date(opinion.createdAt).toLocaleString('ko-KR'),
        opinion.studentName,
        opinion.studentGroup,
        `"${opinion.selectedAgenda}"`,
        opinion.position === 'agree' ? '찬성' : '반대',
        `"${opinion.opinionText.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `토론의견_${sessionCode}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      {/* 전체 통계 */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-indigo-800 flex items-center gap-2">
            📊 토론 의견 현황
          </CardTitle>
          <CardDescription>
            세션 {sessionCode}의 토론 참여 현황을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-600">{totalOpinions}</div>
              <div className="text-sm text-gray-600">총 의견 수</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{agreeCount}</div>
              <div className="text-sm text-gray-600">찬성 의견</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{disagreeCount}</div>
              <div className="text-sm text-gray-600">반대 의견</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{groups.length}</div>
              <div className="text-sm text-gray-600">참여 모둠</div>
            </div>
          </div>

          {/* 모둠별 통계 */}
          <div className="mb-6">
            <h4 className="font-semibold text-indigo-800 mb-3">모둠별 참여 현황</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupStats.map(stat => (
                <div key={stat.group} className="bg-white/70 p-3 rounded-lg">
                  <div className="font-medium text-gray-800">{stat.group} 모둠</div>
                  <div className="text-sm text-gray-600 mt-1">
                    총 {stat.count}개 • 찬성 {stat.agree} • 반대 {stat.disagree}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 논제별 통계 */}
          {Object.keys(agendaStats).length > 0 && (
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">논제별 찬반 현황</h4>
              <div className="space-y-3">
                {Object.entries(agendaStats).map(([agenda, stats]) => (
                  <div key={agenda} className="bg-white/70 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-800 mb-2">{agenda}</div>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* 필터 및 정렬 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg">💬 토론 의견 목록</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                className="text-sm"
              >
                📥 CSV 다운로드
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 필터 및 정렬 옵션 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="filter" className="text-sm font-medium text-gray-700">
                모둠:
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">전체 모둠</option>
                {groups.map(group => (
                  <option key={group} value={group}>{group} 모둠</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                정렬:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="group">모둠순</option>
              </select>
            </div>
          </div>

          {/* 의견 목록 */}
          {filteredAndSortedOpinions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-gray-500 text-lg">
                {filter === 'all' ? '아직 제출된 토론 의견이 없습니다' : `${filter} 모둠의 토론 의견이 없습니다`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedOpinions.map((opinion) => (
                <div
                  key={opinion.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
                >
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        opinion.position === 'agree' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {opinion.position === 'agree' ? '👍' : '👎'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {opinion.studentName}
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

                  {/* 의견 */}
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