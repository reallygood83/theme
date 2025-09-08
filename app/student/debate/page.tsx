'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import OpinionManager from '@/components/student/OpinionManager';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import SuccessAlert from '@/components/common/SuccessAlert';

interface Student {
  _id: string;
  name: string;
  accessCode: string;
  groupName?: string;
  classId: string;
}

interface Opinion {
  _id: string;
  topic: string;
  content: string;
  status: string;
  submittedAt: string;
  referenceCode: string;
  aiFeedback?: string;
  teacherFeedback?: string;
}

export default function StudentDebatePage() {
  const searchParams = useSearchParams();
  const sessionCode = searchParams.get('session');
  
  const [student, setStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    accessCode: '',
    classCode: '',
    groupName: ''
  });
  const [opinion, setOpinion] = useState({
    topic: '',
    content: ''
  });
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'submit' | 'view'>('login');
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);

  useEffect(() => {
    if (sessionCode && studentForm.classCode === '') {
      setStudentForm(prev => ({ ...prev, classCode: sessionCode }));
    }
  }, [sessionCode]);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/debate/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: studentForm.name,
          accessCode: studentForm.accessCode,
          classCode: studentForm.classCode,
          sessionCode: sessionCode || undefined,
          groupName: studentForm.groupName || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStudent(data.data);
        await fetchStudentOpinions(data.data._id);
        setStep('submit');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Student login error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentOpinions = async (studentId: string) => {
    try {
      const response = await fetch(`/api/debate/opinions?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setOpinions(data.data.opinions || []);
      }
    } catch (error) {
      console.error('Failed to fetch opinions:', error);
    }
  };

  const handleSubmitOpinion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !opinion.topic.trim() || !opinion.content.trim()) return;

    setSubmitLoading(true);
    try {
      const response = await fetch('/api/debate/opinions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: opinion.topic.trim(),
          content: opinion.content.trim(),
          studentName: student.name,
          studentId: student._id,
          classId: student.classId,
          sessionCode: sessionCode || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('의견이 성공적으로 제출되었습니다!');
        setOpinion({ topic: '', content: '' });
        await fetchStudentOpinions(student._id);
        setStep('view');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '의견 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('Opinion submission error:', error);
      alert('의견 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
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
        return '검토 대기중';
      case 'feedback_given':
        return '피드백 완료';
      case 'reviewed':
        return '검토 완료';
      default:
        return status;
    }
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">토론 의견 제출</h1>
            <p className="mt-2 text-gray-600">학생 정보를 입력하여 시작하세요</p>
          </div>

          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={studentForm.name}
                onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="실명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
                고유번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="accessCode"
                type="text"
                required
                value={studentForm.accessCode}
                onChange={(e) => setStudentForm(prev => ({ ...prev, accessCode: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="학번 또는 고유번호"
              />
            </div>

            <div>
              <label htmlFor="classCode" className="block text-sm font-medium text-gray-700">
                학급 코드 <span className="text-red-500">*</span>
              </label>
              <input
                id="classCode"
                type="text"
                required
                value={studentForm.classCode}
                onChange={(e) => setStudentForm(prev => ({ ...prev, classCode: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="교사가 제공한 학급 코드"
              />
            </div>

            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                모둠명 (선택)
              </label>
              <input
                id="groupName"
                type="text"
                value={studentForm.groupName}
                onChange={(e) => setStudentForm(prev => ({ ...prev, groupName: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="모둠명 (예: 1모둠)"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? '로그인 중...' : '시작하기'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (step === 'submit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">안녕하세요, {student?.name}님!</h1>
                <p className="mt-2 text-gray-600">토론 의견을 관리해보세요.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {student?.groupName && `${student.groupName} | `}
                  고유번호: {student?.accessCode}
                </p>
                <Button
                  onClick={() => setStep('view')}
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                >
                  내 의견 보기
                </Button>
              </div>
            </div>
          </div>

          {/* OpinionManager 컴포넌트 */}
          <OpinionManager
            studentName={student?.name || ''}
            studentClass={student?.classId || ''}
            onOpinionSubmitted={() => {
              // 의견 제출 후 목록 새로고침
              if (student) {
                fetchStudentOpinions(student._id);
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (step === 'view') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">내가 제출한 의견</h1>
                <p className="mt-2 text-gray-600">{student?.name}님의 토론 의견 목록입니다.</p>
              </div>
              <Button
                onClick={() => setStep('submit')}
                variant="primary"
              >
                새 의견 작성
              </Button>
            </div>
          </div>

          {/* 의견 목록 */}
          {opinions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-4">아직 제출한 의견이 없습니다.</p>
              <Button onClick={() => setStep('submit')}>
                첫 의견 작성하기
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 의견 목록 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">제출한 의견 ({opinions.length}개)</h2>
                <div className="space-y-4">
                  {opinions.map((op) => (
                    <Card
                      key={op._id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedOpinion?._id === op._id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedOpinion(op)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{op.topic}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(op.status)}`}>
                          {getStatusText(op.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{op.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>#{op.referenceCode}</span>
                        <span>{new Date(op.submittedAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 상세 보기 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">상세 보기</h2>
                {selectedOpinion ? (
                  <div className="space-y-4">
                    {/* 의견 내용 */}
                    <Card className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{selectedOpinion.topic}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOpinion.status)}`}>
                          {getStatusText(selectedOpinion.status)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">내 의견</h4>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedOpinion.content}</p>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>참조번호: #{selectedOpinion.referenceCode}</span>
                        <span>제출일: {new Date(selectedOpinion.submittedAt).toLocaleString('ko-KR')}</span>
                      </div>
                    </Card>

                    {/* AI 피드백 */}
                    {selectedOpinion.aiFeedback && (
                      <Card className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          🤖 AI 선생님의 피드백
                        </h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{selectedOpinion.aiFeedback}</pre>
                        </div>
                      </Card>
                    )}

                    {/* 교사 피드백 */}
                    {selectedOpinion.teacherFeedback && (
                      <Card className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          👨‍🏫 선생님의 피드백
                        </h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedOpinion.teacherFeedback}</p>
                        </div>
                      </Card>
                    )}

                    {/* 피드백 대기 중 */}
                    {!selectedOpinion.aiFeedback && !selectedOpinion.teacherFeedback && (
                      <Card className="p-6 text-center">
                        <div className="text-gray-400 mb-2">⏳</div>
                        <p className="text-gray-500">선생님이 피드백을 준비하고 있어요!</p>
                        <p className="text-sm text-gray-400 mt-1">조금만 기다려주세요.</p>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">왼쪽에서 의견을 선택하여 자세히 확인하세요.</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}