'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Users, 
  Lightbulb, 
  Target, 
  ArrowRight, 
  CheckCircle2,
  PlayCircle,
  MessageSquare,
  Brain,
  Zap,
  ChevronUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Award,
  TrendingUp,
  Shield,
  Sparkles,
  GraduationCap,
  UserCheck,
  Settings,
  BarChart3,
  FileText,
  Video,
  Link,
  Upload,
  MessageCircle,
  CheckCircle
} from 'lucide-react'

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showFloatingNav, setShowFloatingNav] = useState(false)

  // 스크롤 시 플로팅 네비게이션 표시
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingNav(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const FloatingNavigation = () => (
    <div className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ${showFloatingNav ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-2 space-y-2">
        <Button
          variant={activeSection === 'overview' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() => scrollToSection('overview')}
        >
          📖 개요
        </Button>
        <Button
          variant={activeSection === 'features' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() => scrollToSection('features')}
        >
          ⚡ 주요기능
        </Button>
        <Button
          variant={activeSection === 'quickstart' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() => scrollToSection('quickstart')}
        >
          🚀 빠른시작
        </Button>
        <Button
          variant={activeSection === 'teacher-guide' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() => scrollToSection('teacher-guide')}
        >
          👨‍🏫 교사용
        </Button>
        <Button
          variant={activeSection === 'student-guide' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() => scrollToSection('student-guide')}
        >
          👨‍🎓 학생용
        </Button>
        <Button
          variant={activeSection === 'faq' ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() => scrollToSection('faq')}
        >
          ❓ FAQ
        </Button>
        <div className="border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8"
            onClick={scrollToTop}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Header />
      <FloatingNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            AI 기반 토론 교육의 새로운 표준
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            질문톡톡! 논제샘솟!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            학생들의 창의적 질문을 AI가 분석하여 맞춤형 토론 주제를 생성하는 혁신적인 교육 플랫폼입니다.
            실시간 협업과 스마트한 학습 지원으로 토론 교육의 새로운 경험을 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" asChild>
              <a href="/teacher/dashboard">
                <GraduationCap className="w-5 h-5 mr-2" />
                교사용 시작하기
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:bg-gray-50" asChild>
              <a href="/">
                <Users className="w-5 h-5 mr-2" />
                학생용 참여하기
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-16 py-16">
        
        {/* Service Overview */}
        <section id="overview" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">📖 서비스 개요</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AI 기술과 교육 전문성이 결합된 차세대 토론 학습 플랫폼
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-4 translate-x-4"></div>
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle>AI 기반 분석</CardTitle>
                <CardDescription>학생 질문을 지능적으로 분석하여 교육적 가치가 높은 토론 주제를 자동 생성합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Google Gemini AI 활용
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    교육과정 연계 분석
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    학년별 맞춤화
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-4 translate-x-4"></div>
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>실시간 협업</CardTitle>
                <CardDescription>Firebase 기반으로 모든 참여자가 동시에 질문하고 토론할 수 있는 실시간 환경을 제공합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    즉시 질문 공유
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    실시간 모니터링
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    다중 기기 동기화
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-4 translate-x-4"></div>
              <CardHeader className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle>맞춤형 교육</CardTitle>
                <CardDescription>학생의 질문 패턴과 관심사를 분석하여 개인별 맞춤형 토론 경험을 제공합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    개별 학습 분석
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    맞춤형 주제 추천
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    학습 성과 추적
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>혁신 포인트:</strong> 기존 토론 교육의 일방적 주제 제시에서 벗어나, 
              학생들의 자발적 궁금증을 바탕으로 한 참여형 토론 교육으로 패러다임을 전환합니다.
            </AlertDescription>
          </Alert>
        </section>

        {/* Key Features */}
        <section id="features" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">⚡ 주요 기능</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              교사와 학생 모두를 위한 강력하고 직관적인 도구들
            </p>
          </div>

          <Tabs defaultValue="teacher" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                교사 기능
              </TabsTrigger>
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                학생 기능
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI 기능
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teacher" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-500" />
                      세션 관리
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">간편한 세션 생성</p>
                          <p className="text-sm text-gray-600">몇 번의 클릭으로 새로운 토론 세션 시작</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">실시간 모니터링</p>
                          <p className="text-sm text-gray-600">학생 참여 현황과 질문 수집 상태 확인</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">세션 공유</p>
                          <p className="text-sm text-gray-600">세션 코드 또는 직접 링크로 학생 참여 지원</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      학습자료 관리
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">텍스트 자료 직접 입력</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-red-500" />
                        <span className="text-sm">YouTube 영상 URL 연동</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">웹 링크 자료 추가</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">파일 업로드 (PDF, DOC, HWP 등)</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">최대 10MB 지원</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      분석 및 보고서
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">질문 품질 분석</p>
                          <p className="text-sm text-gray-600">수집된 질문의 교육적 가치 평가</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">참여도 리포트</p>
                          <p className="text-sm text-gray-600">개별 학생의 참여 수준 및 기여도</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">토론 결과 요약</p>
                          <p className="text-sm text-gray-600">세션별 주요 성과와 개선점 제시</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      AI 도구 지원
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-purple-800">AI 토론 시나리오 생성기</p>
                        <p className="text-sm text-purple-600 mt-1">질문 기반 맞춤형 토론 상황 자동 생성</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-purple-800">AI 근거자료 검색</p>
                        <p className="text-sm text-purple-600 mt-1">신뢰성 있는 뉴스, 유튜브 영상 자동 탐색</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="student" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      질문 작성 및 공유
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">자유로운 질문</p>
                          <p className="text-sm text-gray-600">제한 없이 궁금한 모든 것을 질문</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">실시간 공유</p>
                          <p className="text-sm text-gray-600">작성한 질문이 즉시 모든 참여자에게 공유</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">질문 도우미</p>
                          <p className="text-sm text-gray-600">4가지 관점으로 더 깊은 사고 유도</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-500" />
                      협업 학습
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">다른 질문 확인</p>
                          <p className="text-sm text-gray-600">동료들의 다양한 관점과 궁금증 공유</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">집단 지성</p>
                          <p className="text-sm text-gray-600">여러 질문이 모여 더 풍부한 토론 주제 생성</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">즉시 알림</p>
                          <p className="text-sm text-gray-600">새로운 활동과 업데이트 실시간 알림</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      학습자료 접근
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-purple-800">스마트 토글 UI</p>
                        <p className="text-sm text-purple-600 mt-1">필요할 때만 자료를 펼쳐서 확인</p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          집중력 향상을 위한 단계별 공개
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          다양한 형태의 자료 통합 제공
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          모바일 친화적 인터페이스
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-500" />
                      개인별 학습 지원
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">맞춤형 논제</p>
                          <p className="text-sm text-gray-600">내 질문이 반영된 토론 주제 제공</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">학습 진도 추적</p>
                          <p className="text-sm text-gray-600">개인별 참여 수준과 성장 과정 기록</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">즉시 피드백</p>
                          <p className="text-sm text-gray-600">AI 분석을 통한 실시간 학습 가이드</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              {/* AI 워크플로우 다이어그램 */}
              <Card className="p-8 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">🤖 AI 분석 워크플로우</h3>
                  <p className="text-gray-600">학생 질문부터 토론 논제 생성까지의 전 과정</p>
                </div>
                
                <div className="max-w-6xl mx-auto">
                  {/* 단계별 플로우차트 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="text-center">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <MessageCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">질문 수집</h4>
                        <p className="text-xs text-gray-600">학생들의 다양한 질문과 궁금증</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-purple-400 mx-auto mt-4 hidden md:block transform rotate-90 md:rotate-0" />
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <Brain className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">AI 분석</h4>
                        <p className="text-xs text-gray-600">Gemini AI를 통한 패턴 분석</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-purple-400 mx-auto mt-4 hidden md:block transform rotate-90 md:rotate-0" />
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <Target className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">논제 생성</h4>
                        <p className="text-xs text-gray-600">맞춤형 토론 주제 추천</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-purple-400 mx-auto mt-4 hidden md:block transform rotate-90 md:rotate-0" />
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                          <CheckCircle className="w-8 h-8 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">검증 완료</h4>
                        <p className="text-xs text-gray-600">교육적 적절성 확인</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 상세 설명 박스 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        실시간 처리 성능
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>질문 분석 속도</span>
                          <span className="font-semibold text-purple-600">&lt; 3초</span>
                        </div>
                        <div className="flex justify-between">
                          <span>논제 생성 시간</span>
                          <span className="font-semibold text-purple-600">&lt; 5초</span>
                        </div>
                        <div className="flex justify-between">
                          <span>동시 처리 능력</span>
                          <span className="font-semibold text-purple-600">30명</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        AI 분석 정확도
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span>교육 적합성</span>
                          <span className="font-semibold text-green-600">95%+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>논제 관련성</span>
                          <span className="font-semibold text-green-600">90%+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>학년별 적합성</span>
                          <span className="font-semibold text-green-600">93%+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      질문 분석 엔진
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-blue-800">Google Gemini AI 활용</p>
                        <p className="text-sm text-blue-600 mt-1">최신 언어모델 기반 정교한 분석</p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>🔍 <strong>의도 파악:</strong> 질문의 숨은 의미와 학습 목표 추출</div>
                        <div>📊 <strong>주제 분류:</strong> 관련 있는 질문들의 자동 그룹화</div>
                        <div>🎯 <strong>난이도 조정:</strong> 학년별 수준에 맞는 주제 선별</div>
                        <div>✨ <strong>창의성 평가:</strong> 독창적 사고를 촉진하는 논제 우선 추천</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      논제 생성 시스템
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="font-medium text-yellow-800">스마트 논제 추천</p>
                        <p className="text-sm text-yellow-600 mt-1">교육과정 연계 + 학생 흥미 반영</p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>💡 <strong>다각도 접근:</strong> 한 주제를 여러 관점에서 분석</div>
                        <div>⚖️ <strong>찬반 균형:</strong> 양쪽 입장의 타당한 근거 제시</div>
                        <div>🔗 <strong>연관성 분석:</strong> 현실 사회와의 연결점 도출</div>
                        <div>📈 <strong>발전 가능성:</strong> 심화 토론으로 확장 가능한 주제 우선</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      교육적 안전성
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="font-medium text-green-800">교육용 필터링</p>
                        <p className="text-sm text-green-600 mt-1">부적절한 내용 차단 및 대안 제시</p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>🛡️ <strong>자동 검열:</strong> 교육에 부적합한 내용 사전 차단</div>
                        <div>📚 <strong>교육과정 연계:</strong> 국가교육과정 기준 준수</div>
                        <div>🎓 <strong>연령별 적합성:</strong> 학년 수준에 맞는 내용 선별</div>
                        <div>⚡ <strong>실시간 모니터링:</strong> 지속적인 안전성 검증</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      학습 성과 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-purple-800">개인별 성장 추적</p>
                        <p className="text-sm text-purple-600 mt-1">AI 기반 학습 패턴 분석</p>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>📊 <strong>질문 품질:</strong> 시간에 따른 질문 수준 향상 추적</div>
                        <div>🎯 <strong>참여도 분석:</strong> 적극성과 기여도 정량적 평가</div>
                        <div>💬 <strong>토론 능력:</strong> 논리적 사고력과 표현력 발전 측정</div>
                        <div>🏆 <strong>성장 리포트:</strong> 개별 학습자의 발전 과정 시각화</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Quick Start Guide */}
        <section id="quickstart" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🚀 빠른 시작 가이드</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              5분 내로 AI 기반 토론 수업을 시작할 수 있습니다
            </p>
          </div>

          {/* YouTube 가이드 영상 */}
          <Card className="max-w-5xl mx-auto border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PlayCircle className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-2xl text-blue-800">📹 완벽 가이드 영상</CardTitle>
              </div>
              <CardDescription className="text-lg text-blue-700">
                질문톡톡! 논제샘솟! 사용법을 17분만에 완벽하게 마스터하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://www.youtube.com/embed/HwRvVL0gSA8?si=APfxzMitJM6jHlRG"
                  title="질문톡톡! 논제샘솟! 가이드 영상"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">영상 길이: 17분 41초</span>
                  </div>
                  <div className="w-px h-4 bg-blue-300"></div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">교사/학생 기능 완전 가이드</span>
                  </div>
                  <div className="w-px h-4 bg-blue-300"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    asChild
                  >
                    <a 
                      href="https://youtu.be/HwRvVL0gSA8?si=APfxzMitJM6jHlRG" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <Video className="w-4 h-4" />
                      YouTube에서 보기
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Alert className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <PlayCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎯 추천 시청 방법:</strong> 영상을 먼저 보고 아래 단계별 가이드를 참고하면 더욱 효과적으로 학습할 수 있습니다.
              영상에는 실제 화면 조작과 함께 모든 기능이 자세히 설명되어 있어요!
            </AlertDescription>
          </Alert>

          {/* 사용자 여정 플로우차트 */}
          <Card className="p-8 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 사용자 여정 플로우</h3>
              <p className="text-gray-600">교사와 학생의 전체적인 학습 과정 한눈에 보기</p>
            </div>
            
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 교사 여정 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <h4 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6" />
                    교사 여정 (Teacher Journey)
                  </h4>
                  <div className="space-y-4">
                    {[
                      { icon: UserCheck, title: "구글 로그인", desc: "3초", color: "bg-blue-100 text-blue-600" },
                      { icon: FileText, title: "학습자료 업로드", desc: "1분", color: "bg-green-100 text-green-600" },
                      { icon: Settings, title: "세션 설정", desc: "30초", color: "bg-purple-100 text-purple-600" },
                      { icon: Users, title: "학생 초대", desc: "코드공유", color: "bg-orange-100 text-orange-600" },
                      { icon: BarChart3, title: "실시간 모니터링", desc: "진행중", color: "bg-red-100 text-red-600" }
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{step.title}</p>
                          <p className="text-xs text-gray-600">{step.desc}</p>
                        </div>
                        {index < 4 && <ArrowRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 학생 여정 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100">
                  <h4 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    학생 여정 (Student Journey)
                  </h4>
                  <div className="space-y-4">
                    {[
                      { icon: Globe, title: "세션 접속", desc: "코드입력", color: "bg-blue-100 text-blue-600" },
                      { icon: UserCheck, title: "기본정보 입력", desc: "10초", color: "bg-green-100 text-green-600" },
                      { icon: BookOpen, title: "자료 확인", desc: "2-3분", color: "bg-purple-100 text-purple-600" },
                      { icon: MessageSquare, title: "질문 작성", desc: "자유롭게", color: "bg-orange-100 text-orange-600" },
                      { icon: Target, title: "토론 참여", desc: "AI논제", color: "bg-red-100 text-red-600" }
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{step.title}</p>
                          <p className="text-xs text-gray-600">{step.desc}</p>
                        </div>
                        {index < 4 && <ArrowRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 전체 시간 요약 */}
              <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-amber-800 mb-3 flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    전체 프로세스 소요 시간
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-100">
                      <p className="font-semibold text-amber-700">교사 준비</p>
                      <p className="text-2xl font-bold text-amber-800">3분</p>
                      <p className="text-xs text-amber-600">로그인 + 자료업로드 + 설정</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-100">
                      <p className="font-semibold text-green-700">학생 참여</p>
                      <p className="text-2xl font-bold text-green-800">1분</p>
                      <p className="text-xs text-green-600">접속 + 정보입력 + 질문시작</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                      <p className="font-semibold text-blue-700">AI 분석</p>
                      <p className="text-2xl font-bold text-blue-800">&lt;5초</p>
                      <p className="text-xs text-blue-600">질문분석 + 논제생성</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 교사용 빠른 시작 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  교사용 5단계 시작
                </CardTitle>
                <CardDescription>
                  구글 로그인만으로 바로 시작 가능
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { step: 1, title: "구글 계정으로 로그인", desc: "별도 가입 절차 없이 구글 계정으로 간편 로그인" },
                    { step: 2, title: "학습자료 추가", desc: "텍스트, 영상, 파일 등 다양한 자료 업로드" },
                    { step: 3, title: "세션 생성", desc: "학년과 주제를 선택하여 토론 세션 생성" },
                    { step: 4, title: "학생 초대", desc: "생성된 세션 코드를 학생들에게 공유" },
                    { step: 5, title: "실시간 모니터링", desc: "질문 수집 및 AI 분석 결과 확인" }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full" asChild>
                  <a href="/teacher/dashboard">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    교사용 시작하기
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* 학생용 빠른 시작 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  학생용 4단계 참여
                </CardTitle>
                <CardDescription>
                  회원가입 없이 세션 코드만으로 즉시 참여
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { step: 1, title: "세션 코드 입력", desc: "교사가 제공한 6자리 세션 코드 입력" },
                    { step: 2, title: "기본 정보 입력", desc: "이름과 모둠명 입력 (익명 가능)" },
                    { step: 3, title: "학습자료 확인", desc: "제공된 자료를 읽고 이해하기" },
                    { step: 4, title: "자유로운 질문", desc: "궁금한 점을 자유롭게 질문 작성" }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <a href="/">
                    <Users className="w-4 h-4 mr-2" />
                    학생용 참여하기
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-yellow-800">
              <strong>소요시간:</strong> 교사 준비 3분 + 학생 참여 1분 = 총 4분으로 토론 수업 시작! 
              복잡한 설정이나 소프트웨어 설치 없이 웹브라우저만으로 바로 이용 가능합니다.
            </AlertDescription>
          </Alert>
        </section>

        {/* Teacher Guide */}
        <section id="teacher-guide" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">👨‍🏫 교사용 완벽 가이드</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              효과적인 토론 교육을 위한 모든 도구와 전략
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>🎯 교사가 얻는 핵심 이점</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">수업 준비 시간 90% 단축</h4>
                        <p className="text-sm text-gray-600 mt-1">AI가 자동으로 토론 주제와 근거자료를 생성하여 교사의 수업 준비 부담을 획기적으로 줄입니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">실시간 학습 현황 파악</h4>
                        <p className="text-sm text-gray-600 mt-1">학생들의 질문과 참여도를 즉시 모니터링하여 수업 진행을 유연하게 조정할 수 있습니다.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">창의적 토론 수업 설계</h4>
                        <p className="text-sm text-gray-600 mt-1">학생 질문 기반의 맞춤형 토론 주제로 더욱 흥미롭고 의미 있는 수업을 진행할 수 있습니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">객관적 평가 데이터</h4>
                        <p className="text-sm text-gray-600 mt-1">개별 학생의 참여도와 사고력 발달을 데이터로 추적하여 정확한 평가와 피드백을 제공합니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📱 지원 기기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full text-sm font-medium text-blue-700 mb-4">
                      <Globe className="w-4 h-4" />
                      완전 반응형 지원
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">데스크탑 PC</p>
                        <p className="text-sm text-gray-600">Windows, Mac, Linux</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tablet className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">태블릿</p>
                        <p className="text-sm text-gray-600">iPad, 갤럭시탭, 기타</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">스마트폰</p>
                        <p className="text-sm text-gray-600">iOS, Android</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>권장:</strong> 교사는 큰 화면(PC/태블릿), 학생은 모든 기기 사용 가능
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>📋 교사 워크플로우</CardTitle>
              <CardDescription>
                효과적인 토론 수업을 위한 단계별 가이드
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  { title: "수업 준비", items: ["학습자료 준비", "세션 생성", "세션 코드 공유"], color: "blue" },
                  { title: "질문 수집", items: ["학생 참여 확인", "질문 작성 독려", "실시간 모니터링"], color: "green" },
                  { title: "AI 분석", items: ["질문 분석 요청", "토론 주제 검토", "추가 자료 확인"], color: "purple" },
                  { title: "토론 진행", items: ["주제 발표", "토론 진행", "결과 정리"], color: "orange" }
                ].map((phase, index) => (
                  <div key={index} className="relative">
                    <div className={`bg-${phase.color}-50 border border-${phase.color}-200 rounded-lg p-4`}>
                      <div className={`w-8 h-8 bg-${phase.color}-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3`}>
                        {index + 1}
                      </div>
                      <h4 className={`font-semibold text-${phase.color}-800 mb-2`}>{phase.title}</h4>
                      <ul className={`space-y-1 text-sm text-${phase.color}-700`}>
                        {phase.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 bg-${phase.color}-400 rounded-full mt-1.5 flex-shrink-0`}></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Student Guide */}
        <section id="student-guide" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">👨‍🎓 학생용 완벽 가이드</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              흥미진진한 토론 학습으로 창의적 사고력 키우기
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>🌟 학생이 경험하는 학습 효과</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">창의적 질문 생성 능력</h4>
                        <p className="text-sm text-gray-600 mt-1">자유로운 질문을 통해 비판적 사고력과 문제 해결 능력을 개발합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">협업 학습 경험</h4>
                        <p className="text-sm text-gray-600 mt-1">동료들과 실시간으로 아이디어를 공유하며 집단 지성의 힘을 체험합니다.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">맞춤형 학습 경험</h4>
                        <p className="text-sm text-gray-600 mt-1">내 질문이 반영된 토론 주제로 더욱 의미 있고 재미있는 학습을 경험합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">정보 활용 능력</h4>
                        <p className="text-sm text-gray-600 mt-1">AI 도움으로 신뢰할 수 있는 자료를 찾고 분석하는 능력을 기릅니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 학습 목표</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">비판적 사고력</p>
                        <p className="text-sm text-gray-600">다양한 관점에서 문제 바라보기</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">의사소통 능력</p>
                        <p className="text-sm text-gray-600">논리적이고 명확한 표현력</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">협업 능력</p>
                        <p className="text-sm text-gray-600">타인과 함께 문제 해결하기</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium">정보 활용 능력</p>
                        <p className="text-sm text-gray-600">신뢰성 있는 자료 찾고 활용하기</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🎯 학생 학습 여정</CardTitle>
              <CardDescription>
                토론 세션 참여부터 학습 성과 확인까지
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "세션 참여", items: ["세션 코드 입력", "기본 정보 등록", "자료 확인"], color: "blue" },
                  { title: "질문 작성", items: ["자유로운 질문", "질문 도우미 활용", "실시간 공유"], color: "green" },
                  { title: "토론 참여", items: ["AI 주제 확인", "의견 작성", "근거 자료 활용"], color: "purple" },
                  { title: "학습 정리", items: ["토론 결과 확인", "개인 피드백", "성장 기록"], color: "orange" }
                ].map((phase, index) => (
                  <div key={index} className="relative">
                    <div className={`bg-${phase.color}-50 border border-${phase.color}-200 rounded-lg p-4`}>
                      <div className={`w-8 h-8 bg-${phase.color}-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3`}>
                        {index + 1}
                      </div>
                      <h4 className={`font-semibold text-${phase.color}-800 mb-2`}>{phase.title}</h4>
                      <ul className={`space-y-1 text-sm text-${phase.color}-700`}>
                        {phase.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 bg-${phase.color}-400 rounded-full mt-1.5 flex-shrink-0`}></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section id="faq" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">❓ 자주 묻는 질문</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              서비스 이용 중 궁금한 점들을 해결해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "서비스를 이용하기 위해 계정이 필요한가요?",
                a: "교사는 구글 계정으로 로그인해야 하지만, 학생은 별도 로그인 없이 세션 코드만으로 참여할 수 있습니다.",
                category: "계정 관리"
              },
              {
                q: "몇 명의 학생이 세션에 참여할 수 있나요?",
                a: "기본적으로 30명 내외의 학생이 동시에 참여할 수 있습니다. 더 많은 학생이 참여할 경우 약간의 지연이 있을 수 있습니다.",
                category: "기술 사양"
              },
              {
                q: "이전 세션을 다시 확인할 수 있나요?",
                a: "교사 대시보드에서 생성한 모든 세션을 확인할 수 있으며, 세션별 질문과 분석 결과를 다시 볼 수 있습니다.",
                category: "세션 관리"
              },
              {
                q: "AI가 추천한 논제를 수정할 수 있나요?",
                a: "현재는 시스템 내 직접 수정 기능은 없지만, 추천된 논제를 참고하여 교사와 학생이 함께 논의하여 조정할 수 있습니다.",
                category: "AI 기능"
              },
              {
                q: "부적절한 질문이나 내용이 걱정됩니다.",
                a: "교육용 안전 필터링 시스템이 적용되어 있어 부적절한 내용을 자동으로 차단하고 교육적 대안을 제시합니다.",
                category: "안전성"
              },
              {
                q: "근거자료 검색은 어떻게 작동하나요?",
                a: "AI가 토론 주제에 맞는 신뢰할 수 있는 뉴스 기사, 유튜브 영상 등을 자동으로 검색하고 선별하여 제공합니다.",
                category: "AI 기능"
              },
              {
                q: "모바일에서도 사용할 수 있나요?",
                a: "네, 완전 반응형 디자인으로 스마트폰, 태블릿, PC에서 모두 최적화된 경험을 제공합니다.",
                category: "기술 사양"
              },
              {
                q: "인터넷 연결이 불안정하면 어떻게 되나요?",
                a: "작성 중인 내용은 자동으로 저장되며, 연결이 복구되면 즉시 동기화됩니다. 오프라인 기능도 부분적으로 지원합니다.",
                category: "기술 사양"
              }
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{faq.q}</CardTitle>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {faq.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚀 지금 바로 시작해보세요!
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                AI 기반 토론 교육으로 학생들의 창의적 사고력과 협업 능력을 키우고,<br />
                교사는 더 효과적이고 즐거운 수업을 경험해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all" asChild>
                  <a href="/teacher/dashboard">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    교사용 대시보드
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-2 hover:bg-gray-50" asChild>
                  <a href="/">
                    <Users className="w-5 h-5 mr-2" />
                    학생용 세션 참여
                  </a>
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                🔗 <strong>질문톡톡! 논제샘솟!:</strong> <a href="https://jilmoon.com" className="text-blue-600 hover:underline">JILMOON.COM</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}