'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SharedTopic, PaginationParams, PaginatedResult } from '@/lib/shared-db'
import { BookOpen, Clock, Users, Star, Eye, Search, Filter } from 'lucide-react'

interface SharedTopicsLibraryProps {
  onTopicSelect?: (topic: SharedTopic) => void
}

interface TopicDetailModalProps {
  topic: SharedTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

interface ImportTopicDialogProps {
  topic: SharedTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

function TopicDetailModal({ topic, isOpen, onClose, onImportSuccess }: TopicDetailModalProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);

  if (!topic) return null;

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-green-100 text-green-800'
      case '중급': return 'bg-yellow-100 text-yellow-800'
      case '고급': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDebateTypeBadgeColor = (type: string) => {
    switch (type) {
      case '찬반': return 'bg-blue-100 text-blue-800'
      case '자유': return 'bg-purple-100 text-purple-800'
      case '정책': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubjectBadgeColor = (subject: string) => {
    switch (subject) {
      case '국어': return 'bg-rose-100 text-rose-800'
      case '사회': return 'bg-orange-100 text-orange-800'
      case '과학': return 'bg-emerald-100 text-emerald-800'
      case '기타': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{topic.title}</h2>
                <p className="text-gray-600">{topic.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 좌측: 기본 정보 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 배지들 */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDebateTypeBadgeColor(topic.debateType)}>
                    {topic.debateType}
                  </Badge>
                  <Badge className={getDifficultyBadgeColor(topic.difficulty)}>
                    {topic.difficulty}
                  </Badge>
                  <Badge className={getSubjectBadgeColor(topic.subject)}>
                    {topic.subject}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">
                    {topic.grade}
                  </Badge>
                  {topic.aiGenerated && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      AI 생성
                    </Badge>
                  )}
                </div>

                {/* 토론 논제 */}
                {topic.agendas && topic.agendas.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.799-6.44c-.885-.37-1.501-1.21-1.501-2.16 0-1.314 1.073-2.4 2.4-2.4h.13c.73-3.57 3.97-6 7.77-6s7.04 2.43 7.77 6h.13c1.327 0 2.4 1.086 2.4 2.4 0 .95-.616 1.79-1.501 2.16z" />
                      </svg>
                      토론 논제
                    </h3>
                    <div className="space-y-2">
                      {topic.agendas.map((agenda, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <p className="font-medium text-gray-900">{agenda}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 키워드 */}
                {topic.keywords && topic.keywords.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">관련 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                      {topic.keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 토론 시나리오 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">🎭 토론 시나리오</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="space-y-3 text-gray-700">
                      <div>
                        <span className="font-medium text-blue-800">1단계:</span> 주제에 대한 기본 이해 공유
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">2단계:</span> 찬성과 반대 입장 나누기
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">3단계:</span> 근거를 제시하며 토론 진행
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">4단계:</span> 다양한 관점 종합하여 결론 도출
                      </div>
                    </div>
                  </div>
                </div>

                {/* 상세 설명 (있는 경우) */}
                {topic.content && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">💡 토론 포인트</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 우측: 메타 정보 및 액션 */}
              <div className="space-y-6">
                {/* 메타 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">토론 정보</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>예상 소요시간: {topic.estimatedTime}분</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>사용 횟수: {topic.useCount || 0}회</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span>조회 수: {topic.viewCount || 0}회</span>
                    </div>
                    {topic.ratingAverage > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>평점: {topic.ratingAverage.toFixed(1)}/5.0</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 생성자 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">생성자 정보</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{topic.teacherName}</p>
                    <p>{formatTimeAgo(topic.createdAt)}</p>
                  </div>
                </div>

                {/* 가져오기 버튼 */}
                <div className="sticky bottom-6">
                  <Button
                    onClick={() => setShowImportDialog(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    size="lg"
                  >
                    🔗 내 토론 세션으로 가져오기
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    제목과 설명을 수정하여 새로운 토론 세션을 생성합니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 가져오기 다이얼로그 */}
      {showImportDialog && (
        <ImportTopicDialog
          topic={topic}
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImportSuccess={() => {
            setShowImportDialog(false);
            onImportSuccess();
            onClose();
          }}
        />
      )}
    </>
  );
}

function ImportTopicDialog({ topic, isOpen, onClose, onImportSuccess }: ImportTopicDialogProps) {
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (topic && isOpen) {
      setCustomTitle(topic.title);
      setCustomDescription(topic.description);
    }
  }, [topic, isOpen]);

  if (!topic) return null;

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/shared/topics/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          customTitle,
          customDescription
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || '가져오기에 실패했습니다.');
      }

      alert(`✅ 토론 주제가 성공적으로 가져와졌습니다!\n세션 코드: ${result.sessionCode}`);
      onImportSuccess();
      onClose();
      
    } catch (error) {
      console.error('토론 주제 가져오기 오류:', error);
      alert(`❌ 가져오기에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">토론 주제 가져오기</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="토론 세션 제목"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full p-2 border rounded h-20"
              placeholder="토론 세션 설명"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isImporting ? '가져오는 중...' : '가져오기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SharedTopicsLibrary({ onTopicSelect }: SharedTopicsLibraryProps) {
  const [topics, setTopics] = useState<SharedTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false
  })
  
  // 필터링 상태
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    grade: 'all',
    difficulty: 'all',
    sortBy: 'latest' as 'latest' | 'popular' | 'mostImported'
  })
  
  // 모달 상태
  const [selectedTopic, setSelectedTopic] = useState<SharedTopic | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 데이터 로드
  const loadTopics = async (params: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        sortBy: params.sortBy || 'latest'
      })
      
      if (params.category && params.category !== 'all') {
        queryParams.append('category', params.category)
      }
      if (params.search) {
        queryParams.append('search', params.search)
      }
      if (params.targetGrade && params.targetGrade !== 'all') {
        queryParams.append('targetGrade', params.targetGrade)
      }

      const response = await fetch(`/api/shared/topics/list?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('공유 주제 목록을 불러올 수 없습니다.')
      }

      const result = await response.json()
      
      // API 응답 구조에 맞춰 데이터 설정
      if (result.success && result.topics) {
        setTopics(result.topics)
        setPagination(result.pagination)
      } else {
        // API 오류 응답 처리
        setTopics([])
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false
        })
        if (result.message) {
          setError(result.message)
        }
      }
    } catch (err) {
      console.error('공유 주제 로드 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 토론 주제 상세보기
  const handleViewTopic = (topic: SharedTopic) => {
    setSelectedTopic(topic)
    setShowDetailModal(true)
  }

  // 초기 로드 및 필터 변경 시 재로드
  useEffect(() => {
    const params: PaginationParams = {
      page: 1,
      limit: 12,
      sortBy: filters.sortBy,
      category: filters.category !== 'all' ? filters.category : undefined,
      targetGrade: filters.grade !== 'all' ? filters.grade : undefined,
      search: filters.search || undefined
    }
    
    loadTopics(params)
  }, [filters])

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params: PaginationParams = {
      page,
      limit: 12,
      sortBy: filters.sortBy,
      category: filters.category !== 'all' ? filters.category : undefined,
      targetGrade: filters.grade !== 'all' ? filters.grade : undefined,
      search: filters.search || undefined
    }
    
    loadTopics(params)
  }

  // 검색 처리
  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  // 난이도 배지 색상
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case '중급': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case '고급': return 'bg-red-100 text-red-800 hover:bg-red-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  // 토론 유형 배지 색상
  const getDebateTypeBadgeColor = (type: string) => {
    switch (type) {
      case '찬반': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case '자유': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'  
      case '정책': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  // 과목 배지 색상
  const getSubjectBadgeColor = (subject: string) => {
    switch (subject) {
      case '국어': return 'bg-rose-100 text-rose-800 hover:bg-rose-200'
      case '사회': return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case '과학': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
      case '기타': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  // 시간 포맷팅
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  if (error) {
    return (
      <Card className="border-2 border-red-100 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl border border-red-200 text-center">
            <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-4">⚠️ 오류 발생</h3>
            <p className="text-red-700 text-lg mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              🔄 다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <Card className="border-2 border-orange-100 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <Search className="h-4 w-4" />
                🔍 토론 주제 검색
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-orange-400" />
                <input
                  type="text"
                  placeholder="주제 제목, 내용, 작성자로 검색해보세요..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 bg-orange-50/50 placeholder-orange-400"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 필터 바 */}
      <Card className="border-2 border-orange-100 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-bold text-orange-900">🔍 상세 필터</span>
            </div>
        
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-2">📚 과목</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-full border-2 border-orange-200 rounded-xl bg-orange-50/50">
                    <SelectValue placeholder="과목" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🔍 전체 과목</SelectItem>
                    <SelectItem value="국어">📝 국어</SelectItem>
                    <SelectItem value="사회">🌍 사회</SelectItem>
                    <SelectItem value="과학">🔬 과학</SelectItem>
                    <SelectItem value="기타">📂 기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-2">🎓 학년</label>
                <Select 
                  value={filters.grade} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, grade: value }))}
                >
                  <SelectTrigger className="w-full border-2 border-orange-200 rounded-xl bg-orange-50/50">
                    <SelectValue placeholder="학년" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🔍 전체 학년</SelectItem>
                    <SelectItem value="1-2학년">🌱 1-2학년</SelectItem>
                    <SelectItem value="3-4학년">🌿 3-4학년</SelectItem>
                    <SelectItem value="5-6학년">🌳 5-6학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-2">⭐ 난이도</label>
                <Select 
                  value={filters.difficulty} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="w-full border-2 border-orange-200 rounded-xl bg-orange-50/50">
                    <SelectValue placeholder="난이도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🔍 전체 난이도</SelectItem>
                    <SelectItem value="초급">🟢 초급</SelectItem>
                    <SelectItem value="중급">🟡 중급</SelectItem>
                    <SelectItem value="고급">🔴 고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-2">🔄 정렬</label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value: 'latest' | 'popular' | 'mostImported') => 
                    setFilters(prev => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger className="w-full border-2 border-orange-200 rounded-xl bg-orange-50/50">
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">🕰️ 최신순</SelectItem>
                    <SelectItem value="popular">🔥 인기순</SelectItem>
                    <SelectItem value="mostImported">🏆 활용순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      {loading && (
        <Card className="border-2 border-orange-100 shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-orange-700 font-semibold text-lg">🔄 공유 주제를 불러오는 중...</p>
              <p className="text-orange-600 text-sm mt-2">잠시만 기다려주세요!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 주제 목록 */}
      {!loading && Array.isArray(topics) && topics.length === 0 && (
        <Card className="border-2 border-gray-100 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-8 rounded-2xl border border-gray-200 text-center">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-gray-400 to-orange-400 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🔍 공유된 토론 주제가 없습니다
              </h3>
              <p className="text-gray-600 text-lg mb-6 max-w-lg">
                아직 다른 교사들이 공유한 AI 생성 토론 주제가 없습니다. 
                AI 시나리오 생성기를 활용해서 첫 번째 주제를 만들고 공유해보세요!
              </p>
              <div className="bg-white/80 backdrop-blur p-4 rounded-lg border border-gray-300">
                <p className="text-sm text-gray-500">
                  💡 팁: 대시보드의 'AI 시나리오 생성' 버튼을 클릭해보세요!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && topics.length > 0 && (
        <>
          {/* 결과 통계 */}
          <div className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-orange-900">
                  💡 총 {pagination.totalCount}개의 AI 생성 주제
                </p>
                <p className="text-sm text-orange-600">
                  {filters.search ? `"${filters.search}" 검색 결과` : '전체 주제 목록'} · {pagination.currentPage}/{pagination.totalPages} 페이지
                </p>
              </div>
            </div>
            {pagination.totalCount > 0 && (
              <div className="text-right">
                <p className="text-sm font-medium text-orange-700">✨ 마음에 드는 주제를 클릭해보세요!</p>
              </div>
            )}
          </div>

          {/* 토론 주제 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-orange-300 bg-gradient-to-br from-white to-orange-50/30 cursor-pointer group">
                <CardHeader className="pb-4 relative">
                  {/* 호버 시 글로우 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-t-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100"></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <CardTitle className="text-lg font-bold line-clamp-2 flex-1 pr-3 text-gray-900 group-hover:text-orange-900 transition-colors duration-200">
                      {topic.title}
                    </CardTitle>
                    {topic.aiGenerated && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 font-semibold">
                        🤖 AI 생성
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3 text-sm text-gray-600 mt-2 relative z-10">
                    {topic.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* 배지 그룹 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge 
                      variant="outline" 
                      className={getDebateTypeBadgeColor(topic.debateType)}
                    >
                      {topic.debateType}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getDifficultyBadgeColor(topic.difficulty)}
                    >
                      {topic.difficulty}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getSubjectBadgeColor(topic.subject)}
                    >
                      {topic.subject}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      {topic.grade}
                    </Badge>
                  </div>

                  {/* 메타 정보 */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{topic.estimatedTime}분</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{topic.useCount || 0}회 사용</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{topic.viewCount || 0}회 조회</span>
                    </div>
                    {topic.ratingAverage > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{topic.ratingAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* 키워드 */}
                  {topic.keywords && topic.keywords.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.slice(0, 3).map((keyword, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            #{keyword}
                          </span>
                        ))}
                        {topic.keywords.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                            +{topic.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 하단 정보 */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      <div>{topic.teacherName}</div>
                      <div>{formatTimeAgo(topic.createdAt)}</div>
                    </div>
                    
                    <Button
                      size="lg"
                      onClick={() => handleViewTopic(topic)}
                      className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      👀 상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                이전
              </Button>
              
              {/* 페이지 번호 */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const startPage = Math.max(1, pagination.currentPage - 2)
                const pageNumber = startPage + i
                
                if (pageNumber > pagination.totalPages) return null
                
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      {/* Topic Detail Modal */}
      {showDetailModal && (
        <TopicDetailModal
          topic={selectedTopic}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTopic(null)
          }}
          onImportSuccess={() => {
            // 토론 주제를 성공적으로 가져왔을 때 처리
            // 필요시 부모 컴포넌트에게 알림
          }}
        />
      )}
    </div>
  )
}