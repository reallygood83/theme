'use client'

import { useState, FormEvent } from 'react'
import { ref, push, set, getDatabase, Database } from 'firebase/database'
import { database } from '@/lib/firebase'
import { initializeApp } from 'firebase/app'
import { Button } from '../common/Button'
import { Textarea } from '../ui/textarea'

interface QuestionInputProps {
  sessionId: string
  studentName: string
  onQuestionSubmit: () => void
}

export default function QuestionInput({
  sessionId,
  studentName,
  onQuestionSubmit
}: QuestionInputProps) {
  const [questionText, setQuestionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!questionText.trim()) return
    
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
      
      // 데이터베이스에 직접 질문 저장
      const questionData = {
        sessionId,
        studentName,
        text: questionText.trim(),
        createdAt: Date.now()
      };
      
      const questionsRef = ref(db, `sessions/${sessionId}/questions`);
      const newQuestionRef = push(questionsRef);
      await set(newQuestionRef, questionData);
      
      /* 서버리스 환경에서 API 라우트 사용 대신 직접 저장
      // API 엔드포인트에 질문 제출
      const response = await fetch('/api/questions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          studentName,
          text: questionText.trim(),
          createdAt: Date.now()
        }),
      }) */
      
      // 입력 필드 초기화
      setQuestionText('')
      
      // 부모 컴포넌트에 알림
      onQuestionSubmit()
    } catch (error) {
      console.error('질문 제출 오류:', error)
      alert('질문 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">
          질문 작성
        </label>
        <Textarea
          id="questionText"
          placeholder="학습 자료에 대한 질문을 작성해주세요..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
          rows={3}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!questionText.trim() || isSubmitting}
        >
          질문 제출하기
        </Button>
      </div>
    </form>
  )
}