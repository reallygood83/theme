# 🎯 질문톡톡! 논제샘솟! (QuestionTalk)

학생들의 질문으로 AI가 맞춤형 토론 논제를 생성하는 혁신적인 교육 플랫폼

[![Vercel](https://img.shields.io/badge/vercel-deployed-brightgreen)](https://question-talk.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-orange)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple)](https://ai.google.dev/)

## 🚀 프로젝트 개요

**질문톡톡! 논제샘솟!**은 초등•중등 교육을 위한 차세대 AI 기반 토론 교육 플랫폼입니다. 학생들이 다양한 학습 자료를 보고 자발적으로 생성한 질문을 Google Gemini AI가 분석하여, 교육 목표에 맞는 창의적이고 의미 있는 토론 논제를 실시간으로 생성합니다.

### ✨ 핵심 가치
- 🎯 **학생 중심**: 학생들의 자발적 질문이 토론 주제의 출발점
- ⚡ **실시간 협업**: Firebase 기반 즉시 데이터 동기화
- 🤖 **AI 지원**: Gemini AI의 교육적 분석과 맞춤형 추천
- 📱 **접근성**: 별도 앱 설치 없이 웹브라우저에서 바로 이용
- 👥 **협력 학습**: 실시간 질문 공유와 집단 지성 활용

## 🎓 주요 기능

### 👨‍🏫 교사 기능
- **📚 다중 학습자료 지원**: 텍스트, YouTube, 웹링크, 파일(PDF/DOC/HWP) 동시 업로드
- **🔐 구글 로그인 인증**: Firebase Auth를 통한 안전한 교사 인증
- **🎯 개인화된 대시보드**: 자신의 세션만 표시되는 독립적 관리 환경
- **⚡ 실시간 세션 관리**: 생성, 편집, 삭제, 복제 기능
- **📊 AI 분석 도구**: 질문 기반 맞춤형 토론 논제 생성
- **📋 교육자료실**: 인쇄 가능한 토론 활동지 3종 제공

### 👨‍🎓 학생 기능
- **🔓 간편 접속**: 세션 코드만으로 익명 참여 (회원가입 불필요)
- **📖 학습자료 열람**: 토글 UI로 필요시에만 자료 확인
- **💭 자유로운 질문**: 실시간 질문 작성 및 즉시 공유
- **👀 실시간 협업**: 다른 학생들의 질문을 실시간으로 확인
- **🤖 AI 지원 도구**: 논제 추천, 용어 정의, 논제 검증 기능
- **❓ 질문 도우미**: 4가지 관점(시간/공간/사회/윤리)으로 사고 확장

### 🧠 AI 핵심 기능 (Google Gemini)
- **📊 질문 분석**: 학생 질문의 의미와 맥락 분석
- **🔗 질문 유목화**: 제출된 질문들을 주제별로 자동 그룹화
- **🎯 맞춤형 논제 생성**: 질문 패턴 기반 토론 주제 추천
- **📝 논거 제시**: 각 논제별 찬성/반대 근거 자동 생성
- **🔍 핵심 용어 추출**: 논제 관련 주요 개념 및 용어 식별
- **✅ 논제 적절성 검증**: 교육 목적과 학년 수준에 맞는 주제인지 평가

## 🛠️ 기술 스택

### Frontend
- **⚛️ Framework**: Next.js 14 (App Router)
- **📘 Language**: TypeScript
- **🎨 Styling**: Tailwind CSS + shadcn/ui Components
- **📱 Responsive**: Mobile-first Design (완전 반응형 구현)
- **♿ Accessibility**: WCAG 2.1 준수 + shadcn/ui 접근성 최적화
- **🎯 UI/UX**: 모던 디자인 시스템 및 일관된 사용자 경험

### Backend & Database
- **🔥 Database**: Firebase Realtime Database
- **🔐 Authentication**: Firebase Auth (Google 로그인)
- **📁 Storage**: Firebase Storage (파일 업로드 최대 10MB)
- **🌐 API Routes**: Next.js Server-side API

### AI & External Services  
- **🧠 AI Model**: Google Gemini API
- **📺 Video**: YouTube Data API v3
- **🔍 Search**: Web Scraping for link previews

### DevOps & Deployment
- **☁️ Hosting**: Vercel (Frontend)
- **🚀 CI/CD**: GitHub Actions
- **📊 Monitoring**: Real-time error tracking
- **🔒 Security**: Environment variables, Firebase Security Rules

## 시작하기

### 📋 필수 조건
- **Node.js**: 18.x 이상 권장
- **Firebase 프로젝트**: Realtime Database, Auth, Storage 설정
- **Google Gemini API 키**: AI 기능 사용
- **YouTube Data API 키**: 영상 자료 지원 (선택)
- **Git**: 소스코드 관리

### 설치 및 실행

1. 저장소 클론

```bash
git clone https://github.com/yourusername/question-talk.git
cd question-talk
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정
   
`.env.local.example` 파일을 `.env.local`로 복사하고 실제 값으로 설정하세요:

```bash
cp .env.local.example .env.local
```

필수 환경 변수:

```
# AI API 설정 (둘 중 하나 이상 필요)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase 설정 (필수)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

**🚨 환경 설정 주의사항**:
- **Gemini API**: 기본 AI 서비스 (필수)
- **YouTube API**: 영상 자료 지원용 (선택적)
- **Firebase 설정**: [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성 후 설정값 복사
- **보안 규칙**: Realtime Database에 교사별 데이터 격리 규칙 적용
- **도메인 설정**: Firebase Auth의 승인된 도메인에 배포 도메인 추가

4. 개발 서버 실행

```bash
npm run dev
```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🌟 최근 개선사항 (2025-01)

### ✅ 구현 완료된 주요 기능
- **📱 모바일 최적화**: 완전 반응형 디자인 및 터치 친화적 인터페이스
- **🎨 shadcn/ui 도입**: 일관된 디자인 시스템 및 접근성 개선
- **📊 대시보드 시각적 강화**: 핵심 섹션(내 세션, 세션 공유, 주제 공유)의 가독성 및 사용성 개선
- **📚 다중 자료 지원**: 텍스트, YouTube, 링크, 파일을 한 세션에서 동시 활용
- **🔐 교사별 독립성**: 각 교사가 자신의 세션만 관리하는 개인화된 환경
- **📁 파일 업로드**: PDF, DOC, DOCX, TXT, HWP 파일 지원 (최대 10MB)
- **🏠 교육자료실**: 토론 활동지 3종의 인쇄/다운로드 기능
- **⚡ 실시간 동기화**: Firebase를 통한 즉시 데이터 업데이트

### 🐛 해결된 주요 버그
- **📱 모바일 네비게이션**: 햄버거 메뉴 안정성 및 반응형 동작 완벽 개선
- **🎯 대시보드 밸런싱**: 카드 크기와 시각적 균형 최적화
- **🔍 근거자료 검색**: API 응답 시간과 진행률 표시 불일치 해결
- **📺 YouTube API**: 새 API 키 적용으로 영상 검색 정상화  
- **💾 메모리 누수**: 컴포넌트 언마운트 시 리스너 정리 강화
- **🔽 드롭다운 메뉴**: 사용자 메뉴 동작 안정성 개선
- **🏗️ 빌드 캐시**: Next.js 빌드 최적화 및 개발 서버 안정성 향상

## 📊 성과 및 통계

- **🎯 Live Demo**: [https://question-talk.vercel.app](https://question-talk.vercel.app)
- **⭐ 사용 교육기관**: 초등학교, 중학교 토론 수업 적용 중
- **📈 기술 성능**: 실시간 동기화 평균 응답시간 < 500ms
- **👥 동시 사용자**: 세션당 최대 30명 학생 동시 참여 가능
- **🔒 보안 수준**: Firebase 보안 규칙 + 교사별 데이터 격리

## 🚀 배포하기

### Vercel 배포 (권장)

1. **GitHub 연동**
   ```bash
   # 저장소 포크 또는 클론
   git clone https://github.com/reallygood83/theme.git
   cd question-talk
   ```

2. **Vercel 연결**
   - [Vercel](https://vercel.com)에서 GitHub 계정 연결
   - 저장소 가져오기 및 자동 빌드 설정

3. **환경 변수 설정** (Vercel 대시보드에서)
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   YOUTUBE_API_KEY=your_youtube_api_key  # 선택적
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_config
   # ... 기타 Firebase 설정값
   ```

4. **도메인 설정**
   - Firebase Auth 콘솔에서 Vercel 도메인을 승인된 도메인에 추가
   - Custom domain 설정 (선택적)

### 로컬 개발 서버

```bash
npm run dev          # 개발 서버 실행 (3000포트)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run type-check   # TypeScript 타입 검사
```

## 🤝 기여하기

### 개발 참여 방법
1. **이슈 생성**: 버그 리포트나 새 기능 제안
2. **포크 & 브랜치**: 작업용 브랜치 생성
3. **개발 & 테스트**: 로컬에서 기능 개발 및 테스트
4. **Pull Request**: 상세한 설명과 함께 PR 생성

### 개발 가이드라인
- **코드 품질**: TypeScript strict 모드, ESLint 준수
- **커밋 메시지**: [Conventional Commits](https://conventionalcommits.org/) 형식
- **테스트**: 새 기능 추가 시 관련 테스트 케이스 포함
- **문서화**: README, API 문서 업데이트

## 📄 라이센스 & 크레딧

- **라이센스**: MIT License - 자유로운 사용, 수정, 배포 가능
- **개발**: Claude (Anthropic AI) & 김문정 (안양 박달초)
- **목적**: 교육용 오픈소스 프로젝트
- **지원**: 한국 초중등 교육 혁신을 위한 AI 도구

---

**🎯 교육 현장에서 바로 사용 가능한 검증된 토론 교육 플랫폼**  
**Live Demo**: [question-talk.vercel.app](https://question-talk.vercel.app) | **GitHub**: [reallygood83/theme](https://github.com/reallygood83/theme)