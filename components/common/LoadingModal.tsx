'use client'

import { useEffect, useState } from 'react'

interface LoadingModalProps {
  isOpen: boolean
  type: 'topic-recommendation' | 'scenario-generation'
  onClose?: () => void
}

interface LoadingStep {
  id: string
  label: string
  duration: number
  icon: string
}

const LOADING_STEPS = {
  'topic-recommendation': [
    { id: 'analyzing', label: '키워드 분석 중...', duration: 2000, icon: '🔍' },
    { id: 'searching', label: '토론 주제 검색 중...', duration: 3000, icon: '📚' },
    { id: 'evaluating', label: '주제 적합성 평가 중...', duration: 2500, icon: '⚖️' },
    { id: 'generating', label: '추천 목록 생성 중...', duration: 1500, icon: '✨' }
  ],
  'scenario-generation': [
    { id: 'preparing', label: '시나리오 구조 설계 중...', duration: 3000, icon: '🏗️' },
    { id: 'researching', label: '관련 자료 수집 중...', duration: 4000, icon: '📖' },
    { id: 'arguments', label: '찬반 논거 분석 중...', duration: 3500, icon: '💭' },
    { id: 'questions', label: '핵심 질문 생성 중...', duration: 2500, icon: '❓' },
    { id: 'finalizing', label: '시나리오 완성 중...', duration: 2000, icon: '🎯' }
  ]
}

export default function LoadingModal({ isOpen, type, onClose }: LoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')

  const steps = LOADING_STEPS[type]
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setProgress(0)
      setDots('')
      return
    }

    let stepIndex = 0
    let accumulatedTime = 0
    
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex)
        
        // 각 단계별 진행률 애니메이션
        const stepDuration = steps[stepIndex].duration
        const progressPerStep = 100 / steps.length
        const startProgress = (stepIndex / steps.length) * 100
        
        let stepProgress = 0
        const progressInterval = setInterval(() => {
          stepProgress += 2
          const currentProgress = startProgress + (stepProgress / 100) * progressPerStep
          setProgress(Math.min(currentProgress, 100))
          
          if (stepProgress >= 100) {
            clearInterval(progressInterval)
            stepIndex++
            
            if (stepIndex >= steps.length) {
              setProgress(100)
              clearInterval(stepInterval)
            }
          }
        }, stepDuration / 50)
        
        accumulatedTime += stepDuration
      }
    }, 100)

    return () => {
      clearInterval(stepInterval)
    }
  }, [isOpen, steps])

  // 애니메이션 점 효과
  useEffect(() => {
    if (!isOpen) return

    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [isOpen])

  if (!isOpen) return null

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/30 rounded-full animate-spin border-t-white"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">{currentStepData?.icon}</span>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-center">
            {type === 'topic-recommendation' ? 'AI 주제 추천' : 'AI 시나리오 생성'}
          </h3>
          <p className="text-blue-100 text-center text-sm mt-1">
            잠시만 기다려주세요...
          </p>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          {/* 현재 단계 표시 */}
          <div className="text-center mb-6">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              {currentStepData?.label}{dots}
            </div>
            <div className="text-sm text-gray-500">
              단계 {currentStep + 1} / {steps.length}
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* 단계별 아이콘 표시 */}
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                  index < currentStep ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-blue-500 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {index < currentStep ? '✓' : step.icon}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  index <= currentStep ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {step.label.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>

          {/* 팁 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-500 mr-2">💡</div>
              <div className="text-sm text-blue-700">
                {type === 'topic-recommendation' ? 
                  '키워드와 교육 목적에 맞는 최적의 토론 주제를 추천하고 있습니다.' :
                  '선택하신 주제로 구체적이고 실용적인 토론 시나리오를 생성하고 있습니다.'
                }
              </div>
            </div>
          </div>

          {/* 예상 시간 */}
          <div className="text-center mt-4">
            <div className="text-xs text-gray-500">
              예상 소요 시간: {Math.ceil(totalDuration / 1000)}초
            </div>
          </div>
        </div>

        {/* 하단 애니메이션 */}
        <div className="bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}