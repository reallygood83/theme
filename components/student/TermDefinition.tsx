'use client'

import { useState, FormEvent, useEffect } from 'react'
import { ref, onValue, push, set, getDatabase, Database } from 'firebase/database'
import { database } from '@/lib/firebase'
import { initializeApp } from 'firebase/app'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { TermDefinition } from '@/lib/utils'

interface TermDefinitionProps {
  sessionId: string
  studentGroup: string
  initialTerms?: {term: string, description: string}[]
}

export default function TermDefinitionComponent({
  sessionId,
  studentGroup,
  initialTerms = []
}: TermDefinitionProps) {
  const [term, setTerm] = useState('')
  const [definition, setDefinition] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [definitions, setDefinitions] = useState<TermDefinition[]>([])
  
  // 기존 용어 정의 목록 가져오기
  useEffect(() => {
    // Firebase 라이브러리가 정상적으로 초기화되었는지 확인
    let db: Database | null = database;
    
    // Firebase 환경 변수 확인 및 필요시 재초기화
    if (!db) {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
          (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
            ? `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` 
            : undefined)
      };
      
      if (!firebaseConfig.databaseURL) {
        console.error('Firebase 설정이 완료되지 않았습니다. 환경 변수를 확인하세요.');
        return;
      }
      
      try {
        const app = initializeApp(firebaseConfig);
        db = getDatabase(app);
      } catch (error) {
        console.error('Firebase 초기화 오류:', error);
        return;
      }
    }
    
    const definitionsRef = ref(db, `sessions/${sessionId}/termDefinitions`)
    
    const unsubscribe = onValue(definitionsRef, (snapshot) => {
      const definitionsData = snapshot.val()
      
      if (definitionsData) {
        const definitionsArray = Object.entries(definitionsData).map(([key, value]) => ({
          definitionId: key,
          ...(value as any)
        }))
        
        setDefinitions(definitionsArray)
      } else {
        setDefinitions([])
      }
    })
    
    return () => unsubscribe()
  }, [sessionId])
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!term.trim() || !definition.trim()) return
    
    setIsSubmitting(true)
    
    try {
      // Firebase 라이브러리가 정상적으로 초기화되었는지 확인
      let db: Database | null = database;
      
      if (!db) {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
            (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
              ? `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` 
              : undefined)
        };
        
        if (!firebaseConfig.databaseURL) {
          throw new Error('Firebase 설정이 완료되지 않았습니다. 환경 변수를 확인하세요.');
        }
        
        const app = initializeApp(firebaseConfig);
        db = getDatabase(app);
      }
      
      // 데이터베이스에 용어 정의 추가
      const definitionsRef = ref(db, `sessions/${sessionId}/termDefinitions`)
      const newDefinitionRef = push(definitionsRef)
      
      await set(newDefinitionRef, {
        sessionId,
        term: term.trim(),
        definition: definition.trim(),
        studentGroup
      })
      
      // 입력 필드 초기화
      setTerm('')
      setDefinition('')
    } catch (error) {
      console.error('용어 정의 추가 오류:', error)
      alert('용어 정의 추가에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 해당 모둠의 정의 목록
  const groupDefinitions = definitions.filter(d => d.studentGroup === studentGroup)
  // 다른 모둠의 정의 목록
  const otherGroupDefinitions = definitions.filter(d => d.studentGroup !== studentGroup)
  
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-full mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">용어 정의하기</h2>
        </div>
        
        <div className="p-4 bg-green-50 text-green-800 rounded-md mb-5">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">중요한 용어의 의미를 모둠원들과 함께 정의해보세요. 용어에 대한 명확한 정의는 토론의 질을 높여줍니다.</p>
          </div>
        </div>
        
        {initialTerms.length > 0 && (
          <div className="mb-6 p-4 border border-green-100 rounded-lg bg-white">
            <h3 className="font-medium text-green-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI가 제안한 주요 용어
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {initialTerms.map((item, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-md">
                  <div className="font-medium text-green-900 mb-1">{item.term}</div>
                  <p className="text-sm text-green-800">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm mb-6">
          <h3 className="font-medium text-gray-800 mb-4">새 용어 정의 추가하기</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
                용어
              </label>
              <input
                id="term"
                type="text"
                className="input-field"
                placeholder="정의할 용어를 입력하세요"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-1">
                정의
              </label>
              <textarea
                id="definition"
                className="textarea-field"
                placeholder="용어에 대한 정의를 입력하세요"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                required
                rows={3}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!term.trim() || !definition.trim() || isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                용어 정의 추가
              </Button>
            </div>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupDefinitions.length > 0 && (
            <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <div className="bg-blue-100 text-blue-700 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                우리 모둠의 용어 정의 ({groupDefinitions.length})
              </h3>
              <div className="divide-y divide-gray-100">
                {groupDefinitions.map((item) => (
                  <div key={item.definitionId} className="py-3">
                    <h4 className="font-medium text-blue-700">{item.term}</h4>
                    <p className="text-gray-700 text-sm mt-1">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {otherGroupDefinitions.length > 0 && (
            <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <div className="bg-purple-100 text-purple-700 p-1 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                다른 모둠의 용어 정의 ({otherGroupDefinitions.length})
              </h3>
              <div className="divide-y divide-gray-100">
                {otherGroupDefinitions.map((item) => (
                  <div key={item.definitionId} className="py-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-purple-700">{item.term}</h4>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {item.studentGroup} 모둠
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}