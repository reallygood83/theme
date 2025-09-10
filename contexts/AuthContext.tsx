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
  permissions?: {
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
  authMethod: 'firebase' | null;
  
  // Firebase 인증 메서드
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;
  
  // JWT 인증 메서드
  signInWithCredentials: (email: string, password: string, name?: string, school?: string, position?: string) => Promise<void>;
  signOutJWT: () => void;
  
  // 공통 메서드
  getCurrentUserId: () => string | null;
  hasPermission: (permission: keyof Teacher['permissions']) => boolean;
  isAdminAccount: () => boolean;
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
  hasPermission: () => false,
  isAdminAccount: () => false
});

// 안전한 Teacher 데이터를 보장하는 helper 함수
const ensureSafeTeacherData = (teacherData: any): Teacher => {
  return {
    ...teacherData,
    permissions: {
      canCreateSession: true,
      canManageStudents: true,
      canViewStatistics: true,
      isAdmin: false,
      ...(teacherData.permissions || {})
    }
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'firebase' | null>(null);

  // 기존 호환성을 위한 userProfile 계산
  const userProfile: UserProfile | null = user && teacher ? {
    uid: user.uid,
    displayName: teacher.displayName || teacher.name,
    email: teacher.email,
    role: teacher.permissions?.isAdmin ? 'admin' : 'teacher',
    createdAt: new Date(teacher.createdAt).getTime()
  } : null;

  // Firebase 인증 상태 감지
  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth가 초기화되지 않았습니다.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          setAuthMethod('firebase');
          
          // Required fields validation before API call
          if (firebaseUser.uid && firebaseUser.email && (firebaseUser.displayName || true)) {
            const name = firebaseUser.displayName || firebaseUser.email!.split('@')[0];
            
            console.log('Creating/updating teacher with:', {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: name,
              provider: 'google'
            });
            
            // Fetch teacher data with timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            try {
              // Firebase 사용자에 대응하는 MongoDB 교사 정보 조회/생성
              const response = await fetch('/api/debate/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firebaseUid: firebaseUser.uid,
                  email: firebaseUser.email!,
                  name: name,
                  provider: 'google'
                }),
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              if (response.ok) {
                const data = await response.json();
                console.log('Teacher API response:', data); // 디버그용 로그
                if (data.success) {
                  // API에서 teacher를 반환하므로 data.teacher 사용하되 안전한 데이터 보장
                  const teacherData = data.teacher || data.data;
                  if (teacherData) {
                    setTeacher(ensureSafeTeacherData(teacherData));
                  } else {
                    console.warn('Teacher API success but no teacher data:', data);
                    // 기본 teacher 객체 생성
                    setTeacher(ensureSafeTeacherData({
                      _id: firebaseUser.uid,
                      email: firebaseUser.email!,
                      name: name,
                      provider: 'google',
                      createdAt: new Date().toISOString()
                    }));
                  }
                } else {
                  console.warn('Teacher API success but no data:', data);
                  // 기본 teacher 객체 생성
                  setTeacher(ensureSafeTeacherData({
                    _id: firebaseUser.uid,
                    email: firebaseUser.email!,
                    name: name,
                    provider: 'google',
                    createdAt: new Date().toISOString()
                  }));
                }
              } else {
                const errorText = await response.text();
                console.error('Teacher API returned non-OK status:', response.status, response.statusText, errorText);
                // API 실패 시에도 기본 teacher 객체 생성하여 무한 로딩 방지
                setTeacher(ensureSafeTeacherData({
                  _id: firebaseUser.uid,
                  email: firebaseUser.email!,
                  name: name,
                  provider: 'google',
                  createdAt: new Date().toISOString()
                }));
              }
            } catch (apiError: any) {
              clearTimeout(timeoutId);
              if (apiError.name === 'AbortError') {
                console.error('Teacher API call timed out after 15s');
              } else {
                console.error('Teacher API call failed:', apiError);
              }
              // API 호출 실패 시에도 기본 teacher 객체 생성
              setTeacher(ensureSafeTeacherData({
                _id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: name,
                provider: 'google',
                createdAt: new Date().toISOString()
              }));
            } finally {
              // API 호출 완료 후 로딩 상태 해제
              setLoading(false);
            }
          } else {
            console.warn('Skipping teacher API call due to missing required fields:', {
              hasUid: !!firebaseUser.uid,
              hasEmail: !!firebaseUser.email,
              hasName: !!firebaseUser.displayName
            });
            // Set basic teacher data even without API call
            const name = firebaseUser.displayName || firebaseUser.email!.split('@')[0];
            setTeacher(ensureSafeTeacherData({
              _id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: name,
              provider: 'google',
              createdAt: new Date().toISOString()
            }));
            setLoading(false);
          }
        } else {
          // JWT 토큰이 있다면 제거 (Firebase 인증으로 통일)
          const token = localStorage.getItem('auth_token');
          if (token) {
            localStorage.removeItem('auth_token');
          }
          
          setUser(null);
          setTeacher(null);
          setAuthMethod(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setLoading(false);
        // Don't crash the entire auth context; continue with basic user state
        if (firebaseUser) {
          setUser(firebaseUser);
          setAuthMethod('firebase');
          // 에러 발생 시에도 기본 teacher 객체 생성
          const name = firebaseUser.displayName || firebaseUser.email!.split('@')[0];
          setTeacher(ensureSafeTeacherData({
            _id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: name,
            provider: 'google',
            createdAt: new Date().toISOString()
          }));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase Google 로그인
  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Auth가 초기화되지 않았습니다.');
    }
    
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
    if (!auth) {
      throw new Error('Firebase Auth가 초기화되지 않았습니다.');
    }
    
    try {
      await signOut(auth);
      setTeacher(null);
      setAuthMethod(null);
    } catch (error) {
      console.error('Firebase 로그아웃 실패:', error);
      throw error;
    }
  };

  // JWT 로그인 (더 이상 지원하지 않음 - Firebase 전용)
  const signInWithCredentials = async (
    email: string, 
    password: string, 
    name?: string, 
    school?: string, 
    position?: string
  ) => {
    throw new Error('JWT 로그인은 더 이상 지원되지 않습니다. Google 로그인을 사용해주세요.');
  };

  // JWT 로그아웃
  const signOutJWT = () => {
    localStorage.removeItem('auth_token');
    setTeacher(null);
    setAuthMethod(null);
  };

  // 현재 사용자 ID 반환 (관리자 계정 매핑 포함)
  const getCurrentUserId = (): string | null => {
    if (authMethod === 'firebase' && user) {
      // judge@questiontalk.demo 계정을 기존 teacherId로 매핑
      if (user.email === 'judge@questiontalk.demo') {
        return 'MSMk1a3iHBfbLzLwwnwpFnwJjS63';
      }
      return user.uid;
    }
    return null;
  };

  // 권한 확인
  const hasPermission = (permission: keyof NonNullable<Teacher['permissions']>): boolean => {
    if (!teacher || !teacher.permissions) return false;
    return teacher.permissions[permission] === true;
  };

  // 관리자 계정 확인
  const isAdminAccount = (): boolean => {
    return user?.email === 'judge@questiontalk.demo';
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
    hasPermission,
    isAdminAccount
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