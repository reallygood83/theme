'use client'

import { useState } from 'react'
import Header from '@/components/common/Header'
import RequireAuth from '@/components/auth/RequireAuth'
import Breadcrumb from '@/components/common/Breadcrumb'
import NavigationActions from '@/components/common/NavigationActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateSessionForm from '@/components/teacher/CreateSessionForm'
import DebateScenarioModal from '@/components/teacher/DebateScenarioModal'
import EvidenceSearchModalContainer from '@/components/evidence/EvidenceSearchModalContainer'

export default function CreateSessionPage() {
  const [isDebateScenarioModalOpen, setIsDebateScenarioModalOpen] = useState(false)
  const [isEvidenceSearchModalOpen, setIsEvidenceSearchModalOpen] = useState(false)
  return (
    <RequireAuth>
      <Header />
      <div className="max-container mx-auto px-4 py-6">
        {/* 브레드크럼 네비게이션 */}
        <Breadcrumb 
          items={[
            { label: '교사용', href: '/teacher/dashboard' },
            { label: '대시보드', href: '/teacher/dashboard' },
            { label: '새 토론 세션 만들기' }
          ]}
          className="mb-6"
        />

        {/* 네비게이션 액션 */}
        <NavigationActions 
          backHref="/teacher/dashboard"
          backLabel="대시보드로 돌아가기"
          className="mb-6"
        />

        <div className="space-y-8">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg mb-8">
          <CardHeader className="text-center pb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <CardTitle className="gradient-card text-2xl text-purple-800">✨ 새 토론 세션 만들기</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="gradient-card text-purple-700 text-center mb-6 text-base">
              학생들이 질문을 생성할 학습 자료를 제공하고, 선택적으로 키워드를 추가할 수 있습니다.
              생성된 세션 코드를 학생들에게 공유하여 참여를 유도하세요.
            </CardDescription>
            
            <CreateSessionForm />
          </CardContent>
        </Card>
        
        {/* AI 지원 도구 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 토론 주제 생성 모달 */}
          <Card 
            className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            onClick={() => setIsDebateScenarioModalOpen(true)}
          >
            <CardHeader className="text-center pb-3">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-3 rounded-full w-16 h-16 mx-auto mb-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <CardTitle className="text-xl text-blue-800">🎯 토론 주제 생성하기</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-700 text-center mb-4 text-base">
                AI가 주제별 맞춤 토론 시나리오를 생성해드립니다.
              </CardDescription>
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-200 p-4 rounded-xl">
                <p className="text-sm text-blue-800 font-semibold text-center">
                  💡 클릭하여 AI 토론 주제 생성기 실행
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 근거자료 검색 모달 */}
          <Card 
            className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            onClick={() => setIsEvidenceSearchModalOpen(true)}
          >
            <CardHeader className="text-center pb-3">
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-3 rounded-full w-16 h-16 mx-auto mb-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <CardTitle className="text-xl text-green-800">🔍 근거자료 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-700 text-center mb-4 text-base">
                토론 주제에 대한 신뢰할 수 있는 근거자료를 AI가 찾아드립니다.
              </CardDescription>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 p-4 rounded-xl">
                <p className="text-sm text-green-800 font-semibold text-center">
                  💡 클릭하여 AI 근거자료 검색 실행
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-3 rounded-full w-16 h-16 mx-auto mb-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-orange-800">📝 세션 운영 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-xl p-4">
                <h3 className="font-bold mb-3 text-purple-800 flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3 font-bold">1</span>
                  세션 생성 및 공유
                </h3>
                <p className="text-purple-700 leading-relaxed">
                  학습 자료와 키워드를 입력하고 세션을 생성합니다. 생성된 세션 코드를 학생들에게 공유하세요.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold mb-3 text-blue-800 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3 font-bold">2</span>
                  학생 질문 수집
                </h3>
                <p className="text-blue-700 leading-relaxed">
                  학생들이 학습 자료에 대한 질문을 작성하고 제출하면, 실시간으로 모든 학생들에게 공유됩니다.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 rounded-xl p-4">
                <h3 className="font-bold mb-3 text-green-800 flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3 font-bold">3</span>
                  AI 분석 시작
                </h3>
                <p className="text-green-700 leading-relaxed">
                  충분한 질문이 수집되면 'AI 분석 시작' 버튼을 클릭하여 질문 유목화, 논제 추천, 용어 추출을 시작합니다.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-200 rounded-xl p-4">
                <h3 className="font-bold mb-3 text-orange-800 flex items-center">
                  <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3 font-bold">4</span>
                  토론 활동 진행
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  AI가 제안한 논제와 용어를 바탕으로 학생들이 모둠별로 토론 활동을 진행합니다.
                  모둠별로 논제를 검증하고 주요 용어를 정의하는 활동을 추가할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* 모달 컴포넌트들 */}
      <DebateScenarioModal
        isOpen={isDebateScenarioModalOpen}
        onClose={() => setIsDebateScenarioModalOpen(false)}
      />

      <EvidenceSearchModalContainer
        isOpen={isEvidenceSearchModalOpen}
        onClose={() => setIsEvidenceSearchModalOpen(false)}
        initialTopic=""
      />
        </div>
      </div>
    </RequireAuth>
  )
}