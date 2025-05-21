'use client'

import { useState, FormEvent, useEffect } from 'react'
import { ref, onValue, push, set, getDatabase, Database } from 'firebase/database'
import { database } from '@/lib/firebase'
import { initializeApp } from 'firebase/app'
import Card from '../common/Card'
import Button from '../common/Button'
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
      <Card title="용어 정의하기">
        <p className="mb-4 text-gray-600">
          논제에서 중요한 용어의 의미를 모둠원들과 함께 정의해보세요.
        </p>
        
        {initialTerms.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI가 제안한 주요 용어:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {initialTerms.map((item, index) => (
                <li key={index}>
                  <span className="font-medium">{item.term}</span>: {item.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        
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
              용어 정의 추가
            </Button>
          </div>
        </form>
      </Card>
      
      {groupDefinitions.length > 0 && (
        <Card title="우리 모둠의 용어 정의">
          <ul className="space-y-3">
            {groupDefinitions.map((item) => (
              <li key={item.definitionId} className="border-b border-gray-100 pb-3 last:border-0">
                <h3 className="font-medium">{item.term}</h3>
                <p className="text-gray-700">{item.definition}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
      
      {otherGroupDefinitions.length > 0 && (
        <Card title="다른 모둠의 용어 정의">
          <ul className="space-y-4">
            {otherGroupDefinitions.map((item) => (
              <li key={item.definitionId} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium">{item.term}</h3>
                  <span className="text-sm text-gray-500">{item.studentGroup} 모둠</span>
                </div>
                <p className="text-gray-700">{item.definition}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}