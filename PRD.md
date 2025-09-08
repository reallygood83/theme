# AI 피드백 시스템 PRD (Product Requirements Document) - 업데이트 버전

## 📋 개요
이 PRD는 'question-talk/theme' 프로젝트에 AI 기반 피드백 시스템을 통합하는 계획을 정의합니다. 기존 Firebase Realtime Database 구조를 유지하면서, 토론 세션 내 학생 질문에 대한 AI 피드백 기능을 추가합니다. lovabledebate25 프로젝트의 AI 피드백 기능을 참고하여, 최소 변경으로 자연스럽게 "안착"시키는 방안을 중점으로 합니다. MongoDB는 사용하지 않고, 기존 Firebase를 활용하여 구현합니다.

### 프로젝트 배경
- **현재 프로젝트**: question-talk/theme – 초등 토론 교육 플랫폼. Firebase Realtime Database 사용 (sessions, questions 노드). 교사 대시보드에서 세션 관리, 학생 페이지에서 질문 입력/토론.
- **참고 프로젝트**: lovabledebate25 – MongoDB 기반 의견 제출/검토/AI 피드백 시스템 (Gemini AI 사용). 교사 리뷰 UI와 템플릿 기반 피드백 생성.
- **통합 취지**: 학생의 질문이나 의견에 대해 AI가 교육적 피드백을 생성하여 교사의 부담을 줄이고, 학생의 논리적 사고/표현력 향상 지원. 기존 Firebase 스키마를 확장하여 실시간 동기화 유지.
- **안착 고민**: 기존 코드 변경 최소화. Firebase에 feedbacks 배열 추가 (세션 노드 하위). AuthContext로 교사/학생 구분. UI는 모달/카드로 기존 스타일과 일치.

### 주요 목표
- **교사 측**: 대시보드에서 세션 질문 확인, AI 피드백 생성/수정/저장. 실시간 저장으로 학생 즉시 보기 가능.
- **학생 측**: 세션 페이지에서 자신의 질문에 대한 AI 피드백 표시 (개인/공개).
- **Firebase 유지**: MongoDB 대신 Firebase 확장. sessions/{sessionId}/feedbacks 배열로 저장 (실시간 업데이트).
- **UX 강화**: 템플릿 선택, 실시간 미리보기, 배치 피드백, 알림 시스템으로 사용자 경험 개선.

## 🎯 기능 요구사항

### 1. **데이터 모델 (Firebase Realtime Database 확장)**
- **기존 구조 활용**: 기존 'sessions' 노드에 'feedbacks' 배열 추가 (lovabledebate25의 Opinion 모델 참고, Firebase 배열 형식으로).
- **스키마** (JSON 객체 형식, Firebase에 저장):
  - sessionId: string – 세션 ID (기존).
  - questionId: string – 질문 ID (기존 questions 노드 ref).
  - question: string – 학생 질문 내용.
  - studentName: string – 학생 이름 (익명 옵션).
  - studentId: string – 학생 ID (ref).
  - topic: string – 토론 주제.
  - aiFeedback: string – AI 생성 피드백 (Gemini).
  - teacherFeedback: string – 교사 수정 피드백.
  - isPublic: boolean – 공개 여부 (기본 false, 교사 선택).
  - status: string (enum: 'generated', 'reviewed', 'published') – 상태.
  - generatedAt: timestamp – AI 생성 시간.
  - reviewedAt: timestamp – 교사 리뷰 시간.
- **저장 위치**: Firebase 'sessions/{sessionId}/feedbacks' 배열. 실시간 동기화로 학생 페이지 즉시 반영.
- **이점**: MongoDB 마이그레이션 불필요, 기존 Firebase 코드 재사용 (lib/firebase.ts).

### 2. **API 엔드포인트 (Next.js App Router)**
- **POST /api/feedback/generate** (app/api/feedback/generate/route.ts 신규 생성, lovabledebate25의 /api/generate-feedback/route.js 참고):
  - 입력: { sessionId, questionId, question, studentName, topic, instructions (optional) }.
  - 로직: Gemini AI 호출 (gemini-1.5-flash, 기존 lib/gemini.ts 확장). 프롬프트에 토론 주제/질문 포함, 초등 수준 교육 가이드라인 적용 (칭찬부터, 논리 분석, 부드러운 제안).
  - 출력: { success: true, feedback: string, tips: string[] (5개 제안, e.g., "근거 추가 제안") }.
- **PATCH /api/sessions/[sessionId]/feedback/[questionId]** : 교사 피드백 업데이트 (기존 sessions API 확장, lib/firebase.ts 사용).
- **GET /api/sessions/[sessionId]/feedback** : 학생용 피드백 조회 (공개된 것만 필터, real-time listener).
- **보안**: AuthContext로 인증, rate limiting (Gemini API 비용 관리).

