'use client'

import Header from '@/components/common/Header'
import RequireAuth from '@/components/auth/RequireAuth'
import Card from '@/components/common/Card'
import CreateSessionForm from '@/components/teacher/CreateSessionForm'

export default function CreateSessionPage() {
  return (
    <RequireAuth>
      <Header />
      <div className="max-w-4xl mx-auto">
        <Card title="새 토론 세션 만들기" className="mb-8">
          <p className="text-gray-600 mb-6">
            학생들이 질문을 생성할 학습 자료를 제공하고, 선택적으로 키워드를 추가할 수 있습니다.
            생성된 세션 코드를 학생들에게 공유하여 참여를 유도하세요.
          </p>
          
          <CreateSessionForm />
        </Card>
        
        <Card title="세션 운영 안내">
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">1. 세션 생성 및 공유</h3>
              <p className="text-gray-600">
                학습 자료와 키워드를 입력하고 세션을 생성합니다. 생성된 세션 코드를 학생들에게 공유하세요.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">2. 학생 질문 수집</h3>
              <p className="text-gray-600">
                학생들이 학습 자료에 대한 질문을 작성하고 제출하면, 실시간으로 모든 학생들에게 공유됩니다.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">3. AI 분석 시작</h3>
              <p className="text-gray-600">
                충분한 질문이 수집되면 'AI 분석 시작' 버튼을 클릭하여 질문 유목화, 논제 추천, 용어 추출을 시작합니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">4. 토론 활동 진행</h3>
              <p className="text-gray-600">
                AI가 제안한 논제와 용어를 바탕으로 학생들이 모둠별로 토론 활동을 진행합니다.
                모둠별로 논제를 검증하고 주요 용어를 정의하는 활동을 추가할 수 있습니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </RequireAuth>
  )
}