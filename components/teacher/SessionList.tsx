'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Session } from '@/lib/utils'
import Button from '../common/Button'

interface SessionListProps {
  sessions: Session[]
  loading: boolean
  error: string | null
}

export default function SessionList({ sessions, loading, error }: SessionListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'questions'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [duplicatingSessionId, setDuplicatingSessionId] = useState<string | null>(null)
  
  // 검색 및 정렬된 세션 목록
  const filteredAndSortedSessions = [...sessions]
    // 검색어로 필터링
    .filter(session => {
      if (!searchTerm) return true
      
      // 키워드가 포함된 경우
      const keywordsMatch = session.keywords?.some(
        keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      // 학습 자료 텍스트가 포함된 경우
      const textMatch = session.materialText?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // 세션 코드가 포함된 경우
      const codeMatch = session.accessCode?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return keywordsMatch || textMatch || codeMatch
    })
    // 정렬
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? a.createdAt - b.createdAt 
          : b.createdAt - a.createdAt
      } else { // questions
        const aQuestions = Object.keys(a.questions || {}).length
        const bQuestions = Object.keys(b.questions || {}).length
        return sortOrder === 'asc' 
          ? aQuestions - bQuestions 
          : bQuestions - aQuestions
      }
    })
  
  // 날짜 형식화 함수
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // 정렬 순서 토글 함수
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }
  
  // 정렬 기준 변경 함수
  const handleChangeSortBy = (newSortBy: 'date' | 'questions') => {
    if (sortBy === newSortBy) {
      toggleSortOrder()
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }
  
  // 세션 복제 함수
  const handleDuplicateSession = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (duplicatingSessionId) return
    
    try {
      setDuplicatingSessionId(sessionId)
      
      const response = await fetch('/api/sessions/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      
      if (!response.ok) {
        throw new Error('세션 복제에 실패했습니다.')
      }
      
      const { success, sessionId: newSessionId, sessionCode } = await response.json()
      
      if (success) {
        // 새로 생성된 세션 페이지로 이동
        router.push(`/teacher/session/${newSessionId}?code=${sessionCode}`)
      }
    } catch (error) {
      console.error('세션 복제 오류:', error)
      alert('세션 복제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setDuplicatingSessionId(null)
    }
  }
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-gray-500 mt-2">페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
      </div>
    )
  }
  
  if (sessions.length === 0) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-gray-500 mb-4">아직 생성된 세션이 없습니다.</p>
        <Link href="/teacher/session/create">
          <span className="text-primary hover:underline font-medium">
            첫 토론 세션 만들기
          </span>
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        {/* 검색 */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="세션 검색 (키워드, 학습 자료 등)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* 정렬 옵션 */}
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded-lg border ${
              sortBy === 'date' 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'border-gray-300 text-gray-700'
            } flex items-center`}
            onClick={() => handleChangeSortBy('date')}
          >
            <span>날짜순</span>
            {sortBy === 'date' && (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${sortOrder === 'desc' ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          
          <button
            className={`px-3 py-2 rounded-lg border ${
              sortBy === 'questions' 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'border-gray-300 text-gray-700'
            } flex items-center`}
            onClick={() => handleChangeSortBy('questions')}
          >
            <span>질문 수</span>
            {sortBy === 'questions' && (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${sortOrder === 'desc' ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {filteredAndSortedSessions.length > 0 ? (
        <ul className="space-y-4">
          {filteredAndSortedSessions.map((session) => {
            const questionCount = Object.keys(session.questions || {}).length
            const hasAnalysisResult = !!session.aiAnalysisResult
            
            return (
              <li key={session.sessionId} className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors">
                <div className="relative">
                  <Link href={`/teacher/session/${session.sessionId}?code=${session.accessCode}`}>
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {session.accessCode}
                          </span>
                          {hasAnalysisResult && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              분석 완료
                            </span>
                          )}
                          {session.isDuplicated && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              복제됨
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        {session.materialText ? (
                          <p className="text-gray-700 line-clamp-2">{session.materialText}</p>
                        ) : session.materialUrl ? (
                          <p className="text-gray-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            유튜브 영상 학습 자료
                          </p>
                        ) : (
                          <p className="text-gray-500 italic">학습 자료 없음</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {session.keywords?.map((keyword, index) => (
                            <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span className="text-sm">
                            {questionCount}개 질문
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* 세션 액션 버튼 */}
                  <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
                    <button
                      className={`p-2 bg-white rounded-full shadow hover:bg-gray-50 ${duplicatingSessionId === session.sessionId ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={(e) => handleDuplicateSession(session.sessionId, e)}
                      title="세션 복제"
                    >
                      {duplicatingSessionId === session.sessionId ? (
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  )
}