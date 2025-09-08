'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface Teacher {
  _id: string;
  email: string;
  name: string;
  school?: string;
  position?: string;
  provider: 'google' | 'email' | 'existing';
  displayName?: string;
  permissions: {
    canCreateSession: boolean;
    canManageStudents: boolean;
    canViewStatistics: boolean;
    isAdmin?: boolean;
  };
  lastLoginAt?: string;
  createdAt: string;
}

// 기존 UserProfile 인터페이스와의 호환성 유지
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // 기존 호환성
  teacher: Teacher | null;
  loading: boolean;
  authMethod: 'firebase' | 'jwt' | null;
  
  // Firebase 인증 메서드
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;
  
  // JWT 인증 메서드
  signInWithCredentials: (email: string, password: string, name?: string, school?: string, position?: string) => Promise<void>;
  signOutJWT: () => void;
  
  // 공통 메서드
  getCurrentUserId: () => string | null;
  hasPermission: (permission: keyof Teacher['permissions']) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  teacher: null,
  loading: true,
  authMethod: null,
  signInWithGoogle: async () => {},
  signOutFirebase: async () => {},
  signInWithCredentials: async () => {},
  signOutJWT: () => {},
  getCurrentUserId: () => null,
  hasPermission: () => false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'firebase' | 'jwt' | null>(null);

  // 기존 호환성을 위한 userProfile 계산
  const userProfile: UserProfile | null = user && teacher ? {
    uid: user.uid,
    displayName: teacher.displayName || teacher.name,
    email: teacher.email,
    role: teacher.permissions.isAdmin ? 'admin' : 'teacher',
    createdAt: new Date(teacher.createdAt).getTime()
  } : teacher && authMethod === 'jwt' ? {
    uid: teacher._id,
    displayName: teacher.displayName || teacher.name,
    email: teacher.email,
    role: teacher.permissions.isAdmin ? 'admin' : 'teacher',
    createdAt: new Date(teacher.createdAt).getTime()
  } : null;

  // Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          setAuthMethod('firebase');
          
          // Firebase 사용자에 대응하는 MongoDB 교사 정보 조회/생성
          const response = await fetch('/api/debate/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              provider: 'google'
            })
          });

          if (response.ok) {
            const data = await response.json();
            setTeacher(data.data);
          }
        } else {
          // JWT 토큰 확인
          const token = localStorage.getItem('auth_token');
          if (token) {
            try {
              const response = await fetch('/api/debate/auth/migrate', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                setTeacher(data.data.teacher);
                setAuthMethod('jwt');
              } else {
                // 유효하지 않은 토큰
                localStorage.removeItem('auth_token');
              }
            } catch (error) {
              console.error('JWT 토큰 검증 실패:', error);
              localStorage.removeItem('auth_token');
            }
          }
          
          setUser(null);
          if (!localStorage.getItem('auth_token')) {
            setTeacher(null);
            setAuthMethod(null);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase Google 로그인
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      throw error;
    }
  };

  // Firebase 로그아웃
  const signOutFirebase = async () => {
    try {
      await signOut(auth);
      setTeacher(null);
      setAuthMethod(null);
    } catch (error) {
      console.error('Firebase 로그아웃 실패:', error);
      throw error;
    }
  };

  // JWT 로그인
  const signInWithCredentials = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string, 
    position?: string
  ) => {
    try {
      const response = await fetch('/api/debate/auth/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          school,
          position
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '로그인 실패');
      }

      const data = await response.json();
      
      // JWT 토큰 저장
      localStorage.setItem('auth_token', data.data.token);
      
      setTeacher(data.data.teacher);
      setAuthMethod('jwt');
    } catch (error) {
      console.error('JWT 로그인 실패:', error);
      throw error;
    }
  };

  // JWT 로그아웃
  const signOutJWT = () => {
    localStorage.removeItem('auth_token');
    setTeacher(null);
    setAuthMethod(null);
  };

  // 현재 사용자 ID 반환
  const getCurrentUserId = (): string | null => {
    if (authMethod === 'firebase' && user) {
      return user.uid;
    } else if (authMethod === 'jwt' && teacher) {
      return teacher._id;
    }
    return null;
  };

  // 권한 확인
  const hasPermission = (permission: keyof Teacher['permissions']): boolean => {
    if (!teacher) return false;
    return teacher.permissions[permission] === true;
  };

  const value: AuthContextType = {
    user,
    userProfile, // 기존 호환성
    teacher,
    loading,
    authMethod,
    signInWithGoogle,
    signOutFirebase,
    signInWithCredentials,
    signOutJWT,
    getCurrentUserId,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}