'use client'

import Header from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import InteractiveMermaid from '@/components/common/InteractiveMermaid'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function GuidePage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      
      {/* 네비게이션 바 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 py-3">
            <button 
              onClick={() => scrollToSection('overview')} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              📖 서비스 개요
            </button>
            <button 
              onClick={() => scrollToSection('ai-features')} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              🤖 AI 기능
            </button>
            <button 
              onClick={() => scrollToSection('collaboration')} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              ⚡ 실시간 협업
            </button>
            <button 
              onClick={() => scrollToSection('quick-start')} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              🚀 빠른 시작
            </button>
            <button 
              onClick={() => scrollToSection('user-guides')} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              👥 사용자 가이드
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              ❓ 자주 묻는 질문
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto space-y-8 px-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 질문톡톡! 논제샘솟! 이용 가이드
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            AI 기반 토론 교육 플랫폼으로 학생들의 창의적 사고와 토론 능력을 키워보세요!
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="default" className="text-sm px-3 py-1">🤖 AI 토론 지원</Badge>
            <Badge variant="success" className="text-sm px-3 py-1">⚡ 실시간 협업</Badge>
            <Badge variant="info" className="text-sm px-3 py-1">📚 교육용 플랫폼</Badge>
            <Badge variant="warning" className="text-sm px-3 py-1">🆓 무료 사용</Badge>
          </div>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>완성도</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-3" />
          </div>
        </div>

        {/* 서비스 개요 */}
        <div id="overview">
          <Card title="🚀 서비스 개요">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-800">💡 혁신적인 AI 토론 교육 플랫폼</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>질문톡톡! 논제샘솟!</strong>은 학생들의 자발적 질문을 바탕으로 AI가 맞춤형 토론 주제를 생성하는 
                차세대 교육 플랫폼입니다. 실시간 협업, 근거자료 검색, 개인별 피드백까지 토론 교육의 모든 과정을 지원합니다.
              </p>
            </div>

            {/* 플랫폼 구조 다이어그램 */}
            <InteractiveMermaid 
              title="📊 플랫폼 구조"
              description="교사와 학생의 토론 세션 참여 과정을 한눈에 확인하세요"
              theme="colorful"
              interactive={true}
              showControls={true}
              chart={`graph TD
    A[👨‍🏫 교사] --> B[세션 생성]
    B --> C[학습자료 제공]
    C --> D[👥 학생 초대]
    D --> E[❓ 질문 수집]
    E --> F[🤖 AI 분석]
    F --> G[📋 토론 주제 생성]
    G --> H[🎯 토론 활동]
    H --> I[📊 결과 분석]
    
    J[👨‍🎓 학생] --> K[세션 참여]
    K --> L[자료 학습]
    L --> M[질문 작성]
    M --> N[토론 참여]
    N --> O[의견 제출]
    O --> P[피드백 받기]
    
    style A fill:#e1f5fe
    style J fill:#f3e5f5
    style F fill:#fff3e0
    style G fill:#e8f5e8`}
              className="mb-6"
            />

            {/* 주요 특징 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-3xl mb-3">🤖</div>
                <h4 className="font-bold text-blue-800 mb-2">AI 기반 분석</h4>
                <p className="text-sm text-blue-700">학생 질문을 분석하여 맞춤형 토론 주제 자동 생성</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="font-bold text-green-800 mb-2">실시간 협업</h4>
                <p className="text-sm text-green-700">Firebase 기반 실시간 질문 공유 및 토론 진행</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h4 className="font-bold text-purple-800 mb-2">스마트 검색</h4>
                <p className="text-sm text-purple-700">AI 근거자료 검색으로 토론 품질 향상</p>
              </div>
            </div>
           </div>
          </Card>
        </div>

        {/* AI 기능 상세 가이드 */}
        <div id="ai-features">
          <Card title="🤖 AI 기반 핵심 기능">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-orange-800">🧠 똑똑한 AI가 제공하는 맞춤형 교육 지원</h3>
              <p className="text-orange-700 mb-6 leading-relaxed">
                최신 AI 기술을 활용하여 학생들의 질문을 분석하고, 교육 목표에 맞는 토론 주제와 근거자료를 자동으로 생성합니다.
              </p>
            </div>

            {/* AI 기능 플로우 */}
            <InteractiveMermaid 
              title="🔄 AI 분석 프로세스"
              description="학생 질문이 어떻게 맞춤형 토론 주제로 변화하는지 확인하세요"
              theme="forest"
              interactive={true}
              showControls={true}
              chart={`graph TD
    A[📝 학생 질문 수집] --> B[🔍 질문 내용 분석]
    B --> C[📊 주제별 분류]
    C --> D[🎯 토론 주제 생성]
    D --> E[📋 찬반 논거 제시]
    E --> F[❓ 핵심 질문 도출]
    F --> G[📚 근거자료 검색]
    G --> H[✅ 최종 결과 제공]
    
    I[🤖 AI 엔진] --> B
    I --> C
    I --> D
    I --> E
    I --> F
    I --> G
    
    style A fill:#e3f2fd
    style I fill:#fff3e0
    style H fill:#e8f5e8`}
              className="mb-6"
            />

            {/* AI 기능 상세 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h4 className="font-bold text-orange-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  토론 주제 생성
                </h4>
                <ul className="space-y-2 text-orange-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>질문 패턴 분석</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>학년별 맞춤 주제</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>다양한 관점 제시</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>교육과정 연계</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔍</span>
                  근거자료 검색
                </h4>
                <ul className="space-y-2 text-yellow-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>YouTube 영상 검색</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>신뢰도 높은 자료</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>다양한 출처 제공</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>실시간 업데이트</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-6 rounded-lg">
                <h4 className="font-bold text-amber-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📊</span>
                  분석 & 피드백
                </h4>
                <ul className="space-y-2 text-amber-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>질문 품질 평가</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>참여도 분석</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>개선 방향 제시</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>학습 성과 추적</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          </Card>
        </div>

        {/* 실시간 기능 가이드 */}
        <div id="collaboration">
          <Card title="⚡ 실시간 협업 기능">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-green-800">🌐 Firebase 기반 실시간 학습 환경</h3>
              <p className="text-green-700 mb-6 leading-relaxed">
                모든 참여자가 동시에 질문을 작성하고, 실시간으로 공유하며, 즉시 피드백을 받을 수 있는 
                혁신적인 협업 학습 환경을 제공합니다.
              </p>
            </div>

            {/* 실시간 기능 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-green-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💬</span>
                  실시간 질문 공유
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                    <p className="text-sm text-green-700">✨ 질문 작성 즉시 모든 참여자에게 공유</p>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                    <p className="text-sm text-green-700">👀 다른 학생들의 질문을 실시간으로 확인</p>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                    <p className="text-sm text-green-700">🔄 질문 수정 시 자동 업데이트</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-teal-50 p-6 rounded-lg">
                <h4 className="font-bold text-teal-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📊</span>
                  실시간 모니터링
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border-l-4 border-teal-400">
                    <p className="text-sm text-teal-700">👥 참여자 현황 실시간 확인</p>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-teal-400">
                    <p className="text-sm text-teal-700">📈 질문 수집 진행률 표시</p>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-teal-400">
                    <p className="text-sm text-teal-700">🎯 세션 단계별 진행 상황</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 실시간 협업 시스템 */}
            <InteractiveMermaid 
              title="🔄 실시간 협업 시스템"
              description="모든 참여자가 실시간으로 연결되는 협업 환경을 경험하세요"
              theme="default"
              interactive={true}
              showControls={true}
              chart={`graph TD
    A[👥 참여자들] --> B[💬 실시간 채팅]
    A --> C[📝 동시 편집]
    A --> D[🔔 즉시 알림]
    
    B --> E[🤖 AI 모더레이션]
    C --> F[📊 변경사항 추적]
    D --> G[📱 다중 디바이스 동기화]
    
    E --> H[💡 토론 가이드]
    F --> I[📈 참여도 분석]
    G --> J[🔄 실시간 업데이트]
    
    style A fill:#e8f5e8
    style E fill:#fff3e0
    style H fill:#e3f2fd`}
              className="mb-6"
            />

            {/* 알림 시스템 */}
            <div className="bg-white border-2 border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-center text-green-800">🔔 스마트 알림 시스템</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">📝</div>
                  <h5 className="font-semibold text-green-800 mb-1">새 질문 알림</h5>
                  <p className="text-sm text-green-600">다른 학생이 질문을 작성하면 즉시 알림</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <h5 className="font-semibold text-green-800 mb-1">AI 분석 완료</h5>
                  <p className="text-sm text-green-600">토론 주제 생성 완료 시 자동 알림</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <h5 className="font-semibold text-green-800 mb-1">단계 진행 알림</h5>
                  <p className="text-sm text-green-600">세션 단계 변경 시 참여자 알림</p>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </div>

        {/* 시작하기 가이드 */}
        <div id="quick-start">
          <Card title="🚀 빠른 시작 가이드">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-indigo-800">⏱️ 5분만에 토론 수업 시작하기</h3>
              <p className="text-indigo-700 leading-relaxed">
                복잡한 설정 없이 간단한 단계만으로 AI 기반 토론 수업을 바로 시작할 수 있습니다.
              </p>
            </div>

            {/* 단계별 가이드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 교사용 시작 가이드 */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-blue-800 flex items-center">
                  <span className="text-2xl mr-2">👨‍🏫</span>
                  교사용 시작 가이드
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h5 className="font-semibold text-blue-800">교사용 페이지 접속</h5>
                      <p className="text-sm text-blue-600">메인 페이지에서 '교사용' 버튼 클릭</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h5 className="font-semibold text-blue-800">학습자료 입력</h5>
                      <p className="text-sm text-blue-600">텍스트 또는 YouTube URL 입력</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h5 className="font-semibold text-blue-800">세션 생성</h5>
                      <p className="text-sm text-blue-600">학년 선택 후 세션 코드 생성</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h5 className="font-semibold text-blue-800">학생 초대</h5>
                      <p className="text-sm text-blue-600">세션 코드를 학생들에게 공유</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 학생용 시작 가이드 */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-purple-800 flex items-center">
                  <span className="text-2xl mr-2">👨‍🎓</span>
                  학생용 시작 가이드
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h5 className="font-semibold text-purple-800">학생용 페이지 접속</h5>
                      <p className="text-sm text-purple-600">메인 페이지에서 '학생용' 버튼 클릭</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h5 className="font-semibold text-purple-800">세션 참여</h5>
                      <p className="text-sm text-purple-600">교사가 제공한 세션 코드 입력</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h5 className="font-semibold text-purple-800">자료 학습</h5>
                      <p className="text-sm text-purple-600">제공된 학습자료 읽기 및 이해</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h5 className="font-semibold text-purple-800">질문 작성</h5>
                      <p className="text-sm text-purple-600">자유롭게 궁금한 점 질문 작성</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 성공 팁 */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold mb-4 text-orange-800 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                성공적인 토론 수업을 위한 팁
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-semibold text-orange-700">📚 교사를 위한 팁</h5>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• 학생들이 이해하기 쉬운 자료 선택</li>
                    <li>• 충분한 질문 작성 시간 제공</li>
                    <li>• AI 분석 결과를 바탕으로 토론 방향 설정</li>
                    <li>• 학생들의 다양한 의견 격려</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-semibold text-orange-700">🎯 학생을 위한 팁</h5>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• 자료를 꼼꼼히 읽고 이해하기</li>
                    <li>• 궁금한 점을 구체적으로 질문하기</li>
                    <li>• 다른 학생들의 질문도 참고하기</li>
                    <li>• 근거자료를 활용하여 의견 뒷받침하기</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          </Card>
        </div>



        {/* 사용자별 가이드 - Tabs로 구분 */}
        <div id="user-guides">
          <Card title="👥 사용자별 완벽 가이드">
            <Tabs defaultValue="teacher" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teacher" className="text-base font-medium">
                  👨‍🏫 교사용 가이드
                </TabsTrigger>
                <TabsTrigger value="student" className="text-base font-medium">
                  👨‍🎓 학생용 가이드
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="teacher" className="mt-6 space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-blue-800">🎯 교사가 얻는 토론 교육의 혁신적 장점</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h4 className="font-semibold text-blue-700">수업 준비 시간 90% 단축</h4>
                          <p className="text-sm text-blue-600">AI가 자동으로 토론 주제와 근거자료를 생성</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📊</span>
                        <div>
                          <h4 className="font-semibold text-blue-700">실시간 학습 현황 파악</h4>
                          <p className="text-sm text-blue-600">학생들의 질문과 참여도를 즉시 모니터링</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎨</span>
                        <div>
                          <h4 className="font-semibold text-blue-700">창의적 토론 수업 설계</h4>
                          <p className="text-sm text-blue-600">학생 질문 기반의 맞춤형 토론 주제 제공</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📈</span>
                        <div>
                          <h4 className="font-semibold text-blue-700">객관적 평가 데이터</h4>
                          <p className="text-sm text-blue-600">개별 학생의 참여도와 사고력 발달 추적</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 교사 워크플로우 */}
                <InteractiveMermaid 
                  title="📋 교사 워크플로우"
                  description="교사가 토론 세션을 진행하는 전체 과정을 단계별로 안내합니다"
                  theme="neutral"
                  interactive={true}
                  showControls={true}
                  chart={`flowchart TD
    A[📚 학습자료 준비] --> B[🔗 세션 생성]
    B --> C[👥 학생 초대]
    C --> D[📝 질문 수집 모니터링]
    D --> E[🤖 AI 분석 요청]
    E --> F[📋 토론 주제 검토]
    F --> G[🎯 토론 활동 진행]
    G --> H[📊 결과 분석]
    
    style A fill:#e3f2fd
    style E fill:#fff3e0
    style G fill:#e8f5e8
    style H fill:#fce4ec`}
                  className="mb-6"
                />

                {/* 교사 기능 상세 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">📚</span>
                      학습자료 관리
                    </h4>
                    <ul className="space-y-2 text-blue-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>텍스트 자료 직접 입력</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>YouTube 영상 URL 연동</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>자료별 학년 수준 설정</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>자료 미리보기 및 편집</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h4 className="font-bold text-indigo-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">👥</span>
                      세션 관리
                    </h4>
                    <ul className="space-y-2 text-indigo-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>간편한 세션 코드 생성</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>실시간 참여자 현황</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>질문 수집 상태 모니터링</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>세션 진행 단계 제어</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="student" className="mt-6 space-y-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-purple-800">🌟 학생이 경험하는 흥미진진한 토론 학습</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🤔</span>
                        <div>
                          <h4 className="font-semibold text-purple-700">창의적 질문 생성 능력 향상</h4>
                          <p className="text-sm text-purple-600">자유로운 질문을 통해 비판적 사고력 개발</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🤝</span>
                        <div>
                          <h4 className="font-semibold text-purple-700">실시간 협업 학습</h4>
                          <p className="text-sm text-purple-600">동료들과 함께 질문을 공유하고 토론 참여</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <h4 className="font-semibold text-purple-700">맞춤형 토론 주제</h4>
                          <p className="text-sm text-purple-600">내 질문이 반영된 흥미로운 토론 주제 제공</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📚</span>
                        <div>
                          <h4 className="font-semibold text-purple-700">근거자료 검색 능력</h4>
                          <p className="text-sm text-purple-600">AI 도움으로 신뢰할 수 있는 자료 찾기</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 학생 워크플로우 */}
                <InteractiveMermaid 
                  title="🎯 학생 학습 여정"
                  description="학생이 토론에 참여하는 단계별 학습 과정을 확인하세요"
                  theme="dark"
                  interactive={true}
                  showControls={true}
                  chart={`flowchart TD
    A[🔗 세션 참여] --> B[📖 자료 학습]
    B --> C[❓ 질문 작성]
    C --> D[👀 다른 질문 확인]
    D --> E[🤖 AI 토론 주제 확인]
    E --> F[🎯 토론 참여]
    F --> G[📝 의견 작성]
    G --> H[🔍 근거자료 검색]
    H --> I[📊 피드백 받기]
    
    style A fill:#f3e5f5
    style C fill:#fff3e0
    style F fill:#e8f5e8
    style I fill:#e3f2fd`}
                  className="mb-6"
                />

                {/* 학생 기능 상세 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-bold text-purple-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">❓</span>
                      질문 작성 & 공유
                    </h4>
                    <ul className="space-y-2 text-purple-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>자유로운 질문 작성</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>실시간 질문 공유</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>다른 학생 질문 확인</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>질문 수정 및 보완</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-pink-50 p-6 rounded-lg">
                    <h4 className="font-bold text-pink-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🎯</span>
                      토론 참여 & 활동
                    </h4>
                    <ul className="space-y-2 text-pink-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>AI 생성 토론 주제 확인</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>찬성/반대 의견 작성</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>근거자료 검색 및 활용</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>실시간 토론 참여</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        {/* FAQ 섹션 - Accordion으로 개선 */}
        <div id="faq">
          <Card title="❓ 자주 묻는 질문 (FAQ)">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-2 text-red-800 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                궁금한 점이 있으시면 아래 질문들을 확인해보세요!
              </h3>
              <p className="text-red-700 text-sm">각 질문을 클릭하면 자세한 답변을 확인할 수 있습니다.</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="info">계정</Badge>
                    <span>서비스를 이용하기 위해 계정이 필요한가요?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-blue-700">교사는 구글 계정으로 로그인</strong>해야 세션을 생성하고 관리할 수 있습니다. 
                      <strong className="text-green-700">학생은 별도 로그인 없이</strong> 교사가 제공한 세션 코드만으로 참여할 수 있습니다.
                    </p>
                    <div className="mt-3 flex space-x-2">
                      <Badge variant="default">교사: 구글 로그인</Badge>
                      <Badge variant="success">학생: 로그인 불필요</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="success">참여</Badge>
                    <span>몇 명의 학생이 세션에 참여할 수 있나요?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      기본적으로 <strong className="text-green-700">30명 내외</strong>의 학생이 동시에 참여할 수 있습니다. 
                      많은 수의 학생이 동시에 참여할 경우 속도가 느려질 수 있습니다.
                    </p>
                    <div className="mt-3">
                      <Badge variant="success">권장: 30명 이하</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="warning">기록</Badge>
                    <span>이전에 진행한 세션을 다시 확인할 수 있나요?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      네, 교사가 <strong className="text-yellow-700">세션 URL을 저장</strong>해두면 나중에 다시 접근할 수 있습니다. 
                      단, 현재 버전에서는 세션 기록 관리 기능은 제공되지 않습니다.
                    </p>
                    <div className="mt-3">
                      <Badge variant="warning">URL 저장 필요</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="info">AI 기능</Badge>
                    <span>AI가 추천한 논제를 수정할 수 있나요?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      현재 버전에서는 AI가 추천한 논제를 시스템 내에서 직접 수정하는 기능은 제공되지 않습니다. 
                      <strong className="text-blue-700">추천된 논제를 참고하여</strong> 교사와 학생들이 논의하여 필요시 수정하여 사용하시면 됩니다.
                    </p>
                    <div className="mt-3">
                      <Badge variant="info">참고용 활용 권장</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="destructive">안전</Badge>
                    <span>학생들의 부적절한 질문이나 검색이 걱정됩니다.</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-red-700">교육용 안전 필터링 시스템</strong>이 적용되어 있어 
                      부적절한 내용을 자동으로 차단하고 교육적 대안을 제시합니다. 안전한 교육 환경을 보장합니다.
                    </p>
                    <div className="mt-3 flex space-x-2">
                      <Badge variant="destructive">자동 필터링</Badge>
                      <Badge variant="success">교육적 대안 제시</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">검색</Badge>
                    <span>근거자료 검색 기능은 어떻게 작동하나요?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      AI가 토론 주제와 입장(찬성/반대)에 맞는 <strong className="text-purple-700">뉴스 기사, 유튜브 영상</strong> 등을 
                      자동으로 검색하고 선별하여 제공합니다. 모든 자료는 교육적 적합성을 검증한 후 제공됩니다.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">뉴스 기사</Badge>
                      <Badge variant="outline">YouTube 영상</Badge>
                      <Badge variant="outline">교육적 검증</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        {/* 마무리 안내 */}
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚀 지금 바로 시작해보세요!
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              AI 기반 토론 교육으로 학생들의 창의적 사고력과 토론 능력을 키워보세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/teacher/dashboard" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                👨‍🏫 교사용 시작하기
              </a>
              <a 
                href="/" 
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
              >
                👨‍🎓 학생용 시작하기
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}