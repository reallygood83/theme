'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

interface DebateScenarioLoadingModalProps {
  isVisible: boolean
  currentStep: number
  mode: 'analysis' | 'generation'
  onClose: () => void
}

// AI 토론 시나리오 생성 단계 정의 - 향상된 메시지와 애니메이션
const DEBATE_SCENARIO_STEPS = {
  analysis: [
    { text: '🎯 주제 적합성 분석 중...', icon: '🎯', description: 'AI가 입력된 주제의 토론 적합성을 심층 분석하고 있습니다', emoji: '🎯' },
    { text: '📋 체크리스트 검토 중...', icon: '📋', description: '토론 주제의 교육적 가치와 실현 가능성을 평가하고 있습니다', emoji: '📋' },
    { text: '🎓 학습 단계 매칭 중...', icon: '🎓', description: '학생들의 인지 수준과 이해도에 맞는 주제인지 확인하고 있습니다', emoji: '🎓' },
    { text: '💡 최적 주제 추천 생성 중...', icon: '💡', description: '교육 효과가 극대화된 토론 주제를 AI가 추천하고 있습니다', emoji: '💡' },
    { text: '✅ 최종 품질 검토 중...', icon: '✅', description: '생성된 추천 주제의 완성도를 최종 검토하고 있습니다', emoji: '✅' },
    { text: '🎉 주제 분석 완료!', icon: '🎉', description: '완벽한 토론 주제 분석이 성공적으로 완료되었습니다', emoji: '🎉' }
  ],
  generation: [
    { text: '🧠 토론 주제 심층 분석 중...', icon: '🧠', description: 'AI가 토론 주제의 다양한 관점과 논점을 심층 분석하고 있습니다', emoji: '🧠' },
    { text: '⚖️ 찬반 논거 체계화 중...', icon: '⚖️', description: '균형잡힌 양측 논거를 수집하고 체계적으로 정리하고 있습니다', emoji: '⚖️' },
    { text: '📚 핵심 용어 사전 구축 중...', icon: '📚', description: '토론에 필수적인 전문 용어와 개념을 정리하고 있습니다', emoji: '📚' },
    { text: '🏗️ 토론 시나리오 설계 중...', icon: '🏗️', description: '교육적 효과가 높은 체계적인 토론 구조를 설계하고 있습니다', emoji: '🏗️' },
    { text: '✨ 시나리오 완성도 향상 중...', icon: '✨', description: '생성된 토론 시나리오의 품질을 더욱 향상시키고 있습니다', emoji: '✨' },
    { text: '🎯 토론 시나리오 생성 완료!', icon: '🎯', description: '최고 품질의 완성된 토론 시나리오를 성공적으로 준비했습니다', emoji: '🎯' }
  ]
} as const

