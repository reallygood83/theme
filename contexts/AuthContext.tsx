'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, getCurrentUserProfile } from '@/lib/auth'

interface UserProfile {
  uid: string
  displayName: string
  email: string
  role: 'teacher' | 'student' | 'admin'
  createdAt: number
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 인증 상태 변경 시 호출될 콜백 등록
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser)
      
      if (authUser) {
        // 사용자 정보 가져오기
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe()
  }, [])

  const value = {
    user,
    userProfile,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}