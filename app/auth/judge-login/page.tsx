'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Header from '@/components/common/Header'
import Button from '@/components/common/Button'

// 심사위원 전용 계정 정보 (환경변수로 관리)
const JUDGE_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_JUDGE_EMAIL || 'judge@questiontalk.demo',
  password: process.env.NEXT_PUBLIC_JUDGE_PASSWORD || 'JudgeDemo2025!',
  targetUid: 'MSMk1a3iHBfbLzLwwnwpFnwJjS63' // 특정 사용자 UID
}

export default function JudgeLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJudgeLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      // 심사위원 계정으로 로그인
      await signInWithEmailAndPassword(
        auth, 
        JUDGE_CREDENTIALS.email, 
        JUDGE_CREDENTIALS.password
      )

      // 특정 UID 사용자의 대시보드로 리디렉션
      router.push(`/teacher/dashboard?viewAs=${JUDGE_CREDENTIALS.targetUid}`)
      
    } catch (err: any) {
      console.error('Judge login error:', err)
      setError('심사위원 로그인에 실패했습니다. 관리자에게 문의해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              심사위원 로그인
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              질문톡톡! 논제샘솟! 공모전 심사를 위한 전용 로그인입니다
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-800 mb-2">심사 안내</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 데모 계정으로 실제 교사의 대시보드를 확인할 수 있습니다</li>
                  <li>• 세션 생성, 질문 수집, AI 분석 기능을 체험해보세요</li>
                  <li>• 교육현장에서의 실제 활용 사례를 확인할 수 있습니다</li>
                </ul>
              </div>

              <Button
                onClick={handleJudgeLogin}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    심사위원으로 로그인
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>공모전 심사위원님들을 위한 전용 계정입니다</p>
                <p className="mt-1">실제 교사 계정의 데이터를 열람할 수 있습니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}