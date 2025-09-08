'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

// 타입 정의
interface DebateScenario {
  topic: string
  purpose: string
  grade: string
  timeLimit: number
  overview: string
  objectives: string[]
  preparation: {
    materials: string[]
    setup: string
    roles: string[]
  }
  process: {
    step: number
    name: string
    duration: number
    description: string
    activities: string[]
  }[]
  evaluation: {
    criteria: string[]
    methods: string[]
    rubric: {
      excellent: string
      good: string
      needs_improvement: string
    }
  }
  extensions: string[]
  references: string[]
}

interface TopicRecommendation {
  topic: string
  description: string
  pros: string[]
  cons: string[]
  difficulty: string
  timeEstimate: number
}

export default function AdvancedDebateScenarioGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // 1단계: 주제 추천 관련 상태
  const [topicKeyword, setTopicKeyword] = useState('')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [recommendedTopics, setRecommendedTopics] = useState<TopicRecommendation[]>([])
  
  // 2단계: 시나리오 생성 관련 상태  
  const [selectedTopic, setSelectedTopic] = useState('')
  const [timeLimit, setTimeLimit] = useState(40)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [generatedScenario, setGeneratedScenario] = useState<DebateScenario | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // 교육 목적 옵션
  const purposes = [
    { value: '비판적 사고력', label: '비판적 사고력 향상', icon: '🧠' },
    { value: '의사소통 능력', label: '의사소통 능력 개발', icon: '💬' },
    { value: '다양한 관점 이해', label: '다양한 관점 이해', icon: '👁️' },
    { value: '민주적 의사결정', label: '민주적 의사결정 학습', icon: '🗳️' },
    { value: '창의적 문제해결', label: '창의적 문제해결', icon: '💡' }
  ]

  // 학년 옵션
  const grades = [
    { value: '1', label: '1학년' },
    { value: '2', label: '2학년' },
    { value: '3', label: '3학년' },
    { value: '4', label: '4학년' },
    { value: '5', label: '5학년' },
    { value: '6', label: '6학년' }
  ]

  // 수업 시간 옵션
  const timeLimits = [
    { value: 40, label: '40분 (1교시)' },
    { value: 60, label: '60분 (1.5교시)' },
    { value: 80, label: '80분 (2교시)' },
    { value: 100, label: '100분 (2.5교시)' }
  ]

  // 주제 추천 요청
  const handleTopicRecommendation = async () => {
    if (!topicKeyword.trim() || !selectedPurpose || !selectedGrade) {
      alert('키워드, 교육 목적, 학년을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    console.log('🚀 주제 추천 요청 시작:', { keyword: topicKeyword, purpose: selectedPurpose, grade: selectedGrade })
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30초 타임아웃

      const response = await fetch('/api/scenario/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: topicKeyword.trim(),
          purpose: selectedPurpose.trim(),
          grade: selectedGrade.trim()
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📥 API 응답 데이터:', data)

      if (data.success) {
        // 응답 데이터 강화된 검증
        if (!data.topics || !Array.isArray(data.topics) || data.topics.length === 0) {
          console.error('❌ 빈 주제 배열:', data.topics)
          throw new Error('서버에서 유효한 주제를 받지 못했습니다. 다시 시도해주세요.')
        }
        
        // 각 주제의 필수 필드 검증 및 정규화
        const validTopics = data.topics.map((topic: any, index: number) => {
          if (!topic || typeof topic !== 'object') {
            console.warn(`⚠️ 잘못된 주제 형식 [${index}]:`, topic)
            return null
          }

          return {
            topic: topic.topic || topic.title || `토론 주제 ${index + 1}`,
            description: topic.description || '토론 주제에 대한 설명입니다.',
            pros: topic.pros || (topic.proView ? [topic.proView] : ['찬성 의견']),
            cons: topic.cons || (topic.conView ? [topic.conView] : ['반대 의견']),
            difficulty: topic.difficulty || '보통',
            timeEstimate: topic.timeEstimate || 40
          }
        }).filter(Boolean)
        
        if (validTopics.length === 0) {
          console.error('❌ 유효한 주제가 없음:', data.topics)
          throw new Error('받은 주제 데이터의 형식이 올바르지 않습니다. 다시 시도해주세요.')
        }
        
        console.log(`✅ ${validTopics.length}개의 유효한 주제 수신 및 정규화 완료:`, validTopics)
        
        // 상태 업데이트를 더 안정적으로 처리
        setTimeout(() => {
          setRecommendedTopics(validTopics)
          setIsOfflineMode(data.isOffline || false)
          setCurrentStep(2)
          console.log('✅ UI 상태 업데이트 완료')
        }, 100)
        
        // 오프라인 모드 알림
        if (data.isOffline) {
          console.log('📴 오프라인 모드로 동작 중:', data.fallbackReason || 'AI API 사용 불가')
          alert('⚠️ 오프라인 모드로 동작합니다. 기본 템플릿을 사용하여 주제를 추천했습니다.')
        }
      } else {
        const errorMessage = data.error || '주제 추천에 실패했습니다.'
        const details = data.details ? ` (${data.details})` : ''
        console.error('❌ API 실패 응답:', data)
        throw new Error(errorMessage + details)
      }
    } catch (error) {
      console.error('❌ 토론 주제 추천 오류:', error)
      
      // 네트워크 오류 구분
      let errorMessage
      if ((error as any)?.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = '토론 주제 추천 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'
      }
      
      // 디버깅을 위한 상세 로그
      console.log('🔍 오류 발생 시점 상태:', {
        keyword: topicKeyword,
        purpose: selectedPurpose,
        grade: selectedGrade,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      
      alert(`❌ 오류 발생: ${errorMessage}

🔧 해결 방법:
1. 인터넷 연결 상태 확인
2. 잠시 후 다시 시도
3. 문제가 지속되면 페이지 새로고침`)
    } finally {
      setLoading(false)
    }
  }

  // 시나리오 생성 요청
  const handleScenarioGeneration = async () => {
    if (!selectedTopic) {
      alert('토론 주제를 선택해주세요.')
      return
    }

    setLoading(true)
    console.log('🎯 시나리오 생성 요청 시작:', { 
      topic: selectedTopic, 
      purpose: selectedPurpose, 
      grade: selectedGrade, 
      timeLimit: timeLimit 
    })
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45초 타임아웃 (시나리오 생성은 더 오래 걸림)

      const response = await fetch('/api/scenario/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: selectedTopic,
          purpose: selectedPurpose,
          grade: selectedGrade,
          timeLimit: timeLimit,
          additionalInfo: additionalInfo
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📥 시나리오 생성 API 응답:', data)

      if (data.success) {
        if (!data.scenario) {
          throw new Error('서버에서 유효한 시나리오를 받지 못했습니다.')
        }

        console.log('✅ 시나리오 생성 성공:', data.scenario.topic)
        
        // 상태 업데이트를 더 안정적으로 처리
        setTimeout(() => {
          setGeneratedScenario(data.scenario)
          setIsOfflineMode(data.isOffline || false)
          setCurrentStep(3)
          console.log('✅ 시나리오 UI 상태 업데이트 완료')
        }, 100)

        // 오프라인 모드 알림
        if (data.isOffline) {
          console.log('📴 시나리오 오프라인 모드:', data.fallbackReason || 'AI API 사용 불가')
          alert('⚠️ 오프라인 모드로 동작합니다. 기본 템플릿을 사용하여 시나리오를 생성했습니다.')
        }
      } else {
        const errorMessage = data.error || '시나리오 생성에 실패했습니다.'
        const details = data.details ? ` (${data.details})` : ''
        console.error('❌ 시나리오 생성 API 실패:', data)
        throw new Error(errorMessage + details)
      }
    } catch (error) {
      console.error('❌ 토론 시나리오 생성 오류:', error)
      
      // 네트워크 오류 구분
      let errorMessage
      if ((error as any)?.name === 'AbortError') {
        errorMessage = '시나리오 생성 시간이 초과되었습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      } else {
        errorMessage = '토론 시나리오 생성 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'
      }
      
      // 디버깅을 위한 상세 로그
      console.log('🔍 시나리오 생성 오류 발생 시점 상태:', {
        topic: selectedTopic,
        purpose: selectedPurpose,
        grade: selectedGrade,
        timeLimit: timeLimit,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      
      alert(`❌ 시나리오 생성 오류: ${errorMessage}

🔧 해결 방법:
1. 인터넷 연결 상태 확인
2. 잠시 후 다시 시도
3. 문제가 지속되면 페이지 새로고침`)
    } finally {
      setLoading(false)
    }
  }

  // 시나리오를 세션 생성에 활용
  const handleUseForSession = () => {
    if (!generatedScenario) return
    
    const sessionData = {
      title: generatedScenario.topic,
      materials: [{
        type: 'text',
        title: '토론 시나리오',
        content: generateScenarioText(generatedScenario)
      }]
    }
    
    // 세션 생성 페이지로 데이터와 함께 이동
    localStorage.setItem('scenarioData', JSON.stringify(sessionData))
    window.location.href = '/teacher/session/create'
  }

  // 시나리오를 텍스트 형태로 변환
  const generateScenarioText = (scenario: DebateScenario) => {
    return `
🎯 **토론 시나리오: ${scenario.topic || '제목 없음'}**

**📚 개요**
${scenario.overview || '개요 정보가 없습니다.'}

**🎯 학습 목표**
${(scenario.objectives || []).map(obj => `• ${obj}`).join('\n')}

**📋 준비사항**
- 준비물: ${(scenario.preparation?.materials || []).join(', ')}
- 교실 배치: ${scenario.preparation?.setup || '일반 교실 배치'}
- 역할: ${(scenario.preparation?.roles || []).join(', ')}

**⏰ 수업 진행 과정**
${(scenario.process || []).map(step => `
${step.step}단계: ${step.name} (${step.duration}분)
${step.description}
활동: ${(step.activities || []).join(', ')}
`).join('')}

**📊 평가**
- 평가 기준: ${(scenario.evaluation?.criteria || []).join(', ')}
- 평가 방법: ${(scenario.evaluation?.methods || []).join(', ')}

**🌟 심화 활동**
${(scenario.extensions || []).map(ext => `• ${ext}`).join('\n')}

**📚 참고 자료**
${(scenario.references || []).map(ref => `• ${ref}`).join('\n')}
`
  }

  // 초기화
  const resetGenerator = () => {
    setCurrentStep(1)
    setTopicKeyword('')
    setSelectedPurpose('')
    setSelectedGrade('')
    setSelectedTopic('')
    setTimeLimit(40)
    setAdditionalInfo('')
    setRecommendedTopics([])
    setGeneratedScenario(null)
    setIsOfflineMode(false)
  }

  return (
    <Card title="🎯 AI 토론 시나리오 생성기">
      {isOfflineMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600">⚠️</span>
            <span className="ml-2 text-sm text-yellow-800">
              현재 오프라인 모드로 동작합니다. 기본 템플릿을 사용하여 시나리오를 생성합니다.
            </span>
          </div>
        </div>
      )}

      {/* 1단계: 주제 키워드 및 기본 설정 */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">1단계: 기본 정보 입력</h3>
            <p className="text-gray-600 text-sm">토론 주제 키워드와 교육 목적을 입력해주세요</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주제 키워드 *
              </label>
              <input
                type="text"
                value={topicKeyword}
                onChange={(e) => setTopicKeyword(e.target.value)}
                placeholder="예: 환경보호, 디지털기기, 학교생활 등"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                토론하고 싶은 주제와 관련된 키워드를 입력하세요
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                교육 목적 *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {purposes.map((purpose) => (
                  <button
                    key={purpose.value}
                    onClick={() => setSelectedPurpose(purpose.value)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      selectedPurpose === purpose.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{purpose.icon}</span>
                      <span className="font-medium text-sm">{purpose.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 학년 *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {grades.map((grade) => (
                  <button
                    key={grade.value}
                    onClick={() => setSelectedGrade(grade.value)}
                    className={`p-2 text-center border rounded-md transition-colors ${
                      selectedGrade === grade.value
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {grade.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleTopicRecommendation}
                variant="primary"
                disabled={loading || !topicKeyword.trim() || !selectedPurpose || !selectedGrade}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI 주제 분석 중... (최대 30초)</span>
                  </div>
                ) : '🔍 토론 주제 추천받기'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2단계: 추천 주제 선택 및 시나리오 설정 */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">2단계: 주제 선택 및 설정</h3>
            <p className="text-gray-600 text-sm">추천된 주제 중 하나를 선택하고 세부사항을 설정하세요</p>
          </div>

          <div>
            <h4 className="font-medium mb-3">📝 추천 토론 주제</h4>
            <div className="space-y-3">
              {recommendedTopics.map((topic, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTopic === topic.topic
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTopic(topic.topic)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">{topic.topic}</h5>
                      <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-green-700">찬성 논거</span>
                          <ul className="mt-1 space-y-1">
                            {(topic.pros || []).map((pro, i) => (
                              <li key={i} className="text-green-600">• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <span className="font-medium text-red-700">반대 논거</span>
                          <ul className="mt-1 space-y-1">
                            {(topic.cons || []).map((con, i) => (
                              <li key={i} className="text-red-600">• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end text-xs text-gray-500">
                      <span>난이도: {topic.difficulty}</span>
                      <span>예상 시간: {topic.timeEstimate}분</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수업 시간
              </label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {timeLimits.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 고려사항 (선택)
              </label>
              <input
                type="text"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="예: 협력 학습 중심, 모둠별 활동 등"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <Button onClick={() => setCurrentStep(1)} variant="secondary">
              이전으로
            </Button>
            <Button 
              onClick={handleScenarioGeneration}
              variant="primary"
              disabled={loading || !selectedTopic}
            >
              {loading ? '시나리오 생성 중...' : '🎯 토론 시나리오 생성'}
            </Button>
          </div>
        </div>
      )}

      {/* 3단계: 생성된 시나리오 표시 */}
      {currentStep === 3 && generatedScenario && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">3단계: 생성된 토론 시나리오</h3>
            <p className="text-gray-600 text-sm">AI가 생성한 토론 시나리오를 확인하세요</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="mb-4">
              <h4 className="text-xl font-bold text-blue-800 mb-2">{generatedScenario.topic}</h4>
              <div className="flex flex-wrap gap-2 text-sm text-blue-700 mb-3">
                <span>📚 {generatedScenario.purpose}</span>
                <span>👥 {generatedScenario.grade}학년</span>
                <span>⏰ {generatedScenario.timeLimit}분</span>
              </div>
              <p className="text-blue-700">{generatedScenario.overview}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                  🎯 <span className="ml-2">학습 목표</span>
                </h5>
                <ul className="space-y-1 text-sm">
                  {(generatedScenario.objectives || []).map((obj, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                  📋 <span className="ml-2">준비사항</span>
                </h5>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">준비물:</span>
                    <div className="ml-2">{generatedScenario.preparation.materials.join(', ')}</div>
                  </div>
                  <div>
                    <span className="font-medium">역할:</span>
                    <div className="ml-2">{generatedScenario.preparation.roles.join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white p-4 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                ⏰ <span className="ml-2">수업 진행 과정</span>
              </h5>
              <div className="space-y-3">
                {(generatedScenario.process || []).map((step, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-1">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-800">{step.name} ({step.duration}분)</h6>
                      <p className="text-sm text-gray-600 mb-1">{step.description}</p>
                      <div className="text-xs text-gray-500">
                        활동: {step.activities.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                  📊 <span className="ml-2">평가</span>
                </h5>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">기준:</span>
                    <div className="ml-2">{generatedScenario.evaluation.criteria.join(', ')}</div>
                  </div>
                  <div>
                    <span className="font-medium">방법:</span>
                    <div className="ml-2">{generatedScenario.evaluation.methods.join(', ')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                  🌟 <span className="ml-2">심화 활동</span>
                </h5>
                <ul className="text-sm space-y-1">
                  {(generatedScenario.extensions || []).map((ext, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{ext}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <Button onClick={resetGenerator} variant="secondary">
              새 시나리오 생성
            </Button>
            <Button onClick={() => setCurrentStep(2)} variant="secondary">
              설정 수정
            </Button>
            <Button 
              onClick={handleUseForSession}
              variant="primary"
            >
              📝 이 시나리오로 세션 생성
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}