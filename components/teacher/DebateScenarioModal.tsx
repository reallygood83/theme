'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'

// 타입 정의 (기존 타입 재사용)
interface DebateScenario {
  // 신규 스키마 호환 필드 (백엔드 응답)
  title?: string
  topic: string
  purpose: string
  grade: string
  timeLimit: number
  background?: string
  proArguments?: string[]
  conArguments?: string[]
  keyQuestions?: string[]
  expectedOutcomes?: string[]
  materials?: string[]
  teacherTips?: string
  keywords?: string[]
  subject?: string[]
  // 레거시 스키마 호환 필드
  overview?: string
  objectives?: string[]
  preparation?: {
    materials: string[]
    setup: string
    roles: string[]
  }
  process?: {
    step: number
    name: string
    duration: number
    description: string
    activities: string[]
  }[]
  evaluation?: {
    criteria: string[]
    methods: string[]
    rubric: {
      excellent: string
      good: string
      needs_improvement: string
    }
  }
  extensions?: string[]
  references?: string[]
}

interface TopicRecommendation {
  topic: string
  description: string
  pros: string[]
  cons: string[]
  difficulty: string
  timeEstimate: number
}

interface DebateScenarioModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DebateScenarioModal({ isOpen, onClose }: DebateScenarioModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(40)
  const [recommendedTopics, setRecommendedTopics] = useState<TopicRecommendation[]>([])
  const [generatedScenario, setGeneratedScenario] = useState<DebateScenario | null>(null)
  const [loading, setLoading] = useState(false)

  // 교육 목적 옵션
  const purposes = [
    { value: '비판적 사고력', label: '비판적 사고력', description: '논리적 분석과 추론 능력 향상' },
    { value: '의사소통 능력', label: '의사소통 능력', description: '효과적인 표현과 경청 기술' },
    { value: '다양한 관점 이해', label: '다양한 관점 이해', description: '다각적 사고와 공감 능력' },
    { value: '민주적 의사결정', label: '민주적 의사결정', description: '합의 형성과 협력적 해결' },
    { value: '창의적 문제해결', label: '창의적 문제해결', description: '혁신적 아이디어 도출' }
  ]

  // 학년 옵션
  const grades = [
    { value: '1', label: '1학년' }, { value: '2', label: '2학년' },
    { value: '3', label: '3학년' }, { value: '4', label: '4학년' },
    { value: '5', label: '5학년' }, { value: '6', label: '6학년' }
  ]

  // 수업 시간 옵션
  const timeLimits = [
    { value: 20, label: '20분 (짧은 토론)' },
    { value: 40, label: '40분 (표준 수업)' },
    { value: 60, label: '60분 (깊이 있는 토론)' },
    { value: 80, label: '80분 (블록타임)' }
  ]

  // 토론 주제 추천 API 호출
  const handleTopicRecommendation = async () => {
    if (!keyword.trim() || !selectedPurpose) {
      alert('키워드와 교육 목적을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/scenario/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          purpose: selectedPurpose,
          grade: selectedGrade || '5'
        })
      })

      const data = await response.json()
      
      if (data.success && data.topics) {
        setRecommendedTopics(data.topics)
        setCurrentStep(2)
      } else {
        throw new Error(data.error || '토론 주제 추천에 실패했습니다.')
      }
    } catch (error) {
      console.error('토론 주제 추천 오류:', error)
      alert('토론 주제 추천 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 시나리오 생성 API 호출
  const handleScenarioGeneration = async (topic: string) => {
    console.log('🚨 handleScenarioGeneration 호출됨!', {
      topic,
      purpose: selectedPurpose,
      grade: selectedGrade,
      timeLimit: selectedTimeLimit,
      timestamp: new Date().toISOString()
    })

    setLoading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45초 타임아웃

      const response = await fetch('/api/scenario/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          purpose: selectedPurpose,
          grade: selectedGrade || '6',
          timeLimit: selectedTimeLimit
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('📊 응답 상태:', {
        status: response.status,
        ok: response.ok
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 서버 응답 오류:', errorText)
        throw new Error(`서버 오류: ${response.status}`)
      }

      console.log('🔄 JSON 파싱 시작...')
      const data = await response.json()
      console.log('📥 시나리오 생성 API 응답:', data)
      console.log('📋 응답 데이터 구조:', {
        dataType: typeof data,
        keys: Object.keys(data || {}),
        success: data?.success,
        hasScenario: !!data?.scenario,
        scenarioKeys: data?.scenario ? Object.keys(data.scenario) : 'no scenario'
      })

      if (data.success && data.scenario) {
        const scenario = data.scenario
        console.log('🔍 시나리오 데이터 검증:', {
          title: scenario.title,
          topic: scenario.topic,
          proArguments: Array.isArray(scenario.proArguments) ? scenario.proArguments.length : 'undefined',
          conArguments: Array.isArray(scenario.conArguments) ? scenario.conArguments.length : 'undefined',
          background: scenario.background ? 'exists' : 'missing'
        })

        // 필수 필드 검증 및 fallback
        if (!scenario.title && !scenario.topic) {
          console.error('❌ 필수 필드(title/topic) 누락')
          throw new Error('시나리오 데이터가 불완전합니다.')
        }

        // 배열 필드 정규화 (빈 배열 fallback)
        const normalizeArray = (arr: any): string[] => {
          if (Array.isArray(arr) && arr.length > 0) return arr.map((v: any) => String(v).trim()).filter(Boolean)
          return []
        }

        const validatedScenario = {
          ...scenario,
          proArguments: normalizeArray(scenario.proArguments || scenario.pros || []),
          conArguments: normalizeArray(scenario.conArguments || scenario.cons || []),
          keyQuestions: normalizeArray(scenario.keyQuestions || []),
          expectedOutcomes: normalizeArray(scenario.expectedOutcomes || scenario.objectives || []),
          materials: normalizeArray(scenario.materials || []),
          keywords: normalizeArray(scenario.keywords || []),
          subject: normalizeArray(scenario.subject || [])
        }

        console.log('✅ 검증된 시나리오 데이터:', {
          proArgumentsCount: validatedScenario.proArguments.length,
          conArgumentsCount: validatedScenario.conArguments.length,
          hasBackground: !!validatedScenario.background
        })

        setGeneratedScenario(validatedScenario)
        setCurrentStep(3)
        console.log('🎉 상태 업데이트 완료')
      } else {
        const errorMessage = data.error || '시나리오 생성에 실패했습니다.'
        console.error('❌ API 실패 응답:', data)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ 토론 시나리오 생성 오류:', error)
      
      let errorMessage = '시나리오 생성 중 오류가 발생했습니다.'
      if ((error as any)?.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(`❌ ${errorMessage}\n\n🔧 해결: 인터넷 연결 확인 후 재시도`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setKeyword('')
    setSelectedPurpose('')
    setSelectedGrade('')
    setRecommendedTopics([])
    setGeneratedScenario(null)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-secondary/10 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">🎯 AI 토론 시나리오 생성기</h2>
              <p className="text-sm text-gray-600">키워드로 맞춤형 토론 시나리오를 생성해보세요</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 1단계: 키워드 및 설정 입력 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  토론 키워드 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 인공지능, 환경보호, 사회복지..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  교육 목적 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {purposes.map((purpose) => (
                    <button
                      key={purpose.value}
                      onClick={() => setSelectedPurpose(purpose.value)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedPurpose === purpose.value
                          ? 'border-secondary bg-secondary/5 text-secondary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{purpose.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{purpose.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대상 학년
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {grades.map((grade) => (
                      <button
                        key={grade.value}
                        onClick={() => setSelectedGrade(grade.value)}
                        className={`p-2 text-sm border rounded-md transition-colors ${
                          selectedGrade === grade.value
                            ? 'border-secondary bg-secondary/5 text-secondary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {grade.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수업 시간
                  </label>
                  <select
                    value={selectedTimeLimit}
                    onChange={(e) => setSelectedTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    {timeLimits.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleTopicRecommendation}
                  disabled={loading || !keyword.trim() || !selectedPurpose}
                  variant="primary"
                >
                  {loading ? '추천 중...' : '🚀 토론 주제 추천받기'}
                </Button>
              </div>
            </div>
          )}

          {/* 2단계: 추천 주제 선택 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">📝 추천 토론 주제</h4>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← 다시 설정하기
                </button>
              </div>

              <div className="space-y-3">
                {recommendedTopics.map((topic, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">{topic.topic}</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          topic.difficulty === '초급' ? 'bg-green-100 text-green-700' :
                          topic.difficulty === '중급' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {topic.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{topic.timeEstimate}분</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="font-medium text-green-700 text-xs">찬성 논거</span>
                        <ul className="mt-1 space-y-1">
                          {(topic.pros || []).map((pro, i) => (
                            <li key={i} className="text-green-600 text-xs">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <span className="font-medium text-red-700 text-xs">반대 논거</span>
                        <ul className="mt-1 space-y-1">
                          {(topic.cons || []).map((con, i) => (
                            <li key={i} className="text-red-600 text-xs">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleScenarioGeneration(topic.topic)}
                        disabled={loading}
                        variant="primary"
                        size="sm"
                      >
                        {loading ? '생성 중...' : '이 주제로 시나리오 생성'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3단계: 생성된 시나리오 */}
          {currentStep === 3 && generatedScenario && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">🎉 생성된 토론 시나리오</h4>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← 다른 주제 선택
                </button>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-blue-800 mb-2">{generatedScenario.title || generatedScenario.topic}</h4>
                <p className="text-blue-700 mb-4">{generatedScenario.background || generatedScenario.overview || ''}</p>
                
                {/* 학습 목표 (신규 expectedOutcomes 우선, 레거시 objectives 대체) */}
                {((generatedScenario.expectedOutcomes && generatedScenario.expectedOutcomes.length > 0) || (generatedScenario.objectives && generatedScenario.objectives.length > 0)) && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      🎯 <span className="ml-2">학습 목표</span>
                    </h5>
                    <ul className="space-y-1 text-sm">
                      {(generatedScenario.expectedOutcomes?.length ? generatedScenario.expectedOutcomes : (generatedScenario.objectives || [])).map((obj, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-secondary mr-2">•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 찬성 / 반대 논거 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">⚖️ 찬성 논거</h5>
                    <ul className="space-y-1 text-sm">
                      {(() => {
                        const proArgs = generatedScenario.proArguments || (generatedScenario as any).pros || []
                        if (!Array.isArray(proArgs) || proArgs.length === 0) {
                          return <li className="text-green-800 italic">찬성 논거가 준비되었습니다. (로딩 중)</li>
                        }
                        return proArgs.map((arg: string, index: number) => (
                          <li key={index} className="text-green-800 flex items-start">
                            <span className="mr-2">{index + 1}.</span>
                            <span>{typeof arg === 'string' ? arg : String(arg)}</span>
                          </li>
                        ))
                      })()}
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2">❌ 반대 논거</h5>
                    <ul className="space-y-1 text-sm">
                      {(() => {
                        const conArgs = generatedScenario.conArguments || (generatedScenario as any).cons || []
                        if (!Array.isArray(conArgs) || conArgs.length === 0) {
                          return <li className="text-red-800 italic">반대 논거가 준비되었습니다. (로딩 중)</li>
                        }
                        return conArgs.map((arg: string, index: number) => (
                          <li key={index} className="text-red-800 flex items-start">
                            <span className="mr-2">{index + 1}.</span>
                            <span>{typeof arg === 'string' ? arg : String(arg)}</span>
                          </li>
                        ))
                      })()}
                    </ul>
                  </div>
                </div>

                {/* 핵심 질문 */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                    ❓ <span className="ml-2">핵심 질문</span>
                  </h5>
                  <ul className="space-y-1 text-sm">
                    {(() => {
                      const questions = generatedScenario.keyQuestions || []
                      if (!Array.isArray(questions) || questions.length === 0) {
                        return <li className="text-gray-600 italic">핵심 질문을 준비 중입니다...</li>
                      }
                      return questions.map((q: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-secondary mr-2">Q{index + 1}.</span>
                          <span>{typeof q === 'string' ? q : String(q)}</span>
                        </li>
                      ))
                    })()}
                  </ul>
                </div>

                {/* 수업 진행 과정 (레거시) */}
                {generatedScenario.process && generatedScenario.process.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      ⏰ <span className="ml-2">수업 진행 과정</span>
                    </h5>
                    <div className="space-y-3">
                      {(generatedScenario.process || []).map((step, index) => (
                        <div key={index} className="flex">
                          <div className="flex-shrink-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h6 className="font-medium text-gray-800">{step.name}</h6>
                              <span className="text-xs text-gray-500">{step.duration}분</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                            {step.activities && step.activities.length > 0 && (
                              <div className="text-xs text-gray-500">
                                활동: {(step.activities || []).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 심화 활동 */}
                {generatedScenario.extensions && generatedScenario.extensions.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      🌟 <span className="ml-2">심화 활동</span>
                    </h5>
                    <ul className="text-sm space-y-1">
                      {(generatedScenario.extensions || []).map((ext, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-secondary mr-2">•</span>
                          <span>{ext}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button onClick={handleClose} variant="primary">
                  완료
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}