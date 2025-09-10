'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { FirebaseRealtimeSharedSession } from '@/lib/firebase/realtime-services'

interface SharedSessionsListProps {
  className?: string
}

export default function SharedSessionsList({ className }: SharedSessionsListProps) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<FirebaseRealtimeSharedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const ITEMS_PER_PAGE = 12

  const fetchSessions = async (reset = false) => {
    try {
      setLoading(true)
      const offset = reset ? 0 : currentPage * ITEMS_PER_PAGE
      
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: offset.toString()
      })
      
      if (selectedGrade) params.append('grade', selectedGrade)
      if (searchKeyword) params.append('keyword', searchKeyword)
      
      const response = await fetch(`/api/shared-sessions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        if (reset) {
          setSessions(data.data)
          setCurrentPage(0)
        } else {
          setSessions(prev => [...prev, ...data.data])
        }
        setHasMore(data.data.length === ITEMS_PER_PAGE)
      }
    } catch (error) {
      console.error('공유 세션 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopySession = async (sessionId: string) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      setCopying(sessionId)
      const response = await fetch('/api/shared-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          userId: user.uid
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('세션이 성공적으로 복사되었습니다!')
        // 복사 카운트 업데이트를 위해 목록 새로고침
        fetchSessions(true)
      } else {
        alert(data.error || '세션 복사에 실패했습니다.')
      }
    } catch (error) {
      console.error('세션 복사 실패:', error)
      alert('세션 복사에 실패했습니다.')
    } finally {
      setCopying(null)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchSessions(true)
  }

  const loadMore = () => {
    setCurrentPage(prev => prev + 1)
    fetchSessions(false)
  }

  useEffect(() => {
    fetchSessions(true)
  }, [])

  return (
    <div className={className}>
      {/* 검색 및 필터 */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="세션 제목이나 키워드로 검색..."
            value={searchKeyword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchKeyword(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <select 
            value={selectedGrade} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md w-32"
          >
            <option value="">전체</option>
            <option value="초등">초등</option>
            <option value="중등">중등</option>
            <option value="고등">고등</option>
          </select>
          <Button onClick={handleSearch}>검색</Button>
        </div>
      </div>

      {/* 세션 목록 */}
      {loading && sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">공유 세션을 불러오는 중...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">공유된 세션이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
                    <Badge variant="secondary">{session.category || '일반'}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {session.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {session.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {session.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{session.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>by {session.teacherName}</span>
                      <span>복사 {session.copyCount || 0}회</span>
                    </div>
                    
                    <Button
                      onClick={() => handleCopySession(session.id!)}
                      disabled={copying === session.id}
                      className="w-full"
                      variant="outline"
                    >
                      {copying === session.id ? '복사 중...' : '내 계정으로 복사'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 더 보기 버튼 */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                disabled={loading}
                variant="outline"
              >
                {loading ? '로딩 중...' : '더 보기'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}