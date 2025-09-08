# LovableDebate 통합 PRD (Product Requirements Document)

## 📋 프로젝트 개요

### 프로젝트명
**질문톡톡! 논제샘솟! - 러블 토론 피드백 서비스 통합**

### 목적
LovableDebate(경기초등토론교육모형 기반 AI 토론 피드백 시스템)를 질문톡톡! 논제샘솟! 플랫폼에 완전히 통합하여, 종합적인 토론 교육 플랫폼으로 확장

### 비전
"질문에서 시작하여 논제를 발굴하고, 의견을 제출하며, AI 피드백으로 성장하는 완성형 토론 교육 플랫폼"

### 통합 범위
- ✅ 전체 기능 이관 (의견 제출, AI 피드백, 교사 관리)
- ✅ 데이터베이스 통합 (MongoDB + Firebase 병행)
- ✅ 인증 시스템 확장 (Google + Naver OAuth)
- ✅ UI/UX 테마 통일 (질문톡톡 디자인 시스템)

## 🏗️ 기술 아키텍처

### 현재 상태 (AS-IS)

#### 질문톡톡! 논제샘솟!
```
- Framework: Next.js 14
- Database: Firebase Realtime Database
- Auth: Firebase Auth (Google Login)
- AI: Google Gemini API
- Hosting: Vercel
- Storage: Firebase Storage
```

#### LovableDebate
```
- Framework: Next.js 15.3.1
- Database: MongoDB + Mongoose
- Auth: Local Auth (bcrypt) - 교사용
- AI: Google Gemini API
- Hosting: Vercel (Standalone)
```

### 목표 상태 (TO-BE)

```
질문톡톡! 논제샘솟! 통합 플랫폼
├── Framework: Next.js 14 (통일)
├── Database: 
│   ├── Firebase (기존 질문/세션 데이터)
│   └── MongoDB (토론 의견/피드백 데이터)
├── Auth: Firebase Auth (Google 통일)
├── AI: Google Gemini API (통합)
├── Storage: Firebase Storage
└── Hosting: Vercel
```

## 🔄 데이터 마이그레이션 계획

### Phase 1: 데이터베이스 분리 운영
- Firebase: 질문 수집, 세션 관리, 논제 추천
- MongoDB: 토론 의견, AI 피드백, 학급 관리

### Phase 2: 데이터 모델 매핑

#### 교사 계정 통합
```javascript
// Firebase (기존)
{
  uid: string,
  email: string,
  displayName: string,
  provider: 'google'
}

// MongoDB (추가)
{
  firebaseUid: string, // Firebase UID 연결
  email: string,
  name: string,
  provider: 'google'
}
```

#### 학생 데이터 연계
```javascript
// 세션 참여 (Firebase)
{
  sessionCode: string,
  studentName: string,
  groupName: string
}

// 토론 참여 (MongoDB)
{
  name: string,
  accessCode: string,
  classId: ObjectId,
  sessionCode: string // Firebase 세션과 연결
}
```

## 🎨 UI/UX 통합 계획

### 디자인 시스템 통일
1. **색상 팔레트**: 질문톡톡 기존 색상 체계 유지
   - Primary: #3B82F6 (파란색)
   - Secondary: #10B981 (녹색)
   - Accent: #F59E0B (주황색)

2. **컴포넌트 스타일**: Tailwind CSS 기반 통일
   - 카드 디자인
   - 버튼 스타일
   - 폼 요소
   - 모달 디자인

3. **네비게이션 구조**
```
메인 메뉴
├── 홈
├── 질문 수집 (기존)
│   ├── 세션 만들기
│   └── 세션 관리
├── 토론 피드백 (신규)
│   ├── 학급 관리
│   ├── 의견 관리
│   └── AI 피드백
├── 교육자료실
└── 이용 가이드
```

## 📱 주요 기능 통합

### 1. 인증 시스템 확장

#### 교사 로그인 통합
```typescript
interface TeacherAuth {
  provider: 'google';
  unifiedProfile: {
    firebaseUid: string;
    email: string;
    name: string;
    provider: 'google';
    sessions: Session[]; // Firebase
    classes: Class[];    // MongoDB
  };
}
```

### 2. 통합 대시보드

#### 교사 대시보드 통합 화면
```
[교사 대시보드]
├── 질문 수집 현황
│   ├── 활성 세션
│   ├── 수집된 질문
│   └── 추천 논제
└── 토론 활동 현황
    ├── 학급 목록
    ├── 제출된 의견
    └── AI 피드백 현황
```

### 3. 학생 통합 경험

#### 학생 참여 플로우
```
1. 세션 코드 입력 (질문 수집)
   ↓
2. 질문 제출 & 논제 추천
   ↓
3. 토론 논제 선정
   ↓
4. 의견 작성 (토론 피드백)
   ↓
5. AI 피드백 받기
```

## 🛠️ 개발 계획

### Phase 1: 환경 설정 (1주)
- [ ] MongoDB 연결 설정
- [ ] Firebase Auth 확장 설정
- [ ] 환경 변수 통합
- [ ] 프로젝트 구조 재구성

