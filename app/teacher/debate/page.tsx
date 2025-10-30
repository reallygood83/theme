'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';
import DebateHeader from '@/components/debate/DebateHeader';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import FeedbackTemplates from '@/components/teacher/FeedbackTemplates';

interface Opinion {
  _id: string;
  topic: string;
  content: string;
  studentName: string;
  studentClass: string;
  status: 'pending' | 'feedback_given' | 'reviewed';
  submittedAt: string;
  aiFeedback?: string;
  teacherFeedback?: string;
  teacherFeedbackAt?: string;
  referenceCode: string;
}

interface OpinionStats {
  total: number;
  pending: number;
  feedback_given: number;
  reviewed: number;
}

export default function TeacherDebatePage() {
  const { user } = useAuth();
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [stats, setStats] = useState<OpinionStats>({
    total: 0,
    pending: 0,
    feedback_given: 0,
    reviewed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'feedback_given' | 'reviewed'>('all');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchOpinions();
    }
  }, [user?.uid, filter]);

  const fetchOpinions = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        firebaseUid: user.uid,
        ...(filter !== 'all' && { status: filter })
      });

      const response = await fetch(`/api/debate/opinions/class?${params}`);
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          // API returns {opinions, stats, pagination} directly under data
          const opinions = responseData.data?.opinions || [];
          const stats = responseData.data?.stats || {
            total: 0,
            pending: 0,
            feedback_given: 0,
            reviewed: 0
          };
          
          setOpinions(opinions);
          setStats(stats);
        } else {
          console.error('API returned error:', responseData.error);
          setOpinions([]);
          setStats({
            total: 0,
            pending: 0,
            feedback_given: 0,
            reviewed: 0
          });
        }
      } else {
        console.error('Failed to fetch opinions:', response.status, response.statusText);
        // Handle 404 specifically - teacher may not exist yet, but don't crash
        if (response.status === 404) {
          console.warn('Teacher not found, possibly first login. Opinions will be empty.');
        }
        setOpinions([]);
        setStats({
          total: 0,
          pending: 0,
          feedback_given: 0,
          reviewed: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch opinions:', error);
      // 네트워크 오류 시 기본값 설정
      setOpinions([]);
      setStats({
        total: 0,
        pending: 0,
        feedback_given: 0,
        reviewed: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIFeedback = async (opinionId: string) => {
    setFeedbackLoading(true);
    try {
      const response = await fetch('/api/debate/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          opinionId,
          regenerate: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 성공적으로 AI 피드백이 생성되면 목록을 새로고침
        fetchOpinions();
        // 선택된 의견도 업데이트
        if (selectedOpinion?._id === opinionId) {
          setSelectedOpinion(prev => prev ? { ...prev, aiFeedback: data.data.feedback } : null);
        }
      } else {
        console.error('Failed to generate AI feedback');
        alert('AI 피드백 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      alert('AI 피드백 생성 중 오류가 발생했습니다.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const submitTeacherFeedback = async () => {
    if (!selectedOpinion || !teacherFeedback.trim()) return;
    
    setFeedbackLoading(true);
    try {
      const response = await fetch('/api/debate/teacher-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: user?.uid,
          opinionId: selectedOpinion._id,
          teacherFeedback: teacherFeedback.trim()
        }),
      });

      if (response.ok) {
        // 성공적으로 교사 피드백이 추가되면 목록과 선택된 의견을 새로고침
        fetchOpinions();
        setTeacherFeedback('');
        setSelectedOpinion(null);
      } else {
        console.error('Failed to submit teacher feedback');
        alert('교사 피드백 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting teacher feedback:', error);
      alert('교사 피드백 제출 중 오류가 발생했습니다.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleTemplateSelect = (templateContent: string) => {
    setTeacherFeedback(templateContent);
    setShowTemplates(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'feedback_given':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'feedback_given':
        return '피드백 완료';
      case 'reviewed':
        return '검토 완료';
      default:
        return status;
    }
  };

  return (
    <RequireAuth>
      <DebateHeader 
        title="교사 토론 관리"
        subtitle="학생들의 토론 의견을 확인하고 피드백을 제공하세요"
        isTeacher={true}
        backHref="/teacher/dashboard"
        backLabel="대시보드로"
        showSessionInfo={false}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">전체 의견</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">대기중</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">피드백 완료</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.feedback_given}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-700">검토 완료</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.reviewed}</p>
            </Card>
          </div>

          {/* 필터 버튼 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'pending', label: '대기중' },
                { key: 'feedback_given', label: '피드백 완료' },
                { key: 'reviewed', label: '검토 완료' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  variant={filter === key ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 의견 목록 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">학생 의견 목록</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">의견을 불러오는 중...</p>
                </div>
              ) : opinions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">아직 제출된 의견이 없습니다.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {opinions.map((opinion) => (
                    <Card
                      key={opinion._id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedOpinion?._id === opinion._id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedOpinion(opinion)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{opinion.studentName}</h3>
                          <p className="text-sm text-gray-500">{opinion.studentClass}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opinion.status)}`}>
                            {getStatusText(opinion.status)}
                          </span>
                          <span className="text-xs text-gray-500">#{opinion.referenceCode}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{opinion.topic}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{opinion.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(opinion.submittedAt).toLocaleString('ko-KR')}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 상세 보기 및 피드백 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">의견 상세 및 피드백</h2>
              {selectedOpinion ? (
                <div className="space-y-4">
                  {/* 의견 상세 */}
                  <Card className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">{selectedOpinion.studentName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOpinion.status)}`}>
                          {getStatusText(selectedOpinion.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{selectedOpinion.studentClass} | #{selectedOpinion.referenceCode}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">토론 주제</h4>
                      <p className="text-gray-900">{selectedOpinion.topic}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">학생 의견</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedOpinion.content}</p>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      제출일: {new Date(selectedOpinion.submittedAt).toLocaleString('ko-KR')}
                    </p>
                  </Card>

                  {/* AI 피드백 */}
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900">AI 피드백</h4>
                      <Button
                        onClick={() => generateAIFeedback(selectedOpinion._id)}
                        disabled={feedbackLoading}
                        size="sm"
                        variant="secondary"
                      >
                        {feedbackLoading ? '생성 중...' : 'AI 피드백 생성'}
                      </Button>
                    </div>
                    
                    {selectedOpinion.aiFeedback ? (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{selectedOpinion.aiFeedback}</pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">아직 AI 피드백이 생성되지 않았습니다.</p>
                    )}
                  </Card>

                  {/* 교사 피드백 */}
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900">교사 피드백</h4>
                      {!selectedOpinion.teacherFeedback && (
                        <Button
                          onClick={() => setShowTemplates(!showTemplates)}
                          variant="secondary"
                          size="sm"
                        >
                          {showTemplates ? '템플릿 닫기' : '템플릿 사용'}
                        </Button>
                      )}
                    </div>
                    
                    {selectedOpinion.teacherFeedback ? (
                      <div className="bg-green-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedOpinion.teacherFeedback}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          작성일: {selectedOpinion.teacherFeedbackAt ? new Date(selectedOpinion.teacherFeedbackAt).toLocaleString('ko-KR') : ''}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        {showTemplates && user?.uid && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">피드백 템플릿 선택</h5>
                            <FeedbackTemplates
                              teacherId={user.uid}
                              onTemplateSelect={handleTemplateSelect}
                            />
                          </div>
                        )}
                        
                        <textarea
                          value={teacherFeedback}
                          onChange={(e) => setTeacherFeedback(e.target.value)}
                          placeholder="학생에게 전달할 피드백을 작성하세요..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">
                            {teacherFeedback.length}/2000자
                          </span>
                          <Button
                            onClick={submitTeacherFeedback}
                            disabled={!teacherFeedback.trim() || feedbackLoading}
                          >
                            {feedbackLoading ? '제출 중...' : '피드백 제출'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">왼쪽에서 의견을 선택하여 상세 내용을 확인하세요.</p>
                </Card>
              )}
            </div>
          </div>
      </div>
    </RequireAuth>
  );
}