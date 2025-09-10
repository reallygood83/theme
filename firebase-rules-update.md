# Firebase 보안 규칙 업데이트 가이드

## 현재 문제
세션 공유 시 `PERMISSION_DENIED` 오류가 발생하고 있습니다. 이는 Firebase Realtime Database 보안 규칙에서 `sharedSessions`와 `sharedScenarios` 경로에 대한 권한이 설정되지 않았기 때문입니다.

## 해결 방법

### 1. Firebase 콘솔 접속
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "Realtime Database" 클릭
4. "규칙" 탭 클릭

### 2. 보안 규칙 업데이트
현재 규칙을 다음과 같이 업데이트하세요:

```json
{
  "rules": {
    "teachers": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && $userId === auth.uid"
      },
      ".indexOn": ["uid", "email"]
    },
    "sessions": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["teacherId", "createdAt", "status"],
      "$sessionId": {
        "aiAnalysisResult": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "session_participants": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      ".indexOn": ["sessionId", "studentId"]
    },
    "session_opinions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      ".indexOn": ["sessionId", "studentId"]
    },
    "questions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "$questionId": {
          ".validate": "newData.hasChildren(['author', 'content', 'createdAt', 'sessionId'])"
        }
      },
      ".indexOn": ["sessionId", "studentId"]
    },
    "debate_opinions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      ".indexOn": ["sessionId", "studentId"]
    },
    "notifications": {
      "$teacherId": {
        ".read": "auth != null && auth.uid == $teacherId",
        ".write": "auth != null && auth.uid == $teacherId",
        ".indexOn": ["teacherId", "isRead", "createdAt"]
      }
    },
    "shared-sessions": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["sharedBy", "createdAt"]
    },
    "shared-scenarios": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["sharedBy", "createdAt"]
    },
    "users": {
      "$uid": {
        ".read": "auth != null && $uid === auth.uid",
        ".write": "auth != null && $uid === auth.uid"
      }
    }
  }
}
```

### 3. 규칙 설명
- `sharedSessions`: 인증된 사용자는 읽기 가능, 교사만 쓰기 가능
- `sharedScenarios`: 인증된 사용자는 읽기 가능, 교사만 쓰기 가능
- 교사 확인: `root.child('teachers').child(auth.uid).exists()`로 교사 여부 검증

### 4. 적용 후 확인
1. "게시" 버튼 클릭하여 규칙 적용
2. 웹 애플리케이션에서 세션 공유 기능 테스트
3. 브라우저 콘솔에서 오류 메시지 확인

## 주의사항
- 규칙 변경 후 즉시 적용됩니다
- 잘못된 규칙 설정 시 모든 데이터베이스 접근이 차단될 수 있습니다
- 규칙 변경 전 백업을 권장합니다