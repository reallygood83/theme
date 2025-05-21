'use client'

import Header from '@/components/common/Header'
import Card from '@/components/common/Card'

export default function GuidePage() {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">질문톡톡! 논제샘솟! 이용 가이드</h1>
        
        <Card title="서비스 소개">
          <p className="text-gray-700 mb-4">
            <strong>질문톡톡! 논제샘솟!</strong>은 학생들이 학습 자료에 대해 질문을 생성하고, 
            AI가 이를 분석하여 토론 논제를 추천하는 교육용 웹 서비스입니다. 
            학생들의 주도적인 질문 생성을 통해 다양한 관점을 발견하고, 
            의미 있는 토론 활동을 준비할 수 있도록 지원합니다.
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-primary/5 p-4 rounded-md">
              <h3 className="font-medium mb-2">교사용 기능</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>학습 자료 제공 (텍스트/유튜브)</li>
                <li>세션 생성 및 학생 초대</li>
                <li>실시간 질문 모니터링</li>
                <li>AI 분석 요청 및 결과 확인</li>
              </ul>
            </div>
            <div className="flex-1 bg-secondary/5 p-4 rounded-md">
              <h3 className="font-medium mb-2">학생용 기능</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>질문 작성 및 제출</li>
                <li>다른 학생들의 질문 확인</li>
                <li>AI 추천 논제 검토</li>
                <li>모둠별 논제 검증 활동</li>
                <li>주요 용어 정의 활동</li>
              </ul>
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