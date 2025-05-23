# Question Talk - 질문톡톡! 논제샘솟! 개발 현황

## 1. 프로젝트 개요

**질문톡톡! 논제샘솟!**은 학생들의 질문으로 토론 논제를 발굴하는 교육용 플랫폼입니다. 교사들이 수업 세션을 만들고 학생들이 실시간으로 질문을 제출하여 토론 주제를 발굴할 수 있는 환경을 제공합니다.

## 2. 기술 스택

### 2.1 프론트엔드
- **프레임워크**: Next.js 14 (React 기반)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **배포**: Vercel (https://question-talk.vercel.app)

### 2.2 백엔드 & 데이터베이스
- **데이터베이스**: Firebase Realtime Database
- **인증**: Firebase Authentication
- **호스팅**: Firebase Hosting

### 2.3 AI 기능
- **AI 모델**: Google Gemini API
- **기능**: 질문 분석, 논제 추천, 용어 정의

## 3. 구현된 주요 기능

### 3.1 인증 시스템
- **교사 회원가입/로그인**: 이메일 기반 인증
- **학생 접근**: 세션 코드를 통한 익명 참여
- **비밀번호 재설정**: 이메일을 통한 복구 시스템

### 3.2 교사 기능
- **대시보드**: 세션 관리 및 현황 모니터링
- **세션 생성**: 새로운 토론 세션 만들기
- **세션 관리**: 세션 편집, 삭제, 복제 기능
- **실시간 데이터**: Firebase 실시간 리스너를 통한 즉시 업데이트

### 3.3 학생 기능
- **질문 제출**: 익명으로 질문 작성 및 제출
- **논제 추천**: AI 기반 논제 제안 받기
- **용어 정의**: 어려운 용어에 대한 AI 설명
- **논제 검증**: 논제의 적절성 AI 분석

### 3.4 AI 지원 기능
- **질문 분석**: Gemini API를 통한 질문 내용 분석
- **논제 추천**: 질문을 기반으로 한 토론 주제 제안
- **용어 정의**: 복잡한 개념에 대한 쉬운 설명 제공
- **논제 검증**: 토론하기 적합한 주제인지 평가

### 3.5 교육자료실
- **활동지 제공**: 토론 교육을 위한 3개의 HTML 활동지
  1. 좋은 토론 논제 찾기 체크리스트
  2. 두근두근 토론 활동지 (앞면) - 토론 준비 단계
  3. 두근두근 토론 활동지 (뒷면) - 토론 후 성찰
- **인쇄/다운로드**: 활동지 미리보기, 인쇄, HTML 다운로드 기능
- **반응형 디자인**: 모든 기기에서 최적화된 표시

## 4. 파일 구조

```
question-talk/
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── ai/
│   │   │   ├── analyze-questions/
│   │   │   └── recommend-agendas/
│   │   ├── questions/
│   │   │   └── create/
│   │   └── sessions/
│   │       ├── create/
│   │       ├── delete/
│   │       ├── duplicate/
│   │       ├── list/
│   │       ├── update/
│   │       └── update-agendas/
│   ├── auth/                     # 인증 페이지
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── guide/                    # 이용 가이드
│   ├── materials/                # 교육자료실
│   ├── platform/                 # 메인 플랫폼 페이지
│   ├── student/                  # 학생용 페이지
│   │   └── session/[sessionCode]/
│   └── teacher/                  # 교사용 페이지
│       ├── dashboard/
│       └── session/
│           ├── create/
│           └── [sessionId]/
├── components/                   # 재사용 가능한 컴포넌트
│   ├── auth/
│   │   └── RequireAuth.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Header.tsx
│   ├── student/
│   │   ├── AgendaDisplay.tsx
│   │   ├── AgendaRecommender.tsx
│   │   ├── AgendaValidator.tsx
│   │   ├── QuestionHelper.tsx
│   │   ├── QuestionInput.tsx
│   │   ├── QuestionList.tsx
│   │   └── TermDefinition.tsx
│   └── teacher/
│       ├── CreateSessionForm.tsx
│       ├── EditSessionModal.tsx
│       ├── SessionList.tsx
│       └── SessionManager.tsx
├── contexts/                     # React Context
│   └── AuthContext.tsx
├── lib/                          # 유틸리티 및 설정
│   ├── auth.ts
│   ├── firebase.ts
│   ├── gemini.ts
│   └── utils.ts
└── public/                       # 정적 파일
    └── icons/
```

## 5. 핵심 컴포넌트 설명

### 5.1 인증 관리 (AuthContext)
- Firebase Authentication 연동
- 사용자 상태 관리 및 권한 확인
- 자동 로그인 유지 및 세션 관리

### 5.2 실시간 데이터 동기화
- Firebase Realtime Database의 `onValue` 리스너 사용
- 세션 생성/삭제 시 즉시 UI 반영
- 질문 제출 시 실시간 업데이트

### 5.3 AI 통합 (Gemini API)
- 질문 분석 및 논제 추천 기능
- 용어 정의 및 논제 검증
- 안전한 API 키 관리 (서버사이드)

### 5.4 반응형 UI/UX
- Tailwind CSS를 활용한 모바일 우선 디자인
- 햄버거 메뉴 및 모바일 네비게이션
- 접근성을 고려한 사용자 인터페이스

## 6. 보안 및 성능

### 6.1 보안 측면
- Firebase 보안 규칙을 통한 데이터 접근 제어
- 환경 변수를 통한 API 키 보안
- 클라이언트사이드 입력 검증 및 서버사이드 검증

### 6.2 성능 최적화
- Next.js의 서버사이드 렌더링 활용
- 이미지 최적화 및 코드 스플리팅
- Firebase 실시간 리스너를 통한 효율적인 데이터 동기화

## 7. 배포 및 운영

### 7.1 배포 환경
- **프론트엔드**: Vercel 자동 배포
- **데이터베이스**: Firebase (실시간 데이터베이스)
- **도메인**: https://question-talk.vercel.app

### 7.2 CI/CD
- GitHub 연동을 통한 자동 배포
- TypeScript 타입 체크 및 빌드 최적화
- 실시간 에러 모니터링

## 8. 사용자 경험 개선사항

### 8.1 최근 구현된 개선사항
- **실시간 UI 업데이트**: 세션 생성/삭제 시 즉시 반영
- **교육자료실 추가**: 토론 교육용 활동지 제공
- **네비게이션 개선**: 가이드를 햄버거 메뉴로 이동
- **모바일 최적화**: 모든 기능의 모바일 지원

### 8.2 사용자 피드백 반영
- 교사 대시보드 실시간 업데이트 요청 반영
- 활동지 인쇄 기능 추가
- UI/UX 일관성 개선

## 9. 향후 개발 계획

### 9.1 단기 계획
- 질문 분류 및 태깅 시스템
- 세션 통계 및 분석 기능 강화
- 다양한 언어 지원

### 9.2 중장기 계획
- 모바일 앱 개발
- 고급 AI 기능 (토론 시뮬레이션)
- 교육기관 연동 시스템

## 10. 기술적 특징

### 10.1 혁신적 요소
- **실시간 협업**: Firebase를 통한 즉시 데이터 동기화
- **AI 통합**: Gemini API를 활용한 교육 지원
- **사용자 중심 설계**: 교사와 학생 모두를 고려한 UX

### 10.2 확장성
- 컴포넌트 기반 아키텍처로 유지보수성 확보
- TypeScript 도입으로 코드 안정성 향상
- 모듈화된 구조로 기능 확장 용이

## 11. 결론

**질문톡톡! 논제샘솟!**은 현대 교육 환경에 적합한 디지털 토론 플랫폼으로, 학생들의 자발적 참여를 촉진하고 교사의 수업 관리를 효율화하는 종합적인 솔루션입니다. 실시간 데이터 동기화, AI 지원 기능, 반응형 디자인을 통해 미래 지향적인 교육 도구로 발전하고 있습니다.

---

**개발자**: Claude (Anthropic)  
**프로젝트 관리**: 안양 박달초 김문정  
**최종 업데이트**: 2025년 1월  
**GitHub**: https://github.com/reallygood83/theme  
**Live Demo**: https://question-talk.vercel.app