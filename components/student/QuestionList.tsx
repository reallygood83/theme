'use client'

import { useEffect, useState } from 'react'
import { ref, onValue, getDatabase, Database } from 'firebase/database'
import { database } from '@/lib/firebase'
import { initializeApp } from 'firebase/app'
import { Card } from '../common/Card'
import { Question, formatTime } from '@/lib/utils'

interface QuestionListProps {
  sessionId: string
  studentName: string
}

export default function QuestionList({
  sessionId,
  studentName
}: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  
  // 실시간 질문 목록 가져오기
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
    
    const questionsRef = ref(db, `sessions/${sessionId}/questions`)
    
    const unsubscribe = onValue(questionsRef, (snapshot) => {
      const questionsData = snapshot.val()
      
      if (questionsData) {
        const questionsArray = Object.entries(questionsData).map(([key, value]) => ({
          questionId: key,
          ...(value as any)
        }))
        
        // 시간순 정렬 (최신순)
        questionsArray.sort((a, b) => b.createdAt - a.createdAt)
        
        setQuestions(questionsArray)
      } else {
        setQuestions([])
      }
    })
    
    return () => unsubscribe()
  }, [sessionId])

  const myQuestions = questions.filter(q => q.studentName === studentName)
  const otherQuestions = questions.filter(q => q.studentName !== studentName)
  
  return (
    <div className="space-y-6">
      {myQuestions.length > 0 && (
        <Card title="내가 작성한 질문">
          <ul className="space-y-3">
            {myQuestions.map((question) => (
              <li key={question.questionId} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-primary">{question.studentName} (나)</span>
                  <span className="text-sm text-gray-500">{formatTime(question.createdAt)}</span>
                </div>
                <p className="text-gray-800">{question.text}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
      
      <Card title={`다른 학생들의 질문 (${otherQuestions.length})`}>
        {otherQuestions.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            <ul className="space-y-3">
              {otherQuestions.map((question) => (
                <li key={question.questionId} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{question.studentName}</span>
                    <span className="text-sm text-gray-500">{formatTime(question.createdAt)}</span>
                  </div>
                  <p className="text-gray-800">{question.text}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 py-8 text-center">
            아직 다른 학생들의 질문이 없습니다.
          </p>
        )}
      </Card>
    </div>
  )
}