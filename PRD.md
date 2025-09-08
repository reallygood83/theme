# AI 피드백 시스템 PRD (Product Requirements Document)

## 📋 개요
이 PRD는 'question-talk/theme' 프로젝트에 AI 기반 피드백 시스템을 통합하는 계획을 정의합니다. 기존 토론 세션 시스템에 학생 질문에 대한 AI 피드백 기능을 추가하여, 교사가 학생의 생각을 분석하고 맞춤형 피드백을 제공할 수 있도록 합니다. 이는 'lovabledebate25' 프로젝트의 AI 피드백 기능을 참고하여 구현합니다.

### 프로젝트 배경
- **현재 프로젝트**: question-talk/theme – 초등 토론 교육 플랫폼. 교사 대시보드에서 세션 관리, 학생 페이지에서 질문 입력/토론.
- **참고 프로젝트**: lovabledebate25 – 토론 의견 제출/검토/ AI 피드백 시스템. Gemini AI 사용, Mongoose 모델(Opinion)로 데이터 저장, 교사 리뷰 UI.
- **목적**: 학생의 질문이나 의견에 대해 AI가 교육적 피드백을 생성하여 교사의 피드백 부담 줄이고, 학생의 논리적 사고/표현력 향상 지원. 교사-학생 구분하여 구현.

### 주요 목표
- **교사 측**: 대시보드에서 학생 질문 목록 확인, AI 피드백 생성 버튼으로 Gemini AI 호출, 생성된 피드백 검토/수정/저장.
- **학생 측**: 세션 페이지에서 자신의 질문에 대한 AI 피드백 표시 (익명 또는 공개 설정).
- **통합**: 기존 세션 시스템(sessionId)과 연동. MongoDB에 Opinion-like 모델 추가 (question, feedback, student info).

## 🎯 기능 요구사항

### 1. **데이터 모델 (lib/models/Feedback.js 또는 Opinion 확장)**
- **스키마** (lovabledebate25의 Opinion 모델 참고):
  - sessionId: String (ref: Session) – 세션 ID.
  - question: String – 학생 질문 내용.
  - studentName: String – 학생 이름 (익명 가능).
  - studentId: ObjectId (ref: Student) – 학생 ID.
  - topic: String – 토론 주제.
  - aiFeedback: String – AI 생성 피드백.
  - teacherFeedback: String – 교사 수정 피드백.
  - isPublic: Boolean – 공개 여부 (기본 false).
  - status: String (enum: 'generated', 'reviewed', 'published') – 상태.
  - generatedAt: Date – AI 생성 시간.
  - reviewedAt: Date – 교사 리뷰 시간.
- **저장 위치**: MongoDB (기존 Firebase와 병행 또는 통합 고려).

### 2. **API 엔드포인트**
- **POST /api/feedback/generate** (app/api/generate-feedback/route.ts 생성, lovabledebate25 참고):
  - 입력: { sessionId, question, studentName, topic, instructions (optional) }.
  - 로직: Gemini AI 호출 (gemini-1.5-flash), 프롬프트에 토론 주제/질문 포함, 교육적 가이드라인 적용 (칭찬, 분석, 제안).
  - 출력: { success: true, feedback: string, tips: string[] }.
- **PATCH /api/sessions/[sessionId]/feedback/[questionId]** : 교사 피드백 저장/업데이트.
- **GET /api/sessions/[sessionId]/feedback** : 학생 피드백 조회 (공개된 것만).

### 3. **UI/UX – 교사 대시보드 (app/teacher/dashboard/page.tsx 확장)**
- **의견 목록 추가**: SessionList에 AI 피드백 버튼 추가.
- **피드백 생성 모달**: 
  - 학생 질문 표시.
  - AI 생성 버튼 (템플릿 선택: 상세/간결/격려/개선).
  - 생성된 피드백 표시 + 수정 텍스트에어리어.
  - 저장 버튼 (공개 여부 체크박스).
- **통합**: 기존 세션 목록에 "AI 피드백" 컬럼 추가, 클릭 시 모달 열림.

### 4. **UI/UX – 학생 페이지 (app/student/session/[sessionCode]/page.tsx 확장)**
- **피드백 표시 섹션**: 세션 내 자신의 질문 아래 AI 피드백 카드 표시 (generatedFeedback 필드).
- **공개 피드백**: 교사가 공개 설정 시, 다른 학생도 볼 수 있는 피드백 목록 (익명).
- **알림**: 새 피드백 도착 시 토스트 메시지.

### 5. **AI 프롬프트 (lib/feedback.ts 생성, lovabledebate25 참고)**
- **시스템 프롬프트**: "초등학생을 위한 교육적 피드백 전문가. 경기초등토론교육모형 기반 – 다름과 공존 강조. 칭찬부터 시작, 논리/근거 분석, 부드러운 개선 제안. 2인칭 '너' 사용."
- **유저 프롬프트**: 토론 주제, 학생 의견 포함. 템플릿 타입에 따라 지침 조정 (e.g., 'detailed' for detailed analysis).
- **출력**: 3-5문장 피드백 + 팁 배열 (e.g., "네 생각이 명확하구나! 근거를 더 추가하면 좋을 거야.").

### 6. **기술 스택**
- **백엔드**: Next.js App Router, Gemini AI (Google Generative AI SDK).
- **데이터베이스**: MongoDB (Mongoose 모델).
- **프론트엔드**: React, Tailwind CSS (기존 스타일 유지).
- **인증**: 기존 AuthContext 사용 (교사/학생 구분).
- **통합**: 기존 세션 API 확장 (app/api/sessions/update-feedback).

## 📊 사용자 흐름

### 교사 흐름 (Dashboard)
1. 대시보드 로그인 → 세션 목록.
2. 세션 클릭 → 질문 목록.
3. 질문 선택 → "AI 피드백 생성" 버튼.
4. 모달 열림 → 템플릿 선택 → AI 호출 → 피드백 표시/수정.
5. "저장" 클릭 → DB 저장, 상태 'reviewed'로 업데이트.
6. 학생 페이지에 피드백 표시 (공개 시 다른 학생도 보기).

### 학생 흐름 (Session Page)
1. 세션 참여 → 질문 입력/제출.
2. AI 피드백 자동 생성 (백그라운드).
3. 세션 페이지 새로고침 → 피드백 카드 표시.
4. 공개 피드백 목록: 다른 학생 의견 + AI 피드백 보기.

## 🔒 보안/프라이버시
- **데이터 보호**: 학생 이름 익명화 옵션, 피드백 공개 여부 교사 선택.
- **API 제한**: Gemini API 키 서버 사이드만 접근.
- **접근 제어**: AuthContext로 교사/학생 구분.

## 📈 성공 지표
- 교사: 피드백 생성 시간 30% 단축.
- 학생: 피드백 만족도 80% 이상 (미래 설문).
- 사용성: 90% 세션에서 AI 피드백 사용.

## ⏰ 타임라인
- **기획**: 완료 (이 문서).
- **백엔드 구현**: 2일 (API, 모델).
- **프론트엔드 통합**: 3일 (모달, UI).
- **테스트**: 1일.
- **배포**: GitHub 푸시 후 Vercel.

이 PRD를 기반으로 구현 시작하겠습니다. 코드 작성 전에 추가 요구사항 확인 부탁드립니다.