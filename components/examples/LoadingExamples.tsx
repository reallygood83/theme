'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import LoadingModal from '@/components/common/LoadingModal'
import LoadingSpinner, { PulseLoader, IconSpinner } from '@/components/common/LoadingSpinner'
import LoadingOverlay, { InlineLoading, LoadingSkeleton } from '@/components/common/LoadingOverlay'

export default function LoadingExamples() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'topic-recommendation' | 'scenario-generation'>('topic-recommendation')
  const [showOverlay, setShowOverlay] = useState(false)
  const [loading, setLoading] = useState(false)

  const simulateLoading = (duration = 3000) => {
    setLoading(true)
    setTimeout(() => setLoading(false), duration)
  }

  const showLoadingModal = (type: 'topic-recommendation' | 'scenario-generation') => {
    setModalType(type)
    setShowModal(true)
    setTimeout(() => setShowModal(false), 8000)
  }

  const showLoadingOverlay = () => {
    setShowOverlay(true)
    setTimeout(() => setShowOverlay(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Loading Components Examples</h1>
      
      {/* 모달 로딩 예시 */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🎬 Loading Modals</h2>
        <p className="text-gray-600 mb-4">
          AI 생성 과정에서 사용자 불안감을 줄이는 전문적인 로딩 모달
        </p>
        <div className="flex space-x-4">
          <Button 
            onClick={() => showLoadingModal('topic-recommendation')}
            variant="primary"
          >
            주제 추천 로딩 모달
          </Button>
          <Button 
            onClick={() => showLoadingModal('scenario-generation')}
            variant="secondary"
          >
            시나리오 생성 로딩 모달
          </Button>
        </div>
      </section>

      {/* 스피너 예시 */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">⚙️ Loading Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="font-medium mb-3">기본 스피너</h3>
            <LoadingSpinner 
              size="lg" 
              message="데이터 로딩 중"
              showProgress={true}
              duration={5000}
            />
          </div>
          <div className="text-center">
            <h3 className="font-medium mb-3">펄스 로더</h3>
            <PulseLoader text="처리 중" />
          </div>
          <div className="text-center">
            <h3 className="font-medium mb-3">아이콘 스피너</h3>
            <IconSpinner 
              icon="🎯" 
              text="AI 분석 중..."
            />
          </div>
        </div>
      </section>

      {/* 오버레이 예시 */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📱 Loading Overlays</h2>
        <p className="text-gray-600 mb-4">
          전체 화면을 덮는 로딩 오버레이 컴포넌트
        </p>
        <Button 
          onClick={showLoadingOverlay}
          variant="primary"
        >
          오버레이 로딩 표시
        </Button>
      </section>

      {/* 인라인 로딩 예시 */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🔄 Inline Loading</h2>
        <p className="text-gray-600 mb-4">
          버튼이나 텍스트 내부에 사용하는 작은 로딩 인디케이터
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => simulateLoading()}
            disabled={loading}
            variant="primary"
          >
            {loading ? (
              <InlineLoading text="저장 중" size="sm" />
            ) : (
              '데이터 저장'
            )}
          </Button>
          
          <div className="p-4 border rounded-lg">
            {loading ? (
              <LoadingSkeleton lines={3} />
            ) : (
              <div>
                <h3 className="font-semibold">콘텐츠 제목</h3>
                <p className="text-gray-600">여기에 실제 콘텐츠가 표시됩니다.</p>
                <p className="text-sm text-gray-500">추가 정보나 설명이 들어갑니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 실제 사용 예시 */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">💡 실제 적용 가이드</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">📌</span>
            <div>
              <strong>LoadingModal:</strong> AI 생성과 같은 긴 작업 시 사용 (5-30초)
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">📌</span>
            <div>
              <strong>LoadingOverlay:</strong> 데이터 저장/로딩 시 사용 (1-5초)
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">📌</span>
            <div>
              <strong>InlineLoading:</strong> 버튼 내부나 작은 영역에서 사용
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">📌</span>
            <div>
              <strong>LoadingSkeleton:</strong> 콘텐츠 로딩 중 레이아웃 유지
            </div>
          </div>
        </div>
      </section>

      {/* 로딩 모달 */}
      <LoadingModal 
        isOpen={showModal}
        type={modalType}
        onClose={() => setShowModal(false)}
      />

      {/* 로딩 오버레이 */}
      <LoadingOverlay
        isVisible={showOverlay}
        message="데이터를 처리하고 있습니다"
        submessage="잠시만 기다려주세요..."
        type="spinner"
      />
    </div>
  )
}