export default function DebateScenarioLoadingModal({ 
  isVisible, 
  currentStep, 
  mode,
  onClose 
}: DebateScenarioLoadingModalProps) {
  const [displayStep, setDisplayStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const steps = DEBATE_SCENARIO_STEPS[mode]

  // 시간 경과 추적
  useEffect(() => {
    if (!isVisible) return

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isVisible])

  useEffect(() => {
    if (isVisible && currentStep > 0) {
      const timer = setTimeout(() => {
        setDisplayStep(currentStep)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, currentStep])

  // 분석 완료 시 자동으로 모달 닫기 (6단계에서만)
  useEffect(() => {
    if (displayStep === 6 && isVisible) {
      const autoCloseTimer = setTimeout(() => {
        setIsClosing(true)
        
        setTimeout(() => {
          onClose()
          setIsClosing(false)
          setDisplayStep(0)
          setTimeElapsed(0)
        }, 1000)
      }, 2000) // 완료 메시지를 2초간 표시 후 닫기

      return () => clearTimeout(autoCloseTimer)
    }
  }, [displayStep, isVisible, onClose])

  useEffect(() => {
    // 모달이 닫힐 때 상태 초기화
    if (!isVisible) {
      setDisplayStep(0)
      setTimeElapsed(0)
      setIsClosing(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  const currentStepData = steps[displayStep - 1] || steps[0]
  const expectedTotalTime = mode === 'analysis' ? 35 : 50
  const modeTitle = mode === 'analysis' ? '🎯 AI 토론 주제 추천' : '🏗️ AI 토론 시나리오 생성'
  const modeDescription = mode === 'analysis' 
    ? '토론 주제의 적합성을 분석하고 최적의 주제를 추천합니다'
    : '완성도 높은 토론 시나리오를 체계적으로 생성합니다'
  const progressPercentage = displayStep >= 6 ? 100 : Math.round((timeElapsed / expectedTotalTime) * 100)

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent 
        className={`max-w-md transform transition-all duration-500 ${
          isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center mb-6">
          <div className="relative mb-4 flex justify-center">
            <div className="text-6xl animate-bounce">{currentStepData?.icon || '🤖'}</div>
            {displayStep < 6 && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {modeTitle}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs mb-2">
            {modeDescription}
          </DialogDescription>
          <div className="space-y-1">
            <p className="text-gray-700 text-sm font-medium">
              {currentStepData?.text || 'AI가 작업을 시작합니다...'}
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              {currentStepData?.description || 'AI 분석이 진행 중입니다...'}
            </p>
          </div>
        </DialogHeader>

        {/* 시간 및 진행률 정보 - shadcn/ui Progress 사용 */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span className="font-medium flex items-center gap-1">
              ⏱️ 진행률
            </span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded-md">
              {progressPercentage}% • {timeElapsed}초 경과
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={Math.min(progressPercentage, 100)} 
              className="h-4"
            />
            {displayStep < 6 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-full"></div>
            )}
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              ⏰ 예상: {expectedTotalTime}초
            </span>
            {displayStep < 6 && (
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                ⏳ 남은 시간: 약 {Math.max(0, expectedTotalTime - timeElapsed)}초
              </span>
            )}
            {displayStep >= 6 && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                ✅ 완료됨
              </span>
            )}
          </div>
        </div>

        {/* 단계별 상세 상태 */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = displayStep >= 6 || displayStep > stepNumber
            const isCurrent = displayStep === stepNumber
            const isPending = displayStep < stepNumber

            return (
              <div 
                key={stepNumber}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 border ${
                  isCurrent ? 'bg-blue-50 border-blue-200 shadow-sm' :
                  isCompleted ? 'bg-green-50 border-green-200' :
                  'bg-muted border-border'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-bounce' :
                  isCurrent ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse shadow-lg' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-700' :
                    isCompleted ? 'text-green-700' :
                    'text-muted-foreground'
                  }`}>
                    {step.text}
                  </div>
                  {(isCurrent || isCompleted) && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-blue-400 opacity-30"></div>
                    </div>
                  </div>
                )}
                {isCompleted && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 text-green-500 animate-pulse">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 완료 메시지 - 축하 애니메이션 강화 */}
        {displayStep === 6 && (
          <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
            <div className="text-green-600 text-xl font-bold mb-3 animate-pulse">
              🎉 {mode === 'analysis' ? '토론 주제 분석 완료!' : '토론 시나리오 생성 완료!'}
            </div>
            <div className="text-green-700 text-sm leading-relaxed mb-4">
              {mode === 'analysis' 
                ? '🤖 AI가 교육적 가치가 높은 토론 주제를 성공적으로 분석했습니다!' 
                : '🤖 AI가 학생들의 사고력 향상에 도움이 될 완성도 높은 토론 시나리오를 생성했습니다!'
              }
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-md animate-bounce">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-bold text-green-700">🎯 결과를 확인해주세요!</span>
            </div>
          </div>
        )}

        {/* 진행 중 안내 메시지 - 동기부여 메시지 강화 */}
        {displayStep < 6 && (
          <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-center mb-3">
              <div className="relative mr-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-6 w-6 border border-blue-400 opacity-20"></div>
              </div>
              <span className="text-blue-700 font-bold">🤖 AI가 열심히 작업하고 있습니다</span>
            </div>
            <div className="text-blue-600 text-sm leading-relaxed mb-3">
              {mode === 'analysis' 
                ? '🎯 최고 품질의 분석 결과를 위해 AI가 최선을 다하고 있습니다!' 
                : '📚 학생들의 창의적 사고력 향상을 위한 최적의 시나리오를 제작하고 있습니다!'
              }
            </div>
            <div className="flex items-center justify-center text-xs text-blue-500">
              <span className="bg-blue-100 px-2 py-1 rounded-full font-medium">
                ℹ️ 작업 완료 후 자동으로 닫힙니다
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}