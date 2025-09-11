'use client'

import { useState, FormEvent } from 'react'
import { ref, push, set, get, getDatabase, Database } from 'firebase/database'
import { database } from '@/lib/firebase'
import { initializeApp } from 'firebase/app'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface DebateOpinionInputProps {
  sessionId: string
  sessionCode: string  // URL에서 자동으로 전달받은 세션 코드
  studentName: string  // 이미 입력된 학생 이름
  studentGroup: string // 이미 입력된 모둠명
  onOpinionSubmit: () => void
}

export default function DebateOpinionInput({
  sessionId,
  sessionCode,
  studentName,
  studentGroup,
  onOpinionSubmit
}: DebateOpinionInputProps) {
  const [opinionText, setOpinionText] = useState('')
  const [selectedAgenda, setSelectedAgenda] = useState('')
  const [position, setPosition] = useState<'agree' | 'disagree' | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 논제는 이제 사용자가 직접 입력하므로 불러올 필요 없음
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 DebateOpinionInput 제출 시작:', {
      sessionId: sessionId,
      sessionCode: sessionCode,
      studentName: studentName,
      studentGroup: studentGroup,
      selectedAgenda: selectedAgenda,
      position: position,
      opinionText길이: opinionText.trim().length,
      sessionId타입: typeof sessionId,
      sessionId길이: sessionId ? sessionId.length : 'null'
    });
    
    if (!opinionText.trim() || !selectedAgenda || !position) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    
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
      
      // 토론 의견 데이터 구조
      const opinionData = {
        sessionId,
        sessionCode, // 자동으로 전달받은 세션 코드
        studentName,
        studentGroup,
        selectedAgenda,
        position,
        opinionText: opinionText.trim(),
        createdAt: Date.now(),
        timestamp: new Date().toISOString()
      };
      
      // Firebase에 토론 의견 저장
      const opinionsRef = ref(db, `sessions/${sessionId}/debateOpinions`);
      const newOpinionRef = push(opinionsRef);
      
      console.log('🔥 토론 의견 저장 시도:', {
        path: `sessions/${sessionId}/debateOpinions`,
        sessionId,
        sessionCode,
        studentName,
        studentGroup,
        selectedAgenda,
        position,
        opinionData
      });
      
      await set(newOpinionRef, opinionData);
      
      console.log('✅ 토론 의견 제출 성공! Firebase에 저장됨:', {
        newOpinionKey: newOpinionRef.key,
        sessionCode,
        studentName,
        studentGroup,
        agenda: selectedAgenda,
        position,
        전체데이터: opinionData
      });
      
      // 즉시 검증: 저장된 데이터가 실제로 Firebase에 있는지 확인
      console.log('🔍 저장 검증 시작 - Firebase에서 다시 조회...');
      const verifyRef = ref(db, `sessions/${sessionId}/debateOpinions/${newOpinionRef.key}`);
      const verifySnapshot = await get(verifyRef);
      
      if (verifySnapshot.exists()) {
        const savedData = verifySnapshot.val();
        console.log('✅ 검증 완료 - 데이터가 Firebase에 정상 저장됨:', savedData);
      } else {
        console.log('❌ 검증 실패 - 저장된 데이터를 Firebase에서 찾을 수 없음!');
        throw new Error('데이터 저장 검증 실패');
      }
      
      // 입력 필드 초기화
      setOpinionText('')
      setSelectedAgenda('')
      setPosition('')
      
      // 성공 메시지
      alert('토론 의견이 성공적으로 제출되었습니다! 👏')
      
      // 부모 컴포넌트에 알림
      onOpinionSubmit()
      
    } catch (error) {
      console.error('토론 의견 제출 오류:', error)
      alert('토론 의견 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-3 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl text-emerald-800">💬 토론 의견 제출</CardTitle>
            <CardDescription className="text-emerald-700 mt-1">
              📍 {studentName} ({studentGroup} 모둠) • 세션: {sessionCode}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 논제 직접 입력 */}
          <div>
            <label htmlFor="selectedAgenda" className="block text-sm font-bold text-emerald-800 mb-2 flex items-center">
              🎯 토론 논제 입력
            </label>
            <input
              type="text"
              id="selectedAgenda"
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-gradient-to-r from-emerald-50 to-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 placeholder-gray-500"
              placeholder="토론할 논제를 직접 입력하세요 (예: 환경보호를 위해 일회용품 사용을 전면 금지해야 한다)"
              value={selectedAgenda}
              onChange={(e) => setSelectedAgenda(e.target.value)}
              required
            />
            <div className="text-sm text-emerald-600 mt-2">
              💡 팁: 토론하기 좋은 논제는 찬성과 반대 의견이 모두 나올 수 있는 주제입니다
            </div>
          </div>

          {/* 찬성/반대 입장 선택 */}
          <div>
            <label className="block text-sm font-bold text-emerald-800 mb-3">
              👍👎 나의 입장
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                position === 'agree' 
                  ? 'border-green-400 bg-green-50 ring-2 ring-green-200' 
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}>
                <input
                  type="radio"
                  name="position"
                  value="agree"
                  checked={position === 'agree'}
                  onChange={(e) => setPosition(e.target.value as 'agree')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">👍</div>
                  <div className="font-semibold text-green-700">찬성</div>
                </div>
              </label>
              
              <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                position === 'disagree' 
                  ? 'border-red-400 bg-red-50 ring-2 ring-red-200' 
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}>
                <input
                  type="radio"
                  name="position"
                  value="disagree"
                  checked={position === 'disagree'}
                  onChange={(e) => setPosition(e.target.value as 'disagree')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">👎</div>
                  <div className="font-semibold text-red-700">반대</div>
                </div>
              </label>
            </div>
          </div>

          {/* 의견 작성 */}
          <div>
            <label htmlFor="opinionText" className="block text-sm font-bold text-emerald-800 mb-2 flex items-center">
              ✍️ 나의 의견과 근거
            </label>
            <textarea
              id="opinionText"
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl bg-gradient-to-r from-emerald-50 to-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 placeholder-gray-500"
              placeholder="나의 입장과 그 이유를 자세히 설명해주세요. 구체적인 예시나 근거를 포함하면 더 좋아요!"
              value={opinionText}
              onChange={(e) => setOpinionText(e.target.value)}
              required
              rows={5}
            />
            <div className="mt-2 text-sm text-emerald-600">
              💡 팁: 내 경험이나 배운 내용을 바탕으로 구체적으로 설명해보세요
            </div>
          </div>
          
          {/* 제출 버튼 */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-emerald-700">
                <div className="font-semibold">제출 정보 확인</div>
                <div>👤 {studentName} • 👥 {studentGroup} 모둠</div>
                <div>📝 세션: {sessionCode}</div>
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                disabled={!opinionText.trim() || !selectedAgenda || !position || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    제출 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    토론 의견 제출하기
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}