### 3. **UI/UX – 교사 대시보드 (app/teacher/dashboard/page.tsx 및 SessionManager.tsx 확장)**
- **기존 통합**: SessionList 컴포넌트에 "AI 피드백" 버튼 추가 (세션 클릭 시 질문 목록에서 선택).
- **피드백 모달 (신규 components/teacher/AIFeedbackModal.tsx)**:
  - **입력**: 학생 질문 표시, 템플릿 선택 (detailed/simple/encouraging/improvement, lovabledebate25 템플릿 참고).
  - **AI 생성**: 버튼 클릭 → /api/feedback/generate 호출 → 피드백 표시 + 수정 텍스트에어리어 (실시간 미리보기).
  - **저장**: "저장" 버튼으로 Firebase 업데이트, 공개 체크박스 (isPublic).
  - **UX 강화**: 
    - 실시간 미리보기: 입력 변경 시 피드백 재생성 (debounce 2초).
    - 배치 처리: 여러 질문 선택 후 일괄 피드백 생성.
    - 템플릿 UI: 드롭다운 또는 카드 선택, 자동 적용 (e.g., "격려 중심" 선택 시 긍정 표현 우선).
    - 접근성: 키보드 네비, ARIA 라벨.
- **대시보드 테이블**: 세션 목록에 피드백 상태 컬럼 추가 (e.g., "피드백 미생성", "생성됨", "공개됨").

### 4. **UI/UX – 학생 페이지 (app/student/session/[sessionCode]/page.tsx 확장)**
- **개인 피드백 카드**: QuestionList 아래 "AI 피드백" 섹션 – 자신의 질문에 대한 aiFeedback 표시 (카드 형식, 확장/축소).
- **공개 피드백 섹션**: "공개 피드백" 탭 – 다른 학생의 공개 피드백 목록 (랜덤/최신 정렬, 익명 표시, 좋아요/댓글-like 기능 고려).
- **알림 시스템**: 새 피드백 도착 시 토스트 알림 (react-hot-toast 사용 추천).
- **UX 강화**:
  - **개인화**: 피드백에 학생 이름 언급 (e.g., "너의 생각이 좋았어!").
  - **시각화**: 피드백 카드에 아이콘 (e.g., 👍 긍정, 💡 제안), 색상으로 상태 표시.
  - **모바일**: 반응형, 터치 친화적 (버튼 크기, 스와이프).
  - **접근성**: 화면 판독기 지원, 초등학생 읽기 쉬운 폰트/색상.

### 5. **AI 프롬프트 (lib/gemini.ts 확장, lovabledebate25 참고)**
- **시스템 프롬프트**: "초등학생을 위한 교육적 피드백 전문가. 경기초등토론교육모형 기반 – 다름과 공존 강조. 칭찬부터 시작, 논리/근거 분석, 부드러운 개선 제안. 2인칭 '너' 사용, 3-5문장."
- **유저 프롬프트**: 토론 주제, 학생 질문 포함. 타입별 지침 (detailed: 상세 분석, simple: 2-3문장 요약).
- **팁 생성**: /api/feedback/tips 엔드포인트로 5개 제안 (e.g., "다른 의견 존중 표현 추가").
- **출력 형식**: { feedback: string, tips: string[] } – JSON으로 파싱 용이.

### 6. **기술 스택 (Firebase 유지)**
- **백엔드**: Next.js App Router, Google Generative AI SDK (기존 GEMINI_API_KEY 사용).
- **데이터베이스**: Firebase Realtime Database (기존 lib/firebase.ts 확장, feedbacks 배열 추가).
- **프론트엔드**: React, Tailwind CSS (기존 스타일 유지, 모달/카드 컴포넌트).
- **인증**: 기존 AuthContext (교사/학생 구분).
- **실시간**: Firebase listeners로 피드백 즉시 동기화.
- **보안**: Firebase Rules로 교사만 쓰기, 학생 읽기. API 키 서버 사이드만.

## 📊 사용자 흐름 (Firebase 중심)

### 교사 흐름 (Dashboard)
1. 로그인 → 대시보드 → 세션 목록.
2. 세션 클릭 → 질문 목록 (기존).
3. 질문 선택 → "AI 피드백 생성" 버튼 (신규).
4. 모달 열림 → 템플릿 선택 → AI 호출 (Gemini) → 피드백 표시/수정.
5. "저장" 클릭 → Firebase sessions/{sessionId}/feedbacks 배열에 푸시 (실시간 업데이트).
6. 상태 변경 (pending → reviewed) – 학생 페이지 즉시 반영.

### 학생 흐름 (Session Page)
1. 세션 참여 → 질문 입력 (기존).
2. AI 피드백 자동 생성 (백그라운드, /api/feedback/generate 호출).
3. 페이지 새로고침 → 피드백 카드 표시 (firebase onValue listener).
4. 공개 피드백: "공개 피드백" 섹션에 랜덤/최신 목록 (isPublic: true 필터).

## 🔒 보안/프라이버시
- **데이터 보호**: 학생 ID 해싱 또는 익명 ID 사용. 피드백 공개는 교사 선택.
- **API 제한**: Gemini 호출 rate limit (e.g., 5회/분).
- **접근 제어**: AuthContext로 역할 기반 (교사: 쓰기, 학생: 읽기).

## 📈 성공 지표
- **사용성**: 80% 세션에서 AI 피드백 사용.
- **만족도**: 학생 설문 85% 이상 긍정.
- **성능**: 피드백 생성 < 10초 (Gemini flash 모델).

## ⏰ 타임라인
- **기획**: 완료 (이 문서, Firebase 적응).
- **백엔드**: 2일 (API, Firebase 확장).
- **프론트엔드**: 3일 (모달, 카드 UI, 실시간 listener).
- **테스트**: 1일 (로컬/배포, 사용자 흐름).
- **배포**: GitHub 푸시 + Vercel.

이 PRD는 기존 Firebase 구조를 유지하면서 AI 피드백을 자연스럽게 통합합니다. 구현 시작하시겠어요?