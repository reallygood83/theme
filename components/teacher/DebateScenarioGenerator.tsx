'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

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
    }, 1500)
  }

  const generateProsAndCons = (topic: string, type: 'pros' | 'cons') => {
    // 간단한 키워드 기반 찬반 의견 생성
    const commonPros = ["효율성 증대", "경제적 이익", "사회적 발전", "개인의 자유 확대"]
    const commonCons = ["부작용 우려", "전통적 가치 훼손", "경제적 부담", "사회적 갈등"]
    
    return type === 'pros' ? commonPros.slice(0, 3) : commonCons.slice(0, 3)
  }

  const generateKeyTerms = (topic: string) => {
    return ["사회적 합의", "이해관계자", "공익과 사익"]
  }

  const determineTargetGrade = (score: number) => {
    if (score >= 80) return "고등학교 1-3학년"
    if (score >= 60) return "중학교 1-3학년"
    return "초등학교 5-6학년"
  }

  const determineDifficulty = (score: number) => {
    if (score >= 80) return "고급"
    if (score >= 60) return "중급"
    return "초급"
  }

  const handleSampleTopicSelect = (topic: DebateTopic) => {
    setGeneratedTopic(topic)
    setCurrentStep(3)
  }

  const resetGenerator = () => {
    setCurrentStep(1)
    setTopicInput('')
    setCheckedItems({})
    setGeneratedTopic(null)
  }

  return (
    <Card title="🎯 토론 시나리오 생성기">
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">토론 시나리오를 생성해보세요</h3>
            <p className="text-gray-600 text-sm">직접 주제를 입력하거나 샘플 주제를 선택할 수 있습니다</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                토론 주제 입력
              </label>
              <textarea
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="예: 학교에서 휴대폰 사용을 허용해야 한다"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-center space-x-3">
              <Button 
                onClick={() => setCurrentStep(2)} 
                variant="primary"
                disabled={!topicInput.trim()}
              >
                주제 분석하기
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">또는 샘플 주제 선택</h4>
            <div className="space-y-3">
              {sampleTopics.map((topic, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSampleTopicSelect(topic)}
                >
                  <h5 className="font-medium text-gray-900">{topic.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{topic.targetGrade}</span>
                    <span>{topic.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">토론 주제 적합성 체크리스트</h3>
            <p className="text-gray-600 text-sm mb-4">
              "{topicInput}"이 토론 주제로 적합한지 체크해보세요
            </p>
          </div>

          <div className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={checkedItems[item.id] || false}
                  onChange={() => handleCheckboxChange(item.id)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={item.id} className="text-sm text-gray-700 cursor-pointer">
                  {item.label}
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-3">
            <Button onClick={() => setCurrentStep(1)} variant="secondary">
              이전으로
            </Button>
            <Button onClick={handleTopicAnalysis} variant="primary" disabled={loading}>
              {loading ? '분석 중...' : '시나리오 생성'}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && generatedTopic && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">생성된 토론 시나리오</h3>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="text-xl font-bold text-blue-800 mb-2">{generatedTopic.title}</h4>
            <p className="text-blue-700 mb-4">{generatedTopic.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-semibold text-green-700 mb-2">찬성 논거</h5>
                <ul className="space-y-1">
                  {generatedTopic.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-green-600">• {pro}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-semibold text-red-700 mb-2">반대 논거</h5>
                <ul className="space-y-1">
                  {generatedTopic.cons.map((con, index) => (
                    <li key={index} className="text-sm text-red-600">• {con}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 mb-2">핵심 용어</h5>
              <div className="flex flex-wrap gap-2">
                {generatedTopic.keyTerms.map((term, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {term}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
              <span>권장 학년: {generatedTopic.targetGrade}</span>
              <span>난이도: {generatedTopic.difficulty}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <Button onClick={resetGenerator} variant="secondary">
              새 시나리오 생성
            </Button>
            <Button 
              onClick={() => {
                // 나중에 세션 생성 페이지로 이동하는 기능 추가 가능
                alert('이 시나리오로 토론 세션을 생성하는 기능은 추후 추가될 예정입니다.')
              }} 
              variant="primary"
            >
              이 주제로 세션 생성
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}