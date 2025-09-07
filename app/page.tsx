'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // 즉시 /platform으로 리다이렉트
    router.replace('/platform')
  }, [router])

  // 리다이렉트 중 표시할 간단한 로딩 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">질문톡톡! 논제샘솟!로 이동 중...</p>
      </div>
    </div>
  )
}