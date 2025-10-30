'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import { Button } from '@/components/common/Button'
import { resetPassword } from '@/lib/auth'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      await resetPassword(email)
      
      // 비밀번호 재설정 이메일 전송 성공
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">비밀번호 재설정</h1>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                <p>비밀번호 재설정 이메일이 발송되었습니다.</p>
                <p className="text-sm mt-1">
                  이메일의 안내에 따라 비밀번호를 재설정해주세요.
                </p>
              </div>
              
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                로그인 페이지로 돌아가기
              </Link>
            </div>
          ) : (
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
                <p className="mt-1 text-xs text-gray-500">
                  가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                size="lg"
              >
                비밀번호 재설정 이메일 보내기
              </Button>
              
              <div className="text-center mt-4">
                <Link href="/auth/login" className="text-primary hover:underline text-sm">
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}