'use client';

import React, { useState, useEffect } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Globe, 
  Search,
  Filter,
  Download,
  Star,
  Eye,
  Calendar,
  User,
  FileText,
  Youtube,
  Link as LinkIcon,
  Paperclip,
  GraduationCap,
  Clock,
  Tag
} from 'lucide-react';

// 활동지 인터페이스
interface Worksheet {
  id: string;
  title: string;
  description: string;
  subject: '국어' | '사회' | '과학' | '기타';
  grade: '1-2학년' | '3-4학년' | '5-6학년';
  type: '토론' | '발표' | '글쓰기' | '조사';
  downloadUrl: string;
  previewUrl?: string;
  tags: string[];
  createdAt: number;
  downloadCount: number;
}

// 공유 세션 자료 인터페이스
interface SharedSessionMaterial {
  id: string;
  type: 'text' | 'youtube' | 'link' | 'file';
  title: string;
  content: string;
  url?: string;
}

// 공유 세션 인터페이스
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

// 공유 주제 인터페이스
interface SharedTopic {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  debateType: '찬반' | '자유' | '정책';
  difficulty: '초급' | '중급' | '고급';
  estimatedTime: number;
  subject: '국어' | '사회' | '과학' | '기타';
  grade: '1-2학년' | '3-4학년' | '5-6학년';
  tags: string[];
  aiGenerated: boolean;
  viewCount: number;
  useCount: number;
  createdAt: number;
}

// 샘플 활동지 데이터
const sampleWorksheets: Worksheet[] = [
  {
    id: '1',
    title: '환경보호 토론 활동지',
    description: '환경보호의 필요성에 대해 토론하는 활동지입니다.',
    subject: '사회',
    grade: '5-6학년',
    type: '토론',
    downloadUrl: '#',
    tags: ['환경', '토론', '사회'],
    createdAt: Date.now() - 86400000,
    downloadCount: 45
  },
  {
    id: '2',
    title: '과학 실험 보고서 양식',
    description: '과학 실험 결과를 정리하는 보고서 양식입니다.',
    subject: '과학',
    grade: '3-4학년',
    type: '글쓰기',
    downloadUrl: '#',
    tags: ['과학', '실험', '보고서'],
    createdAt: Date.now() - 172800000,
    downloadCount: 32
  },
  {
    id: '3',
    title: '독서 발표 준비 시트',
    description: '독서 후 발표를 준비하는 활동지입니다.',
    subject: '국어',
    grade: '1-2학년',
    type: '발표',
    downloadUrl: '#',
    tags: ['독서', '발표', '국어'],
    createdAt: Date.now() - 259200000,
    downloadCount: 28
  }
];

// 샘플 공유 세션 데이터
const sampleSharedSessions: SharedSession[] = [
  {
    id: '1',
    title: '기후변화와 우리의 미래',
    description: '기후변화 문제에 대한 학생들의 인식과 해결방안을 토론합니다.',
    materials: [
      {
        id: '1',
        type: 'youtube',
        title: '기후변화 다큐멘터리',
        content: '기후변화의 현실을 보여주는 영상',
        url: 'https://youtube.com/watch?v=example'
      },
      {
        id: '2',
        type: 'text',
        title: '기후변화 통계 자료',
        content: '최근 10년간 기후변화 관련 통계'
      }
    ],
    teacherName: '김환경',
    shareType: 'public',
    tags: ['환경', '기후변화', '미래'],
    category: '사회',
    targetGrade: '5-6학년',
    createdAt: Date.now() - 86400000,
    importCount: 15
  },
  {
    id: '2',
    title: '인공지능과 인간의 관계',
    description: 'AI 기술 발전이 인간 사회에 미치는 영향을 토론합니다.',
    materials: [
      {
        id: '3',
        type: 'link',
        title: 'AI 뉴스 기사',
        content: '최신 AI 기술 동향',
        url: 'https://news.example.com/ai'
      }
    ],
    teacherName: '이기술',
    shareType: 'public',
    tags: ['AI', '기술', '미래'],
    category: '과학',
    targetGrade: '5-6학년',
    createdAt: Date.now() - 172800000,
    importCount: 8
  }
];

// 샘플 공유 주제 데이터
const sampleSharedTopics: SharedTopic[] = [
  {
    id: '1',
    title: '학교에서 스마트폰 사용을 금지해야 할까?',
    description: '학교 내 스마트폰 사용 금지에 대한 찬반 토론',
    teacherName: '박교육',
    debateType: '찬반',
    difficulty: '중급',
    estimatedTime: 40,
    subject: '사회',
    grade: '5-6학년',
    tags: ['스마트폰', '교육', '규칙'],
    aiGenerated: false,
    viewCount: 120,
    useCount: 25,
    createdAt: Date.now() - 86400000
  },
  {
    id: '2',
    title: '우주 탐사에 더 많은 예산을 투입해야 할까?',
    description: '우주 탐사 예산 증액에 대한 토론 주제',
    teacherName: 'AI 생성',
    debateType: '찬반',
    difficulty: '고급',
    estimatedTime: 50,
    subject: '과학',
    grade: '5-6학년',
    tags: ['우주', '예산', '과학'],
    aiGenerated: true,
    viewCount: 85,
    useCount: 12,
    createdAt: Date.now() - 172800000
  }
];