### Phase 2: 백엔드 통합 (2주)
- [ ] API 라우트 이관
  - [ ] `/api/class/*`
  - [ ] `/api/opinions/*`
  - [ ] `/api/generate-feedback/*`
  - [ ] `/api/students/*`
- [ ] 데이터베이스 모델 설정
- [ ] 인증 미들웨어 통합

### Phase 3: 프론트엔드 통합 (2주)
- [ ] 페이지 컴포넌트 이관
  - [ ] 교사 토론 관리 페이지
  - [ ] 학생 의견 제출 페이지
  - [ ] AI 피드백 페이지
- [ ] 디자인 테마 적용
- [ ] 네비게이션 통합

### Phase 4: 기능 연계 (1주)
- [ ] 세션-학급 연동
- [ ] 질문-의견 연계
- [ ] 통합 피드백 시스템

### Phase 5: 테스트 및 최적화 (1주)
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 보안 점검
- [ ] 사용자 테스트

## 📁 파일 구조 계획

```
question-talk/
├── app/
│   ├── api/
│   │   ├── [기존 API routes]
│   │   └── debate/              # LovableDebate API (신규)
│   │       ├── class/
│   │       ├── opinions/
│   │       ├── feedback/
│   │       └── students/
│   ├── teacher/
│   │   ├── dashboard/          # 통합 대시보드
│   │   ├── session/           # 기존 질문 수집
│   │   └── debate/            # 토론 피드백 (신규)
│   │       ├── class/
│   │       ├── opinions/
│   │       └── feedback/
│   └── student/
│       ├── session/           # 기존 질문 제출
│       └── debate/            # 토론 의견 (신규)
│           ├── submit/
│           └── feedback/
├── components/
│   ├── [기존 components]
│   └── debate/                # LovableDebate 컴포넌트 (신규)
├── lib/
│   ├── firebase.ts           # 기존
│   ├── mongodb.ts            # 신규
│   └── models/               # MongoDB 모델 (신규)
└── styles/
    └── debate.module.css     # 토론 전용 스타일 (신규)
```

## 🔧 기술적 고려사항

### 1. 데이터베이스 트랜잭션
- Firebase와 MongoDB 간 데이터 일관성 유지
- 실패 시 롤백 전략

### 2. 인증 통합
- Firebase Auth를 통한 단일 세션 관리
- Google 로그인 통합 권한 관리

### 3. 성능 최적화
- API 라우트 캐싱
- 데이터베이스 연결 풀링
- 이미지 최적화

### 4. 보안
- CORS 설정
- API Rate Limiting
- 환경 변수 보안

## 📊 성공 지표

### 기술적 지표
- API 응답 시간 < 500ms
- 페이지 로드 시간 < 2초
- 에러율 < 1%

### 사용자 지표
- 기존 사용자 유지율 > 90%
- 신규 기능 사용률 > 60%
- 사용자 만족도 > 4.5/5

## 🚨 리스크 관리

### 기술적 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| DB 마이그레이션 실패 | 높음 | 백업 및 롤백 계획 수립 |
| 인증 통합 충돌 | 중간 | Provider 별 독립 관리 |
| 성능 저하 | 중간 | 점진적 마이그레이션 |

### 비즈니스 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 사용자 혼란 | 중간 | 상세 가이드 제공 |
| 기능 중복 | 낮음 | 명확한 구분 및 안내 |

## 📅 타임라인

```
2025년 1월 (준비)
├── Week 1: 환경 설정 및 구조 설계
├── Week 2-3: 백엔드 통합
└── Week 4: 프론트엔드 시작

2025년 2월 (개발)
├── Week 1: 프론트엔드 통합
├── Week 2: 기능 연계
├── Week 3: 테스트 및 디버깅
└── Week 4: 배포 준비

2025년 3월 (배포)
├── Week 1: 스테이징 배포
├── Week 2: 사용자 테스트
├── Week 3: 피드백 반영
└── Week 4: 프로덕션 배포
```

## ✅ 체크리스트

### 개발 전
- [ ] MongoDB Atlas 계정 설정
- [ ] 환경 변수 정리
- [ ] 백업 계획 수립

### 개발 중
- [ ] 일일 진행 상황 체크
- [ ] 주간 코드 리뷰
- [ ] 통합 테스트 실행

### 배포 전
- [ ] 전체 기능 테스트
- [ ] 보안 점검
- [ ] 성능 테스트
- [ ] 사용자 가이드 작성

### 배포 후
- [ ] 모니터링 설정
- [ ] 사용자 피드백 수집
- [ ] 버그 추적
- [ ] 개선 사항 도출

## 📝 참고 사항

### 기존 사용자 영향
- 기존 질문톡톡 기능은 100% 유지
- 새로운 토론 피드백 기능은 선택적 사용
- 데이터 마이그레이션 시 서비스 중단 없음

### 확장 가능성
- 향후 다른 교육 서비스 통합 가능
- 모듈화된 구조로 기능 추가 용이
- API 기반으로 외부 연동 가능

### 유지보수
- 통합 문서화 필수
- 코드 주석 및 가이드 작성
- 정기적인 업데이트 계획

---

**작성일**: 2025년 1월 8일  
**작성자**: Claude (Anthropic)  
**검토자**: 김문정 (안양 박달초)  
**버전**: 1.0.0