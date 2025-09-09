'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorAlert from '@/components/common/ErrorAlert'

interface StatisticsData {
  totalOpinions: number
  pendingOpinions: number
  feedbackGiven: number
  reviewedOpinions: number
  averageResponseTime: number
  topStudents: Array<{
    name: string
    class: string
    opinionCount: number
    avgLength: number
  }>
  topicDistribution: Array<{
    category: string
    count: number
    percentage: number
  }>
  dailyStats: Array<{
    date: string
    opinions: number
    feedbacks: number
  }>
  monthlyTrends: Array<{
    month: string
    opinions: number
    students: number
    engagement: number
  }>
  wordCloudData: Array<{
    word: string
    frequency: number
    sentiment: 'positive' | 'neutral' | 'negative'
  }>
}

interface DebateStatisticsProps {
  teacherId?: string
  classId?: string
  dateRange?: {
    start: string
    end: string
  }
}

export default function DebateStatistics({ teacherId, classId, dateRange }: DebateStatisticsProps) {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStatistics()
  }, [teacherId, classId, selectedPeriod, dateRange])

  const fetchStatistics = async () => {
    if (!refreshing) setLoading(true)
    setError(null)

    try {
      // API가 마이그레이션되어 임시로 비활성화
      // const params = new URLSearchParams()
      // if (teacherId) params.append('teacherId', teacherId)
      // if (classId) params.append('classId', classId)
      // params.append('period', selectedPeriod)
      // if (dateRange?.start) params.append('startDate', dateRange.start)
      // if (dateRange?.end) params.append('endDate', dateRange.end)

      // const response = await fetch(`/api/debate/statistics?${params.toString()}`)
      // const data = await response.json()

      // 임시로 빈 통계 데이터 설정
      setStatistics({
        totalOpinions: 0,
        pendingOpinions: 0,
        feedbackGiven: 0,
        reviewedOpinions: 0,
        averageResponseTime: 0,
        topStudents: [],
        topicDistribution: [],
        dailyStats: [],
        monthlyTrends: [],
        wordCloudData: []
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setError('통계를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStatistics()
  }

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(1)}%`
  }

  if (loading) {
    return <LoadingSpinner message="통계를 불러오는 중..." className="py-12" />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorAlert error={error} onClose={() => setError(null)} />
        <div className="text-center py-8">
          <button
            onClick={() => fetchStatistics()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">통계 데이터를 찾을 수 없습니다.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">토론 통계</h2>
          <p className="text-gray-600">토론 활동 현황과 분석 데이터입니다.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 3개월</option>
            <option value="all">전체 기간</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {refreshing ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 의견 수</p>
              <p className="text-3xl font-bold text-gray-900">{statistics.totalOpinions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📝
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500">
              <span>대기: {statistics.pendingOpinions}</span>
              <span>완료: {statistics.feedbackGiven}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: formatPercentage(statistics.feedbackGiven, statistics.totalOpinions) 
                }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 응답 시간</p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.averageResponseTime > 0 
                  ? `${Math.round(statistics.averageResponseTime)}시간` 
                  : '-'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ⏱️
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              피드백 제공까지의 평균 시간
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활발한 학생</p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.topStudents.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              2개 이상 의견 제출한 학생 수
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">참여율</p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.monthlyTrends.length > 0 
                  ? `${Math.round(statistics.monthlyTrends[statistics.monthlyTrends.length - 1].engagement)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              📈
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              최근 한 달 학생 참여율
            </div>
          </div>
        </Card>
      </div>

      {/* 상위 참여 학생 */}
      {statistics.topStudents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">활발한 참여 학생 TOP 5</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">순위</th>
                  <th className="text-left py-2 font-medium text-gray-600">학생명</th>
                  <th className="text-left py-2 font-medium text-gray-600">학급</th>
                  <th className="text-left py-2 font-medium text-gray-600">의견 수</th>
                  <th className="text-left py-2 font-medium text-gray-600">평균 글자 수</th>
                </tr>
              </thead>
              <tbody>
                {statistics.topStudents.slice(0, 5).map((student, index) => (
                  <tr key={`${student.name}-${student.class}`} className="border-b border-gray-100">
                    <td className="py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{student.name}</td>
                    <td className="py-3 text-gray-600">{student.class}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {student.opinionCount}개
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{Math.round(student.avgLength)}자</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 주제 분포 */}
      {statistics.topicDistribution.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">토론 주제 분포</h3>
          <div className="space-y-3">
            {statistics.topicDistribution.map((topic, index) => (
              <div key={topic.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index % 4 === 0 ? 'bg-blue-500' :
                    index % 4 === 1 ? 'bg-green-500' :
                    index % 4 === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{topic.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index % 4 === 0 ? 'bg-blue-500' :
                        index % 4 === 1 ? 'bg-green-500' :
                        index % 4 === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${topic.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {topic.count}개
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 일별 활동 현황 */}
      {statistics.dailyStats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 활동 현황 (최근 7일)</h3>
          <div className="overflow-x-auto">
            <div className="flex items-end justify-between space-x-2 h-40">
              {statistics.dailyStats.slice(-7).map((stat, index) => {
                const maxValue = Math.max(...statistics.dailyStats.map(s => s.opinions))
                const height = maxValue > 0 ? (stat.opinions / maxValue) * 100 : 0
                
                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center">
                    <div className="flex flex-col items-center space-y-1 mb-2">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ 
                          height: `${height}%`,
                          minHeight: stat.opinions > 0 ? '4px' : '0px'
                        }}
                        title={`${stat.opinions}개 의견`}
                      ></div>
                      <div 
                        className="w-full bg-green-500 rounded-b"
                        style={{ 
                          height: `${maxValue > 0 ? (stat.feedbacks / maxValue) * 100 : 0}%`,
                          minHeight: stat.feedbacks > 0 ? '4px' : '0px'
                        }}
                        title={`${stat.feedbacks}개 피드백`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      <div>{new Date(stat.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</div>
                      <div className="text-gray-400">{stat.opinions}개</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>의견 제출</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>피드백 제공</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 월별 트렌드 */}
      {statistics.monthlyTrends.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 참여 트렌드</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">월</th>
                  <th className="text-left py-2 font-medium text-gray-600">의견 수</th>
                  <th className="text-left py-2 font-medium text-gray-600">참여 학생</th>
                  <th className="text-left py-2 font-medium text-gray-600">참여율</th>
                </tr>
              </thead>
              <tbody>
                {statistics.monthlyTrends.map((trend, index) => (
                  <tr key={trend.month} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{trend.month}</td>
                    <td className="py-3">{trend.opinions}개</td>
                    <td className="py-3">{trend.students}명</td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${trend.engagement}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{Math.round(trend.engagement)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 키워드 분석 */}
      {statistics.wordCloudData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">자주 언급되는 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {statistics.wordCloudData.slice(0, 20).map((word, index) => {
              const size = Math.max(12, Math.min(24, 12 + (word.frequency / 10)))
              return (
                <span 
                  key={word.word}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    word.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    word.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-700'
                  }`}
                  style={{ fontSize: `${size}px` }}
                  title={`${word.frequency}회 언급`}
                >
                  {word.word}
                </span>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}