'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

interface DebateTopic {
  title: string
  description: string
  pros: string[]
  cons: string[]
  keyTerms: string[]
  targetGrade: string
  difficulty: string
}

export default function DebateScenarioGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [topicInput, setTopicInput] = useState('')
  const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({})
  const [generatedTopic, setGeneratedTopic] = useState<DebateTopic | null>(null)
  const [loading, setLoading] = useState(false)

  // 체크리스트 항목들 - 참고자료에서 가져온 평가 기준
  const checklistItems = [
    { id: 'controversial', label: '찬성과 반대 의견이 명확히 나뉠 수 있는가?', category: 'topic-validity' },
    { id: 'balanced', label: '양측 모두 합리적인 근거를 제시할 수 있는가?', category: 'topic-validity' },
    { id: 'age-appropriate', label: '학생들의 연령과 이해 수준에 적합한가?', category: 'student-level' },
    { id: 'interest', label: '학생들이 관심을 가질 만한 주제인가?', category: 'student-level' },
    { id: 'researchable', label: '충분한 자료와 정보를 찾을 수 있는가?', category: 'practicality' },
    { id: 'time-appropriate', label: '주어진 시간 내에 토론하기에 적절한 범위인가?', category: 'practicality' },
    { id: 'ethical', label: '윤리적으로 문제가 없는 주제인가?', category: 'ethics' },
    { id: 'educational', label: '교육적 가치가 있는가?', category: 'ethics' }
  ]

  // 샘플 토론 주제들
  const sampleTopics = [
    {
      title: "교내 휴대폰 사용 허용 여부",
      description: "학교에서 학생들의 휴대폰 사용을 허용해야 하는지에 대한 토론",
      pros: ["긴급상황 대처", "학습 도구 활용", "디지털 리터러시 향상"],
      cons: ["수업 집중력 방해", "사이버 폭력 위험", "대인관계 소외"],
      keyTerms: ["디지털 네이티브", "스마트 러닝", "사이버 에티켓"],
      targetGrade: "중학교 1-3학년",
      difficulty: "중급"
    },
    {
      title: "온라인 수업의 효과성",
      description: "코로나19 이후 확산된 온라인 수업이 기존 대면 수업보다 효과적인지에 대한 토론",
      pros: ["시간과 장소의 자유", "개별 맞춤형 학습", "디지털 활용 능력 향상"],
      cons: ["상호작용 부족", "집중력 저하", "교육 격차 심화"],
      keyTerms: ["에듀테크", "블렌디드 러닝", "디지털 디바이드"],
      targetGrade: "고등학교 1-3학년",
      difficulty: "고급"
    },
    {
      title: "환경보호를 위한 일회용품 사용 금지",
      description: "환경보호를 위해 일회용품 사용을 전면 금지해야 하는지에 대한 토론",
      pros: ["환경오염 감소", "지속가능한 발전", "자원 절약"],
      cons: ["경제적 부담", "생활 불편", "위생 문제"],
      keyTerms: ["지속가능발전", "탄소중립", "순환경제"],
      targetGrade: "초등학교 5-6학년",
      difficulty: "초급"
    }
  ]

  const handleCheckboxChange = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleTopicAnalysis = () => {
    if (!topicInput.trim()) {
      alert('토론 주제를 입력해주세요.')
      return
    }

    setLoading(true)
    
    // 체크된 항목 수에 따라 적합성 판단
    const checkedCount = Object.values(checkedItems).filter(Boolean).length
    const totalCount = checklistItems.length
    const suitabilityScore = (checkedCount / totalCount) * 100

    // 분석 결과 생성 (실제로는 AI API를 호출할 수 있음)
    setTimeout(() => {
      const analysisResult = {
        title: topicInput,
        description: `"${topicInput}"에 대한 토론 시나리오`,
        pros: generateProsAndCons(topicInput, 'pros'),
        cons: generateProsAndCons(topicInput, 'cons'),
        keyTerms: generateKeyTerms(topicInput),
        targetGrade: determineTargetGrade(suitabilityScore),
        difficulty: determineDifficulty(suitabilityScore)
      }
      
      setGeneratedTopic(analysisResult)
      setLoading(false)
      setCurrentStep(3)
    }, 2000)
  }

  // 간단한 찬반 의견 생성 함수
  const generateProsAndCons = (topic: string, type: 'pros' | 'cons') => {
    const prosTemplates = ["효율성 향상", "비용 절약", "접근성 개선", "혁신 촉진", "편의성 증대"]
    const consTemplates = ["부작용 우려", "비용 부담", "형평성 문제", "전통 가치 훼손", "의존성 증가"]
    
    const templates = type === 'pros' ? prosTemplates : consTemplates
    return templates.slice(0, 3).map(template => `${topic}의 ${template}`)
  }

  // 키워드 생성 함수
  const generateKeyTerms = (topic: string) => {
    const commonTerms = ["사회적 합의", "정책적 고려", "윤리적 판단"]
    return [topic.split(' ')[0], ...commonTerms].slice(0, 3)
  }

  // 적합 학년 결정 함수
  const determineTargetGrade = (score: number) => {
    if (score >= 75) return "고등학교 1-3학년"
    if (score >= 50) return "중학교 1-3학년"
    return "초등학교 5-6학년"
  }

  // 난이도 결정 함수
  const determineDifficulty = (score: number) => {
    if (score >= 75) return "고급"
    if (score >= 50) return "중급"
    return "초급"
  }

  const handleSampleTopicSelect = (topic: DebateTopic) => {
    setGeneratedTopic(topic)
    setCurrentStep(3)
  }

  const handleReset = () => {
    setCurrentStep(1)
    setTopicInput('')
    setCheckedItems({})
    setGeneratedTopic(null)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🎯 AI 토론 시나리오 생성기</h1>
        <p className="text-gray-600">
          단계별로 토론 주제를 분석하고 완전한 토론 시나리오를 생성해보세요.
        </p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              <div className={`ml-2 text-sm ${
                currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {step === 1 && '주제 입력'}
                {step === 2 && '적합성 검토'}
                {step === 3 && '시나리오 생성'}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 1단계: 주제 입력 */}
      {currentStep === 1 && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">1단계: 토론 주제 입력</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  토론하고 싶은 주제를 입력하세요
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="예: 학교에서 휴대폰 사용을 허용해야 할까?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-between">
                <div></div>
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!topicInput.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  다음 단계
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 2단계: 적합성 검토 */}
      {currentStep === 2 && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">2단계: 토론 주제 적합성 검토</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>검토할 주제:</strong> {topicInput}
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={item.id}
                    checked={checkedItems[item.id] || false}
                    onChange={() => handleCheckboxChange(item.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={item.id} className="text-sm text-gray-700">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
              >
                이전 단계
              </Button>
              <Button
                onClick={handleTopicAnalysis}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {loading ? '분석 중...' : 'AI 시나리오 생성'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3단계: 생성된 시나리오 */}
      {currentStep === 3 && generatedTopic && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">3단계: 생성된 토론 시나리오</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{generatedTopic.title}</h3>
              <p className="text-gray-600 mb-4">{generatedTopic.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">👍 찬성 의견</h4>
                  <ul className="space-y-1">
                    {generatedTopic.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-gray-700">• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">👎 반대 의견</h4>
                  <ul className="space-y-1">
                    {generatedTopic.cons.map((con, index) => (
                      <li key={index} className="text-sm text-gray-700">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">핵심 용어:</span>
                  <p className="text-gray-700">{generatedTopic.keyTerms.join(', ')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">적합 학년:</span>
                  <p className="text-gray-700">{generatedTopic.targetGrade}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">난이도:</span>
                  <p className="text-gray-700">{generatedTopic.difficulty}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={handleReset}
                variant="outline"
              >
                새로 시작
              </Button>
              <Button
                onClick={() => {
                  alert('토론 시나리오가 클립보드에 복사되었습니다!')
                  // 실제로는 클립보드 복사 기능 구현
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                시나리오 복사
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 샘플 주제 선택 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">📚 샘플 토론 주제</h3>
          <p className="text-sm text-gray-600 mb-4">
            다음 주제들을 참고하여 토론 시나리오를 바로 확인해보세요.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {sampleTopics.map((topic, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => handleSampleTopicSelect(topic)}
              >
                <h4 className="font-medium text-gray-800 mb-2">{topic.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{topic.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{topic.targetGrade}</span>
                  <span>{topic.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}