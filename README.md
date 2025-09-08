# 질문톡톡! 논제샘솟! (QuestionTalk)

학생들이 질문을 생성하고, AI가 토론 논제를 추천하는 교육용 웹 서비스

## 프로젝트 개요

"질문톡톡! 논제샘솟!"은 초등학생들의 토론 수업을 지원하기 위한 AI 기반 웹 서비스입니다. 학생들이 제시된 학습 자료(텍스트, 영상)를 보고 다양한 관점의 질문을 생성하면, Google Gemini 2.0 Flash AI가 이 질문들을 분석하여 의미 있는 토론 논제를 발굴 및 제안합니다. 교사의 토론 수업 준비 부담을 경감시키고 학생들의 주도적인 토론 참여를 촉진하는 것이 목표입니다.

## 주요 기능

### 교사 기능
- 학습 자료 업로드/임베드 (텍스트 붙여넣기, 유튜브 링크)
- 학생 활동 세션 생성 및 고유 접속 코드/링크 제공
- 자료 관련 핵심 키워드 제시 (선택적)
- AI 기능 작동 버튼 (학생 질문 기반 AI 분석 시작)
- AI가 제안한 논제 및 분석 결과 확인

### 학생 기능
- 교사가 제시한 학습 자료 조회
- 질문 작성 및 제출 (개인별 다수 질문 가능, 실시간으로 모든 참여자에게 공유)
- 질문 도우미 조회 (4가지 관점: 시간, 공간, 사회, 윤리)
- 다른 학생들의 질문 실시간 확인
- 모둠별 논제 검증 및 용어 정의 활동

### AI 핵심 기능
- 학생 질문 유목화 (Clustering): 제출된 전체 질문들을 의미 기반으로 자동 그룹화
- 논제 추천: 유목화된 질문들 및 교사 제시 키워드를 바탕으로 토론 논제 후보 및 추천 근거 제시
- 논제 주요 용어 자동 추출: 추천 논제에서 주요 용어를 식별하여 제시

## 기술 스택

- **AI API**: Google Gemini 2.0 Flash
- **프론트엔드**: React, Next.js
- **백엔드**: Next.js API Routes
- **실시간 데이터베이스**: Firebase Realtime Database
- **스타일링**: Tailwind CSS
- **배포**: Vercel

## 시작하기

### 필수 조건
- Node.js 16.x 이상
- Firebase 프로젝트
- Google Gemini API 키

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

**중요**: 
- OpenAI API 키가 우선적으로 사용되며, 없으면 Gemini API로 백업됩니다
- 둘 다 없으면 오프라인 모드로 동작합니다
- Firebase 설정은 [Firebase 콘솔](https://console.firebase.google.com)에서 확인할 수 있습니다

4. 개발 서버 실행

```bash
npm run dev
```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 배포

Vercel을 사용하여 배포하려면:

1. [Vercel](https://vercel.com)에 가입하고 GitHub 계정 연결
2. 저장소 가져오기
3. 환경 변수 설정
4. 배포 완료

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여

이슈와 풀 리퀘스트는 환영합니다. 중요한 변경 사항의 경우, 먼저 이슈를 열어 논의해주세요.