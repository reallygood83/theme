'use client'

import { useEffect, useState } from 'react'

interface AIAnalysisModalProps {
  isVisible: boolean
  currentStep: number
  onClose: () => void
  onAutoClose?: () => void  // 자동 닫기 콜백 추가
}

const ANALYSIS_STEPS = [
  { id: 1, title: '질문 검토 중', description: '제출된 질문들을 분석하고 있습니다...', icon: '🔍' },
  { id: 2, title: '질문 유목화 중', description: '유사한 질문들을 그룹으로 묶고 있습니다...', icon: '📊' },
  { id: 3, title: '논제 추천 중', description: 'AI가 토론 논제를 생성하고 있습니다...', icon: '🤖' },
  { id: 4, title: '핵심 용어 추출 중', description: '주요 용어들을 추출하고 있습니다...', icon: '🔑' },
  { id: 5, title: '분석 완료!', description: 'AI 분석이 성공적으로 완료되었습니다.', icon: '✅' }
]

export default function AIAnalysisModal({ isVisible, currentStep, onClose, onAutoClose }: AIAnalysisModalProps) {
  const [displayStep, setDisplayStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isVisible && currentStep > 0) {
      // 단계별로 순차적으로 표시
      const timer = setTimeout(() => {
        setDisplayStep(currentStep)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, currentStep])

  // 분석 완료 시 자동으로 모달 닫기
  useEffect(() => {
    if (displayStep === 5 && isVisible) {
      const autoCloseTimer = setTimeout(() => {
        setIsClosing(true)
        
        // 페이드아웃 애니메이션 후 실제 닫기
        setTimeout(() => {
          onAutoClose?.() || onClose()
          setIsClosing(false)
          setDisplayStep(0)
        }, 500) // 페이드아웃 시간
      }, 1500) // 완료 메시지를 1.5초 보여준 후 자동 닫기

      return () => clearTimeout(autoCloseTimer)
    }
  }, [displayStep, isVisible, onClose, onAutoClose])

  if (!isVisible) return null

  const currentStepData = ANALYSIS_STEPS[displayStep - 1] || ANALYSIS_STEPS[0]

  return (
    <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-all duration-500 ${
      isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
    }`}>
      <div className={`bg-white rounded-lg p-8 max-w-md w-full mx-4 relative transform transition-all duration-500 ${
        isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
      }`}>
        {/* 닫기 버튼 (완료 단계에서만 표시) */}
        {displayStep === 5 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        )}

        {/* 진행 상황 헤더 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{currentStepData.icon}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentStepData.description}
          </p>
        </div>

        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>진행률</span>
            <span>{Math.round((displayStep / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(displayStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 단계별 상세 상태 */}
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = displayStep > stepNumber
            const isCurrent = displayStep === stepNumber
            const isPending = displayStep < stepNumber

            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                  isCurrent ? 'bg-blue-50 border border-blue-200' :
                  isCompleted ? 'bg-green-50' :
                  'bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white animate-pulse' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span className={`flex-1 text-sm ${
                  isCurrent ? 'text-blue-700 font-medium' :
                  isCompleted ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {isCurrent && (
                  <div className="flex-shrink-0">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 완료 메시지 (자동 닫기 안내) */}
        {displayStep === 5 && (
          <div className="mt-6 text-center">
            <div className="text-green-600 text-sm font-medium mb-2">
              잠시 후 결과를 보여드리겠습니다...
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              <span className="text-sm text-gray-600">결과 준비 중</span>
            </div>
          </div>
        )}

        {/* 로딩 애니메이션 (진행 중일 때) */}
        {displayStep < 5 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
              잠시만 기다려주세요...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}