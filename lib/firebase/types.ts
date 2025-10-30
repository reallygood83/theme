/**
 * Firebase Firestore 타입 정의
 * MongoDB에서 Firebase로 완전 마이그레이션을 위한 타입 시스템
 */

import { Timestamp } from 'firebase/firestore';

// ==================== 기본 Firebase 타입 ====================

export interface FirebaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== 교사 (Teacher) 타입 ====================

export interface FirebaseTeacher extends FirebaseDocument {
  firebaseUid: string; // Firebase Auth UID (필수)
  email: string;
  name: string;
  provider: 'google' | 'email' | 'existing';
  school?: string;
  position?: string;
  phone?: string;
  isActive: boolean;
  
  // 마이그레이션 관련
  legacyUserId?: string;
  migrationDate?: Timestamp;
  lastLoginAt?: Timestamp;
  
  // 권한 관리
  permissions: {
    canCreateSession: boolean;
    canManageStudents: boolean;
    canViewStatistics: boolean;
    isAdmin: boolean;
  };
}

// ==================== 클래스 (Class) 타입 ====================

export interface FirebaseTopic {
  id: string;
  title: string;
  description?: string;
  createdAt: Timestamp;
}

export interface FirebaseClass extends FirebaseDocument {
  name: string;
  code: string; // 4자리 대문자 코드
  teacherId: string; // Firebase Teacher 문서 ID
  teacherUid: string; // Firebase Auth UID
  sessionCode?: string; // 질문톡톡 세션 코드
  topics: FirebaseTopic[];
  isActive: boolean;
}

// ==================== 학생 (Student) 타입 ====================

export interface FirebaseStudent extends FirebaseDocument {
  name: string;
  classId: string; // Firebase Class 문서 ID
  accessCode: string; // 고유 접근 코드
  sessionCode?: string; // 질문톡톡 세션 코드
  groupName?: string; // 모둠명
  isActive: boolean;
}

// ==================== 의견 (Opinion) 타입 ====================

export interface FirebaseOpinion extends FirebaseDocument {
  topic: string;
  topicId?: string;
  content: string;
  
  // 학생 정보
  studentName: string;
  studentId: string; // Firebase Student 문서 ID
  studentClass: string;
  
  // 관계 정보
  classId: string; // Firebase Class 문서 ID
  teacherId: string; // Firebase Teacher 문서 ID
  sessionCode?: string; // 질문톡톡 세션 코드
  
  // 상태 및 피드백
  submittedAt: Timestamp;
  status: 'pending' | 'reviewed' | 'feedback_given';
  aiFeedback?: string;
  teacherFeedback?: string;
  teacherNote?: string;
  isPublic: boolean;
  referenceCode: string; // 고유 참조 코드
}

// ==================== 알림 (Notification) 타입 ====================

export interface FirebaseNotification extends FirebaseDocument {
  teacherId: string; // Firebase Teacher 문서 ID
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ==================== 피드백 템플릿 (FeedbackTemplate) 타입 ====================

export interface FirebaseFeedbackTemplate extends FirebaseDocument {
  teacherId: string; // Firebase Teacher 문서 ID
  name: string;
  content: string;
  category: string;
  isActive: boolean;
  usage: {
    count: number;
    lastUsed?: Timestamp;
  };
}

// ==================== 컬렉션 이름 상수 ====================

export const FIREBASE_COLLECTIONS = {
  TEACHERS: 'teachers',
  CLASSES: 'classes', 
  STUDENTS: 'students',
  OPINIONS: 'opinions',
  NOTIFICATIONS: 'notifications',
  FEEDBACK_TEMPLATES: 'feedbackTemplates'
} as const;

// ==================== 유틸리티 타입 ====================

// MongoDB ObjectId를 Firebase 문서 ID로 변환을 위한 매핑 타입
export interface IdMappingRecord {
  mongoId: string;
  firebaseId: string;
  collectionName: keyof typeof FIREBASE_COLLECTIONS;
  migratedAt: Timestamp;
}

// 마이그레이션 상태 추적
export interface MigrationStatus {
  collection: string;
  totalRecords: number;
  migratedRecords: number;
  failedRecords: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  errors: string[];
}

// Firebase 쿼리 필터 타입
export type FirebaseQueryFilter = {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
  value: any;
};

// Firebase 정렬 타입
export type FirebaseOrderBy = {
  field: string;
  direction: 'asc' | 'desc';
};