'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Button from '@/components/common/Button'
import { loginUser } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const redirect = searchParams.get('redirect') || '/teacher/dashboard'
  
  // 로그인 상태라면 리디렉션
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirect)
    }
  }, [user, authLoading, router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('모든 필드를 입력해주세요.')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      await loginUser(email, password)
      
      // 로그인 성공 시 리디렉션 경로로 이동
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              className="py-2.5"
            >
              로그인
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요? {' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}