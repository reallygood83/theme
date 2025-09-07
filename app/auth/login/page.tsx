'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Button from '@/components/common/Button'
import { loginUser, loginWithGoogle } from '@/lib/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const redirect = searchParams.get('redirect') || '/teacher/dashboard'
  
  // 로그인 상태라면 리디렉션
  useEffect(() => {
    if (user && !authLoading) {
      // 심사위원 이메일인지 확인
      if (user.email === 'judge@questiontalk.demo') {
        router.push('/teacher/dashboard?viewAs=MSMk1a3iHBfbLzLwwnwpFnwJjS63')
      } else {
        router.push(redirect)
      }
    }
  }, [user, authLoading, router, redirect])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setEmailLoading(true)
      setError(null)
      
      await loginUser(email, password)
      // 리디렉션은 useEffect에서 처리
      
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.')
    } finally {
      setEmailLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      setError(null)
      
      await loginWithGoogle()
      
      // 로그인 성공 시 리디렉션 경로로 이동
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || '구글 로그인 중 오류가 발생했습니다.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {/* 이메일/비밀번호 로그인 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="이메일을 입력하세요"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          
          <button
            type="submit"
            disabled={emailLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {emailLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">또는</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2.5 px-4 hover:bg-gray-50 transition-colors"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657 -6.08,8 -11.303,8c-6.627,0 -12,-5.373 -12,-12c0,-6.627 5.373,-12 12,-12c3.059,0 5.842,1.154 7.961,3.039l5.657,-5.657C34.046,6.053 29.268,4 24,4C12.955,4 4,12.955 4,24c0,11.045 8.955,20 20,20c11.045,0 20,-8.955 20,-20C44,22.659 43.862,21.35 43.611,20.083z" fill="#FFC107" />
                  <path d="M6.306,14.691l6.571,4.819C14.655,15.108 18.961,12 24,12c3.059,0 5.842,1.154 7.961,3.039l5.657,-5.657C34.046,6.053 29.268,4 24,4C16.318,4 9.656,8.337 6.306,14.691z" fill="#FF3D00" />
                  <path d="M24,44c5.166,0 9.86,-1.977 13.409,-5.192l-6.19,-5.238C29.211,35.091 26.715,36 24,36c-5.202,0 -9.619,-3.317 -11.283,-7.946l-6.522,5.025C9.505,39.556 16.227,44 24,44z" fill="#4CAF50" />
                  <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237 -2.231,4.166 -4.087,5.571c0.001,-0.001 0.002,-0.001 0.003,-0.002l6.19,5.238C36.971,39.205 44,34 44,24C44,22.659 43.862,21.35 43.611,20.083z" fill="#1976D2" />
                </svg>
                <span>구글로 로그인</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/auth/register" className="text-primary hover:text-primary-dark font-medium">
              회원가입
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="max-w-md mx-auto p-6 text-center">로딩 중...</div>}>
        <LoginForm />
      </Suspense>
    </>
  );
}