export default function MaterialsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('전체');
  const [selectedSubject, setSelectedSubject] = useState<string>('전체');
  const [activeTab, setActiveTab] = useState('worksheets');

  // 활동지 필터링
  const filteredWorksheets = sampleWorksheets.filter(worksheet => {
    const matchesSearch = worksheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worksheet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worksheet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGrade = selectedGrade === '전체' || worksheet.grade === selectedGrade;
    const matchesSubject = selectedSubject === '전체' || worksheet.subject === selectedSubject;
    
    return matchesSearch && matchesGrade && matchesSubject;
  });

  // 공유 세션 필터링
  const filteredSessions = sampleSharedSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGrade = selectedGrade === '전체' || session.targetGrade === selectedGrade;
    
    return matchesSearch && matchesGrade;
  });

  // 공유 주제 필터링
  const filteredTopics = sampleSharedTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGrade = selectedGrade === '전체' || topic.grade === selectedGrade;
    const matchesSubject = selectedSubject === '전체' || topic.subject === selectedSubject;
    
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'link': return <LinkIcon className="h-4 w-4 text-blue-500" />;
      case 'file': return <Paperclip className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR');
  };

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">교육자료실</h1>
          <p className="text-gray-600">
            다양한 교육 자료와 토론 주제를 탐색하고 활용해보세요.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="자료 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="전체">전체 학년</option>
                  <option value="1-2학년">1-2학년</option>
                  <option value="3-4학년">3-4학년</option>
                  <option value="5-6학년">5-6학년</option>
                </select>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="전체">전체 과목</option>
                  <option value="국어">국어</option>
                  <option value="사회">사회</option>
                  <option value="과학">과학</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="worksheets" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              활동지
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              공유 세션
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              주제 라이브러리
            </TabsTrigger>
          </TabsList>

          {/* 활동지 탭 */}
          <TabsContent value="worksheets" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorksheets.map((worksheet) => (
                <Card key={worksheet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{worksheet.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {worksheet.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline">{worksheet.grade}</Badge>
                      <Badge variant="secondary">{worksheet.subject}</Badge>
                      <Badge variant="outline">{worksheet.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* 태그 */}
                      <div className="flex flex-wrap gap-1">
                        {worksheet.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* 통계 */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {worksheet.downloadCount}회 다운로드
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(worksheet.createdAt)}
                        </div>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          다운로드
                        </Button>
                        {worksheet.previewUrl && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredWorksheets.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
              </div>
            )}
          </TabsContent>

          {/* 공유 세션 탭 */}
          <TabsContent value="sessions" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {session.description}
                        </CardDescription>
                        <p className="text-sm text-gray-600 mt-2">
                          작성자: {session.teacherName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline">{session.targetGrade}</Badge>
                      <Badge variant="secondary">{session.category}</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {session.importCount}회 가져감
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 학습 자료 목록 */}
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                          포함된 학습 자료:
                        </h4>
                        <div className="space-y-1">
                          {session.materials.slice(0, 3).map((material) => (
                            <div key={material.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                              {getMaterialIcon(material.type)}
                              <span className="font-medium">{material.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {material.type}
                              </Badge>
                            </div>
                          ))}
                          {session.materials.length > 3 && (
                            <p className="text-xs text-gray-500 pl-6">
                              +{session.materials.length - 3}개 더
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* 태그 */}
                      <div className="flex flex-wrap gap-1">
                        {session.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          세션 가져오기
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredSessions.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
              </div>
            )}
          </TabsContent>

          {/* 주제 라이브러리 탭 */}
          <TabsContent value="topics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {topic.description}
                        </CardDescription>
                        <p className="text-sm text-gray-600 mt-2">
                          {topic.aiGenerated ? 'AI 생성' : `작성자: ${topic.teacherName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline">{topic.grade}</Badge>
                      <Badge variant="secondary">{topic.subject}</Badge>
                      <Badge variant="outline">{topic.debateType}</Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          topic.difficulty === '초급' ? 'text-green-600' :
                          topic.difficulty === '중급' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}
                      >
                        {topic.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* 상세 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {topic.estimatedTime}분
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {topic.viewCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {topic.useCount}
                          </div>
                        </div>
                      </div>
                      
                      {/* 태그 */}
                      <div className="flex flex-wrap gap-1">
                        {topic.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          주제 사용하기
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredTopics.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결果가 없습니다</h3>
                <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RequireAuth>
  );
}