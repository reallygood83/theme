'use client'

import Header from '@/components/common/Header'
import { Card } from '@/components/common/Card'
import MermaidDiagram from '@/components/common/MermaidDiagram'

export default function GuidePage() {
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto space-y-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 질문톡톡! 논제샘솟! 이용 가이드
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI 기반 토론 교육 플랫폼으로 학생들의 창의적 사고와 토론 능력을 키워보세요!
          </p>
        </div>

        {/* 서비스 개요 */}
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
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-center">📊 플랫폼 구조</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram 
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
                  className="w-full"
                />
              </div>
            </div>

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

        {/* AI 기능 상세 가이드 */}
        <Card title="🤖 AI 기반 핵심 기능">
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-orange-800">🧠 똑똑한 AI가 제공하는 맞춤형 교육 지원</h3>
              <p className="text-orange-700 mb-6 leading-relaxed">
                최신 AI 기술을 활용하여 학생들의 질문을 분석하고, 교육 목표에 맞는 토론 주제와 근거자료를 자동으로 생성합니다.
              </p>
            </div>

            {/* AI 기능 플로우 */}
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-center text-orange-800">🔄 AI 분석 프로세스</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram 
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
                  className="w-full"
                />
              </div>
            </div>

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

        {/* 실시간 기능 가이드 */}
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
            <div className="bg-white border-2 border-green-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-center text-green-800">🔄 실시간 협업 시스템</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram 
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
                  className="w-full"
                />
              </div>
            </div>

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

        {/* 시작하기 가이드 */}
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

        {/* 문의 및 지원 */}
        <Card title="📞 문의 및 지원">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4 text-gray-800">🤝 언제든 도움이 필요하시면 연락주세요!</h3>
            <p className="text-gray-600 mb-6">
              질문톡톡! 논제샘솟! 사용 중 궁금한 점이나 기술적 문제가 있으시면 
              언제든지 문의해 주세요. 더 나은 토론 교육을 위해 지속적으로 개선해 나가겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">📧</div>
                <h4 className="font-semibold text-gray-800">이메일 문의</h4>
                <p className="text-sm text-gray-600">support@questiontalk.edu</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-semibold text-gray-800">실시간 채팅</h4>
                <p className="text-sm text-gray-600">평일 09:00-18:00</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-semibold text-gray-800">사용자 매뉴얼</h4>
                <p className="text-sm text-gray-600">상세 가이드 다운로드</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 교사용 가이드 */}
        <Card title="👨‍🏫 교사용 완벽 가이드">
          <div className="space-y-8">
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
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-center text-blue-800">📋 교사 워크플로우</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram 
                  chart={`flowchart LR
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
                  className="w-full"
                />
              </div>
            </div>

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
          </div>
        </Card>

        {/* 학생용 가이드 */}
        <Card title="👨‍🎓 학생용 완벽 가이드">
          <div className="space-y-8">
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
            <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 text-center text-purple-800">🎯 학생 학습 여정</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <MermaidDiagram 
                  chart={`flowchart LR
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
                  className="w-full"
                />
              </div>
            </div>

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
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="교사 가이드">
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-medium mb-2">1. 세션 생성하기</h3>
                <p className="text-gray-600 text-sm">
                  홈페이지에서 '세션 만들기' 버튼을 클릭하여 새로운 토론 세션을 생성합니다.
                  텍스트 자료 붙여넣기 또는 유튜브 영상 링크를 제공하고, 필요시 키워드를 추가합니다.
                </p>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="font-medium mb-2">2. 학생 초대하기</h3>
                <p className="text-gray-600 text-sm">
                  생성된 세션 코드를 학생들에게 공유하여 세션에 참여하도록 안내합니다.
                  세션 코드는 6자리 영문과 숫자로 구성되어 있습니다.
                </p>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="font-medium mb-2">3. 질문 수집 및 AI 분석</h3>
                <p className="text-gray-600 text-sm">
                  학생들의 질문이 충분히 모이면 '분석 시작' 버튼을 클릭하여 AI 분석을 실행합니다.
                  분석에는 약 10-20초 정도 소요됩니다.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">4. 토론 활동 진행</h3>
                <p className="text-gray-600 text-sm">
                  AI 분석 결과를 바탕으로 토론 활동을 진행합니다.
                  추천된 논제 중 하나를 선택하거나, 학생들이 직접 논제를 수정하여 토론합니다.
                  모둠별로 용어 정의 활동을 진행하여 개념을 명확히 합니다.
                </p>
              </div>
            </div>
          </Card>
          
          <Card title="학생 가이드">
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-medium mb-2">1. 세션 참여하기</h3>
                <p className="text-gray-600 text-sm">
                  교사로부터 받은 세션 코드를 입력하여 토론 세션에 참여합니다.
                  이름과 모둠명을 입력하여 등록합니다.
                </p>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="font-medium mb-2">2. 질문 작성하기</h3>
                <p className="text-gray-600 text-sm">
                  제시된 학습 자료를 보고 다양한 관점에서 질문을 생각합니다.
                  질문 도우미를 참고하여 시간적, 공간적, 사회적, 윤리적 관점에서 질문을 작성합니다.
                  작성한 질문은 다른 학생들과 실시간으로 공유됩니다.
                </p>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="font-medium mb-2">3. 논제 검토하기</h3>
                <p className="text-gray-600 text-sm">
                  AI가 추천한 토론 논제를 검토하고, '좋은 논제 검증 질문'을 활용하여
                  논제의 적합성을 판단합니다.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">4. 용어 정의하기</h3>
                <p className="text-gray-600 text-sm">
                  토론을 위해 주요 용어의 의미를 모둠원들과 함께 정의합니다.
                  AI가 제안한 용어나 직접 선정한 중요 용어를 정의하고 공유합니다.
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <Card title="자주 묻는 질문 (FAQ)">
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-medium mb-2">Q: 서비스를 이용하기 위해 계정이 필요한가요?</h3>
              <p className="text-gray-600">
                A: 아니요, 별도의 계정 생성 없이 교사는 세션을 만들고 학생은 세션 코드로 참여할 수 있습니다.
              </p>
            </div>
            
            <div className="border-b pb-3">
              <h3 className="font-medium mb-2">Q: 몇 명의 학생이 세션에 참여할 수 있나요?</h3>
              <p className="text-gray-600">
                A: 기본적으로 30명 내외의 학생이 동시에 참여할 수 있습니다. 많은 수의 학생이 동시에 참여할 경우 속도가 느려질 수 있습니다.
              </p>
            </div>
            
            <div className="border-b pb-3">
              <h3 className="font-medium mb-2">Q: 이전에 진행한 세션을 다시 확인할 수 있나요?</h3>
              <p className="text-gray-600">
                A: 네, 교사가 세션 URL을 저장해두면 나중에 다시 접근할 수 있습니다. 단, 현재 버전에서는 세션 기록 관리 기능은 제공되지 않습니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Q: AI가 추천한 논제를 수정할 수 있나요?</h3>
              <p className="text-gray-600">
                A: 현재 버전에서는 AI가 추천한 논제를 시스템 내에서 직접 수정하는 기능은 제공되지 않습니다. 
                추천된 논제를 참고하여 교사와 학생들이 논의하여 필요시 수정하여 사용하시면 됩니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}