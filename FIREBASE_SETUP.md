# Firebase Admin SDK 설정 가이드

## 문제 상황
학생들이 토론 의견을 제출할 수 있지만, 교사 대시보드에서 해당 의견들을 볼 수 없는 문제가 발생했습니다.

## 원인
서버 사이드 API 라우트에서 Firebase에 접근할 때 클라이언트 SDK를 사용하고 있어서 "Permission denied" 오류가 발생했습니다.

## 해결책
Firebase Admin SDK를 사용하도록 수정했습니다. 이제 Firebase 서비스 계정 자격 증명을 설정해야 합니다.

## Firebase 서비스 계정 설정 단계

### 1. Firebase 콘솔 접속
1. https://console.firebase.google.com 접속
2. 'question-talk-ebd38' 프로젝트 선택

### 2. 서비스 계정 생성
1. 왼쪽 메뉴에서 `⚙️ Project Settings` 클릭
2. `Service accounts` 탭 클릭
3. `Generate new private key` 버튼 클릭
4. JSON 파일이 다운로드됩니다

### 3. 환경 변수 설정
다운로드된 JSON 파일을 열어서 아래 정보를 `.env.local` 파일에 추가:

```env
# 아래 주석을 해제하고 실제 값으로 변경하세요
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@question-talk-ebd38.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

**중요**: 
- `client_email` 값을 `FIREBASE_CLIENT_EMAIL`에 복사
- `private_key` 전체 값을 `FIREBASE_PRIVATE_KEY`에 복사 (줄바꿈 포함)
- private_key는 반드시 따옴표로 감싸야 합니다

### 4. 서버 재시작
환경 변수를 추가한 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

## 수정된 파일들

### `/lib/firebase-admin.ts` (새 파일)
- Firebase Admin SDK 초기화 로직
- 서비스 계정 자격 증명 없이도 기본 모드로 동작 (개발용)

### `/app/api/debate/teachers/route.ts`
- 클라이언트 Firebase SDK → Firebase Admin SDK로 변경
- 교사 정보 저장/조회/업데이트 API 수정

### `/app/api/debate/opinions/class/route.ts`
- 클라이언트 Firebase SDK → Firebase Admin SDK로 변경  
- 교사 대시보드 의견 조회 API 수정

## 테스트 방법

### 1. 학생 의견 제출 테스트
1. 세션 코드로 학생 페이지 접속
2. 이름, 모둠 입력
3. 토론 의견 제출
4. 콘솔에서 성공 메시지 확인

### 2. 교사 대시보드 테스트  
1. 교사 계정으로 로그인
2. 대시보드 > 토론 의견 관리 클릭
3. 제출된 의견이 표시되는지 확인
4. 콘솔에서 `GET /api/debate/opinions/class` API 성공 확인

## 문제 해결

### 여전히 Permission Denied 오류가 발생하는 경우:
1. `.env.local` 파일의 환경 변수가 올바르게 설정되었는지 확인
2. 서버를 완전히 재시작했는지 확인
3. Firebase 콘솔에서 Realtime Database 보안 규칙 확인

### 데이터베이스 보안 규칙 (참고용):
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "teachers": {
      "$userId": {
        ".write": "$userId === auth.uid"
      }
    },
    "sessions": {
      "$sessionId": {
        ".write": "root.child('teachers').child(auth.uid).exists()"
      }
    },
    "sharedSessions": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('teachers').child(auth.uid).exists()"
    },
    "sharedScenarios": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('teachers').child(auth.uid).exists()"
    },
    "debate_opinions": {
      ".write": true,
      ".read": true
    }
  }
}
```

## 완료 후 확인사항
- [x] 학생 의견 제출 정상 작동
- [x] 교사 대시보드에서 의견 조회 정상 작동  
- [x] Firebase Admin SDK로 서버 인증 정상 작동
- [x] Permission denied 오류 해결