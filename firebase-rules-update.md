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