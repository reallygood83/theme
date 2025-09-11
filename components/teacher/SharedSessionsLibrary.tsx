'use client';

/**
 * 교육자료실 컴포넌트
 * Phase 2: 교사가 공유된 토론 세션들을 탐색하고 가져올 수 있는 전문적인 UI
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Using basic HTML input and select elements for simplicity
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BookOpen, 
  Users, 
  Globe, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Star,
  Eye,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
  Youtube,
  Link as LinkIcon,
  Paperclip
} from 'lucide-react';
// Using browser alert for notifications (avoiding external dependencies)

interface SharedSessionMaterial {
  id: string;
  type: 'text' | 'youtube' | 'link' | 'file';
  title: string;
  content: string;
  url?: string;
}

interface SharedSession {
  id: string;
  title: string;
  description: string;
  materials: SharedSessionMaterial[];
  teacherName: string;
  shareType: 'public' | 'restricted';
  tags: string[];
  category: string;
  targetGrade: '1-2학년' | '3-4학년' | '5-6학년';
  createdAt: number;
  importCount: number;
}


interface ImportDialogProps {
  session: SharedSession | null;
  isOpen: boolean;
  onClose: () => void;
  onImport: (sessionId: string, customTitle?: string, customDescription?: string) => Promise<void>;
}

function ImportSessionDialog({ session, isOpen, onClose, onImport }: ImportDialogProps) {
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (session && isOpen) {
      setCustomTitle(session.title);
      setCustomDescription(session.description);
    }
  }, [session, isOpen]);

  if (!session) return null;

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await onImport(session.id, customTitle, customDescription);
      onClose();
    } catch (error) {
      console.error('세션 가져오기 오류:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'link': return <LinkIcon className="h-4 w-4 text-blue-500" />;
      case 'file': return <Paperclip className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            세션 가져오기
          </DialogTitle>
          <DialogDescription>
            이 토론 세션을 내 세션 목록으로 가져와서 사용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 세션 정보 미리보기 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{session.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">작성자: {session.teacherName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{session.targetGrade}</Badge>
                    <Badge variant="secondary">{session.category}</Badge>
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {session.importCount}회 가져감
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* 학습 자료 목록 */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">포함된 학습 자료:</h4>
                {session.materials.map((material) => (
                  <div key={material.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                    {getMaterialIcon(material.type)}
                    <span className="font-medium">{material.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {material.type}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* 태그 표시 */}
              {session.tags.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {session.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 커스터마이제이션 옵션 */}
          <div className="space-y-4">
            <h3 className="font-semibold">가져온 세션 설정</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">세션 제목</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="세션 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">세션 설명</label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="세션 설명을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors min-h-[80px] resize-y"
              />
            </div>
          </div>

          {/* 개인정보 보호 안내 */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">가져오기 안내</p>
                  <p className="text-blue-700 mt-1">
                    세션의 제목과 학습 자료만 복사되며, 원본 세션의 질문이나 학생 데이터는 포함되지 않습니다.
                    가져온 세션은 완전히 독립적으로 관리됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isImporting}
            >
              취소
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !customTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  가져오는 중...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  세션 가져오기
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SessionCardProps {
  session: SharedSession;
  onImport: (session: SharedSession) => void;
}

function SessionCard({ session, onImport }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 카테고리 아이콘 및 색상 매핑
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'general':
        return { icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'science':
        return { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'social':
        return { icon: Globe, color: 'text-green-600', bg: 'bg-green-100' };
      case 'ethics':
        return { icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-100' };
      default:
        return { icon: Users, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const categoryInfo = getCategoryInfo(session.category);
  const IconComponent = categoryInfo.icon;

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '🎥';
      case 'link': return '🔗';
      case 'file': return '📁';
      default: return '📝';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/30 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-4 relative">
        {/* 호버 시 글로우 효과 */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-t-lg transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1 pr-3">
            <CardTitle className="text-lg font-bold line-clamp-2 text-gray-900 group-hover:text-blue-900 transition-colors duration-200">
              {session.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2 text-gray-600">
              {session.description}
            </CardDescription>
          </div>
          <div className={`p-3 rounded-xl ${categoryInfo.bg} shadow-md group-hover:scale-110 transition-transform duration-200`}>
            <IconComponent className={`h-5 w-5 ${categoryInfo.color}`} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 relative z-10">
          <Badge variant="outline" className="text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
            📚 {session.targetGrade}
          </Badge>
          <Badge variant="secondary" className={`text-xs font-semibold ${
            session.shareType === 'public' 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
              : 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800'
          }`}>
            {session.shareType === 'public' ? '🌍 전체공개' : '🔒 제한공개'}
          </Badge>
          <Badge variant="outline" className="text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200">
            <Eye className="h-3 w-3 mr-1" />
            {session.importCount} 가져감
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 기본 정보 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{session.teacherName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(session.createdAt)}</span>
            </div>
          </div>

          {/* 자료 요약 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                학습 자료 ({session.materials?.length || 0}개)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {!isExpanded ? (
              <div className="flex flex-wrap gap-1">
                {session.materials?.slice(0, 3).map((material) => (
                  <span key={material.id} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                    <span>{getMaterialIcon(material.type)}</span>
                    <span className="truncate max-w-20">{material.title}</span>
                  </span>
                )) || []}
                {session.materials && session.materials.length > 3 && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    +{session.materials.length - 3}개 더
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {session.materials?.map((material) => (
                  <div key={material.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="text-lg">{getMaterialIcon(material.type)}</span>
                    <span className="font-medium flex-1">{material.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {material.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 태그 */}
          {session.tags && session.tags.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1">
                {session.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {session.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{session.tags.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end pt-4 border-t border-blue-100">
            <Button
              onClick={() => onImport(session)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              💾 세션 가져오기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function SharedSessionsLibrary() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SharedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [importingSession, setImportingSession] = useState<SharedSession | null>(null);

  // Feature Flag 체크
  const sharingEnabled = process.env.NEXT_PUBLIC_ENABLE_SHARING === 'true';

  const categories = [
    { value: 'all', label: '전체 카테고리', icon: '🔍' },
    { value: 'general', label: '일반 토론', icon: '💬' },
    { value: 'science', label: '과학 기술', icon: '🔬' },
    { value: 'social', label: '사회 문화', icon: '🌍' },
    { value: 'ethics', label: '윤리 철학', icon: '⚖️' }
  ];

  const grades = [
    { value: 'all', label: '전체 학년', icon: '📚' },
    { value: '1-2학년', label: '1-2학년', icon: '🌱' },
    { value: '3-4학년', label: '3-4학년', icon: '🌿' },
    { value: '5-6학년', label: '5-6학년', icon: '🌳' }
  ];

  const fetchSharedSessions = async () => {
    if (!sharingEnabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/shared/sessions');
      
      if (!response.ok) {
        throw new Error('공유 세션 목록을 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('공유 세션 로드 오류:', error);
      alert('공유 세션 목록을 불러오는데 실패했습니다.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };



  // 날짜 포맷팅
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

  useEffect(() => {
    fetchSharedSessions();
  }, []);

  // 필터링된 세션 목록
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || session.category === selectedCategory;
    const matchesGrade = selectedGrade === 'all' || session.targetGrade === selectedGrade;
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => session.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesGrade && matchesTags;
  });


  // 세션 가져오기 처리
  const handleImportSession = async (sessionId: string, customTitle?: string, customDescription?: string) => {
    try {
      const response = await fetch('/api/shared/sessions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharedSessionId: sessionId,
          customTitle,
          customDescription,
          teacherId: user?.uid,
          teacherName: user?.displayName || user?.email?.split('@')[0] || '익명 교사',
          teacherEmail: user?.email
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '세션 가져오기에 실패했습니다.');
      }

      alert('✅ 세션을 성공적으로 가져왔습니다!');

      // 가져오기 성공 시 통계 업데이트를 위해 목록 새로고침
      await fetchSharedSessions();

    } catch (error) {
      console.error('세션 가져오기 오류:', error);
      alert(`❌ ${error instanceof Error ? error.message : '세션 가져오기에 실패했습니다.'}`);
      throw error;
    }
  };

  // Feature Flag가 비활성화된 경우
  if (!sharingEnabled) {
    return (
      <Card className="border-2 border-yellow-100 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-xl border-2 border-yellow-200">
            <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-800 mb-4">
              🚧 교육자료실 준비 중
            </h3>
            <p className="text-yellow-700 text-lg mb-6">
              교사간 세션 공유 기능이 현재 개발 중입니다. 곧 멋진 기능으로 찾아뵙겠습니다!
            </p>
            <div className="bg-white/60 backdrop-blur p-4 rounded-lg">
              <p className="text-sm text-yellow-600">
                📅 예상 출시일: 곧 공개 예정 | 🔔 알림을 받고 싶으시면 문의해 주세요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 - 교사용 가이드 */}
      <Card className="border-2 border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500 rounded-xl shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-green-900 mb-2">
                📚 교육자료실 - 공유 세션 탐색
              </h2>
              <p className="text-green-700 text-sm mb-4">
                다른 교사들이 공유한 토론 세션을 탐색하고 가져와서 바로 사용해보세요!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Search className="h-4 w-4" />
                  <span>검색 및 필터링</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Eye className="h-4 w-4" />
                  <span>상세 미리보기</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Download className="h-4 w-4" />
                  <span>원클릭 가져오기</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검색 및 필터 */}
      <Card className="border-2 border-blue-100 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 검색 */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Search className="h-4 w-4" />
                🔍 세션 검색
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="세션 제목, 설명, 작성자로 검색해보세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-blue-50/50 placeholder-blue-400"
                />
              </div>
            </div>
            
            {/* 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  📂 카테고리
                </label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-40 px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-blue-50/50 font-medium"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">🎓 학년</label>
                <select 
                  value={selectedGrade} 
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full sm:w-32 px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-blue-50/50 font-medium"
                >
                  {grades.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.icon} {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={fetchSharedSessions}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 rounded-xl font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                      검색 중...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      새로고침
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 표시 */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              📊 총 {filteredSessions.length}개의 공유 세션
            </p>
            <p className="text-sm text-blue-600">
              {searchTerm ? `"${searchTerm}" 검색 결과` : '전체 세션 목록'}
            </p>
          </div>
        </div>
        {filteredSessions.length > 0 && (
          <div className="text-right">
            <p className="text-sm font-medium text-blue-700">💡 마음에 드는 세션을 클릭해보세요!</p>
          </div>
        )}
      </div>

      {/* 콘텐츠 목록 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">
            공유 세션을 불러오는 중...
          </p>
        </div>
      ) : (
        // 세션 목록 표시
        filteredSessions.length === 0 ? (
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl border border-gray-200">
                <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-gray-400 to-blue-400 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {searchTerm || selectedCategory !== 'all' || selectedGrade !== 'all' 
                    ? '🔍 검색 결과가 없습니다' 
                    : '🔍 공유된 세션이 없습니다'}
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  {searchTerm || selectedCategory !== 'all' || selectedGrade !== 'all' 
                    ? '🔄 검색 조건을 변경하거나 필터를 초기화해보세요.' 
                    : '🎉 아직 공유된 토론 세션이 없습니다. 첫 번째 세션을 공유해주세요!'}
                </p>
                <div className="bg-white/80 backdrop-blur p-4 rounded-lg border border-gray-300">
                  <p className="text-sm text-gray-500 mb-3">
                    💡 팁: 다양한 카테고리와 학년별로 검색해보세요!
                  </p>
                  {(searchTerm || selectedCategory !== 'all' || selectedGrade !== 'all') && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setSelectedGrade('all');
                          setSelectedTags([]);
                        }}
                        className="text-xs hover:bg-blue-50"
                      >
                        🔄 필터 초기화
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onImport={setImportingSession}
              />
            ))}
          </div>
        )
      )}

      {/* 세션 가져오기 다이얼로그 */}
      <ImportSessionDialog
        session={importingSession}
        isOpen={!!importingSession}
        onClose={() => setImportingSession(null)}
        onImport={handleImportSession}
      />
    </div>
  );
}