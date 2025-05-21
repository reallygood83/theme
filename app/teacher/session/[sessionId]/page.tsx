'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/common/Header'
import SessionManager from '@/components/teacher/SessionManager'
import { database } from '@/lib/firebase'
import { ref, get } from 'firebase/database'
import { Session } from '@/lib/utils'

interface SessionPageProps {
  params: {
    sessionId: string
  }
}

export default function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = params
  const searchParams = useSearchParams()
  const sessionCode = searchParams.get('code') || ''
  
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionRef = ref(database, `sessions/${sessionId}`)
        const snapshot = await get(sessionRef)
        
        if (snapshot.exists()) {
          const sessionData = snapshot.val()
          setSession({
            sessionId,
            ...sessionData
          })
        } else {
          setError('세션을 찾을 수 없습니다.')
        }
      } catch (err) {
        console.error('세션 데이터 로드 오류:', err)
        setError('세션 데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSession()
  }, [sessionId])
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">세션 데이터를 불러오는 중...</p>
        </div>
      </>
    )
  }
  
  if (error || !session) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block">
            <p className="font-medium">{error || '세션 데이터를 찾을 수 없습니다.'}</p>
            <p className="mt-2 text-sm">
              올바른 세션 ID를 확인하거나, 새 세션을 생성해주세요.
            </p>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto">
        <SessionManager 
          sessionId={sessionId} 
          sessionCode={sessionCode || session.accessCode}
          initialSessionData={session}
        />
      </div>
    </>
  )
}