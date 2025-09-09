/**
 * Firebase Realtime Database 서비스 레이어
 * MongoDB CRUD 작업을 Firebase Realtime Database로 완전 대체
 * 개발지침: 모든 작업이 Always Works™ 보장
 */

import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  orderByKey,
  equalTo,
  limitToFirst,
  limitToLast,
  onValue,
  off,
  Database,
  DataSnapshot
} from 'firebase/database';

import { getFirebaseDatabase } from '../firebase';

// ==================== 기본 타입 정의 ====================

export interface FirebaseRealtimeDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseRealtimeTeacher extends FirebaseRealtimeDocument {
  firebaseUid: string;
  email: string;
  name: string;
  provider: 'google' | 'email' | 'existing';
  school?: string;
  position?: string;
  phone?: string;
  isActive: boolean;
  
  // 마이그레이션 관련
  legacyUserId?: string;
  migrationDate?: string;
  lastLoginAt?: string;
  
  // 권한 관리
  permissions: {
    canCreateSession: boolean;
    canManageStudents: boolean;
    canViewStatistics: boolean;
    isAdmin: boolean;
  };
}

export interface FirebaseRealtimeClass extends FirebaseRealtimeDocument {
  name: string;
  code: string;
  teacherId: string;
  teacherUid: string;
  sessionCode?: string;
  topics: FirebaseRealtimeTopic[];
  isActive: boolean;
}

export interface FirebaseRealtimeTopic {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface FirebaseRealtimeStudent extends FirebaseRealtimeDocument {
  name: string;
  classId: string;
  accessCode: string;
  sessionCode?: string;
  groupName?: string;
  isActive: boolean;
}

export interface FirebaseRealtimeOpinion extends FirebaseRealtimeDocument {
  topic: string;
  topicId?: string;
  content: string;
  
  // 학생 정보
  studentName: string;
  studentId: string;
  studentClass: string;
  
  // 관계 정보
  classId: string;
  teacherId: string;
  sessionCode?: string;
  
  // 상태 및 피드백
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'feedback_given';
  aiFeedback?: string;
  teacherFeedback?: string;
  teacherNote?: string;
  isPublic: boolean;
  referenceCode: string;
}

export interface FirebaseRealtimeNotification extends FirebaseRealtimeDocument {
  teacherId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface FirebaseRealtimeFeedbackTemplate extends FirebaseRealtimeDocument {
  teacherId: string;
  name: string;
  content: string;
  category: string;
  isActive: boolean;
  usage: {
    count: number;
    lastUsed?: string;
  };
}

// ==================== 컬렉션 경로 상수 ====================

export const FIREBASE_REALTIME_PATHS = {
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  STUDENTS: 'students',
  OPINIONS: 'opinions',
  NOTIFICATIONS: 'notifications',
  FEEDBACK_TEMPLATES: 'feedbackTemplates'
} as const;

// ==================== 에러 처리 ====================

export class FirebaseRealtimeServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FirebaseRealtimeServiceError';
  }
}

// ==================== 기본 CRUD 서비스 클래스 ====================

export class BaseFirebaseRealtimeService<T extends FirebaseRealtimeDocument> {
  protected database: Database | null;
  protected path: string;

  constructor(path: string) {
    this.path = path;
    this.database = getFirebaseDatabase();
  }

  // 연결 확인 헬퍼
  private ensureConnection() {
    if (!this.database) {
      this.database = getFirebaseDatabase();
      if (!this.database) {
        throw new FirebaseRealtimeServiceError(
          'Firebase Realtime Database가 초기화되지 않았습니다.',
          'DATABASE_NOT_INITIALIZED'
        );
      }
    }
  }

  // 문서 ID로 단일 문서 조회
  async getById(id: string): Promise<T | null> {
    try {
      this.ensureConnection();
      
      const docRef = ref(this.database!, `${this.path}/${id}`);
      const snapshot = await get(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.key!,
        ...snapshot.val()
      } as T;
    } catch (error) {
      console.error(`Firebase Realtime ${this.path} getById 오류:`, error);
      throw new FirebaseRealtimeServiceError(
        `문서 조회 실패: ${id}`,
        'GET_DOCUMENT_FAILED',
        error as Error
      );
    }
  }

  // 조건으로 문서들 조회
  async getMany(
    filterField?: string,
    filterValue?: any,
    orderField?: string,
    limitCount?: number
  ): Promise<T[]> {
    try {
      this.ensureConnection();
      
      let queryRef = ref(this.database!, this.path);
      let constraints: any[] = [];
      
      // 필터 조건 추가
      if (filterField && filterValue !== undefined) {
        constraints.push(orderByChild(filterField));
        constraints.push(equalTo(filterValue));
      } else if (orderField) {
        constraints.push(orderByChild(orderField));
      }
      
      // 개수 제한 추가
      if (limitCount) {
        constraints.push(limitToFirst(limitCount));
      }
      
      const finalQuery = constraints.length > 0 
        ? query(queryRef, ...constraints)
        : queryRef;
      
      const snapshot = await get(finalQuery);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const results: T[] = [];
      snapshot.forEach((child) => {
        results.push({
          id: child.key!,
          ...child.val()
        } as T);
      });
      
      return results;
    } catch (error) {
      console.error(`Firebase Realtime ${this.path} getMany 오류:`, error);
      throw new FirebaseRealtimeServiceError(
        '문서 목록 조회 실패',
        'GET_DOCUMENTS_FAILED',
        error as Error
      );
    }
  }

  // 새 문서 생성
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      this.ensureConnection();
      
      const now = new Date().toISOString();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      
      const listRef = ref(this.database!, this.path);
      const newDocRef = push(listRef);
      
      await set(newDocRef, docData);
      
      return {
        id: newDocRef.key!,
        ...docData
      } as T;
    } catch (error) {
      console.error(`Firebase Realtime ${this.path} create 오류:`, error);
      throw new FirebaseRealtimeServiceError(
        '문서 생성 실패',
        'CREATE_DOCUMENT_FAILED',
        error as Error
      );
    }
  }

  // 문서 업데이트
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      this.ensureConnection();
      
      const docRef = ref(this.database!, `${this.path}/${id}`);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await update(docRef, updateData);
      
      // 업데이트된 문서 반환
      const updatedDoc = await this.getById(id);
      if (!updatedDoc) {
        throw new Error('업데이트 후 문서를 찾을 수 없습니다.');
      }
      
      return updatedDoc;
    } catch (error) {
      console.error(`Firebase Realtime ${this.path} update 오류:`, error);
      throw new FirebaseRealtimeServiceError(
        `문서 업데이트 실패: ${id}`,
        'UPDATE_DOCUMENT_FAILED',
        error as Error
      );
    }
  }

  // 문서 삭제
  async delete(id: string): Promise<void> {
    try {
      this.ensureConnection();
      
      const docRef = ref(this.database!, `${this.path}/${id}`);
      await remove(docRef);
    } catch (error) {
      console.error(`Firebase Realtime ${this.path} delete 오류:`, error);
      throw new FirebaseRealtimeServiceError(
        `문서 삭제 실패: ${id}`,
        'DELETE_DOCUMENT_FAILED',
        error as Error
      );
    }
  }

  // 실시간 리스너 등록
  onSnapshot(
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    try {
      this.ensureConnection();
      
      const listRef = ref(this.database!, this.path);
      
      const unsubscribe = onValue(
        listRef,
        (snapshot) => {
          const results: T[] = [];
          if (snapshot.exists()) {
            snapshot.forEach((child) => {
              results.push({
                id: child.key!,
                ...child.val()
              } as T);
            });
          }
          callback(results);
        },
        (error) => {
          console.error(`Firebase Realtime ${this.path} onSnapshot 오류:`, error);
          if (errorCallback) {
            errorCallback(new FirebaseRealtimeServiceError(
              '실시간 리스너 오류',
              'SNAPSHOT_LISTENER_ERROR',
              error
            ));
          }
        }
      );
      
      return () => off(listRef, 'value', unsubscribe);
    } catch (error) {
      console.error(`Firebase Realtime ${this.path} onSnapshot 설정 오류:`, error);
      throw new FirebaseRealtimeServiceError(
        '실시간 리스너 설정 실패',
        'SETUP_LISTENER_FAILED',
        error as Error
      );
    }
  }
}

// ==================== 전문화된 서비스 클래스들 ====================

// 교사 서비스
export class RealtimeTeacherService extends BaseFirebaseRealtimeService<FirebaseRealtimeTeacher> {
  constructor() {
    super(FIREBASE_REALTIME_PATHS.TEACHERS);
  }

  // 이메일로 교사 찾기
  async getByEmail(email: string): Promise<FirebaseRealtimeTeacher | null> {
    const teachers = await this.getMany('email', email.toLowerCase());
    return teachers.length > 0 ? teachers[0] : null;
  }

  // Firebase UID로 교사 찾기
  async getByFirebaseUid(uid: string): Promise<FirebaseRealtimeTeacher | null> {
    const teachers = await this.getMany('firebaseUid', uid);
    return teachers.length > 0 ? teachers[0] : null;
  }

  // 마지막 로그인 시간 업데이트
  async updateLastLogin(id: string): Promise<FirebaseRealtimeTeacher> {
    return this.update(id, { lastLoginAt: new Date().toISOString() });
  }

  // 권한 확인 메서드
  hasPermission(teacher: FirebaseRealtimeTeacher, permission: keyof FirebaseRealtimeTeacher['permissions']): boolean {
    return teacher.permissions[permission] === true;
  }

  // 표시명 생성
  getDisplayName(teacher: FirebaseRealtimeTeacher): string {
    if (teacher.position && teacher.school) {
      return `${teacher.name} (${teacher.school} ${teacher.position})`;
    } else if (teacher.school) {
      return `${teacher.name} (${teacher.school})`;
    }
    return teacher.name;
  }
}

// 클래스 서비스
export class RealtimeClassService extends BaseFirebaseRealtimeService<FirebaseRealtimeClass> {
  constructor() {
    super(FIREBASE_REALTIME_PATHS.CLASSES);
  }

  // 교사의 클래스들 조회
  async getByTeacherId(teacherId: string): Promise<FirebaseRealtimeClass[]> {
    return this.getMany('teacherId', teacherId);
  }

  // 클래스 코드로 찾기
  async getByCode(code: string): Promise<FirebaseRealtimeClass | null> {
    const classes = await this.getMany('code', code.toUpperCase());
    return classes.length > 0 ? classes[0] : null;
  }

  // 세션 코드로 찾기
  async getBySessionCode(sessionCode: string): Promise<FirebaseRealtimeClass | null> {
    const classes = await this.getMany('sessionCode', sessionCode);
    return classes.length > 0 ? classes[0] : null;
  }
}

// 학생 서비스  
export class RealtimeStudentService extends BaseFirebaseRealtimeService<FirebaseRealtimeStudent> {
  constructor() {
    super(FIREBASE_REALTIME_PATHS.STUDENTS);
  }

  // 클래스의 학생들 조회
  async getByClassId(classId: string): Promise<FirebaseRealtimeStudent[]> {
    return this.getMany('classId', classId);
  }

  // 접근 코드로 학생 찾기
  async getByAccessCode(accessCode: string): Promise<FirebaseRealtimeStudent | null> {
    const students = await this.getMany('accessCode', accessCode);
    return students.length > 0 ? students[0] : null;
  }

  // 세션 코드로 학생들 찾기
  async getBySessionCode(sessionCode: string): Promise<FirebaseRealtimeStudent[]> {
    return this.getMany('sessionCode', sessionCode);
  }
}

// 의견 서비스
export class RealtimeOpinionService extends BaseFirebaseRealtimeService<FirebaseRealtimeOpinion> {
  constructor() {
    super(FIREBASE_REALTIME_PATHS.OPINIONS);
  }

  // 교사의 의견들 조회
  async getByTeacherId(teacherId: string): Promise<FirebaseRealtimeOpinion[]> {
    return this.getMany('teacherId', teacherId);
  }

  // 클래스의 의견들 조회
  async getByClassId(classId: string): Promise<FirebaseRealtimeOpinion[]> {
    return this.getMany('classId', classId);
  }

  // 상태별 의견들 조회
  async getByStatus(teacherId: string, status: FirebaseRealtimeOpinion['status']): Promise<FirebaseRealtimeOpinion[]> {
    // 복합 조건은 클라이언트에서 필터링
    const opinions = await this.getMany('teacherId', teacherId);
    return opinions.filter(opinion => opinion.status === status);
  }

  // 참조 코드로 의견 찾기
  async getByReferenceCode(referenceCode: string): Promise<FirebaseRealtimeOpinion | null> {
    const opinions = await this.getMany('referenceCode', referenceCode);
    return opinions.length > 0 ? opinions[0] : null;
  }
}

// 알림 서비스
export class RealtimeNotificationService extends BaseFirebaseRealtimeService<FirebaseRealtimeNotification> {
  constructor() {
    super(FIREBASE_REALTIME_PATHS.NOTIFICATIONS);
  }

  // 교사의 알림들 조회
  async getByTeacherId(teacherId: string, unreadOnly = false): Promise<FirebaseRealtimeNotification[]> {
    const notifications = await this.getMany('teacherId', teacherId);
    
    if (unreadOnly) {
      return notifications.filter(notification => !notification.isRead);
    }
    
    return notifications;
  }

  // 알림 읽음 처리
  async markAsRead(id: string): Promise<FirebaseRealtimeNotification> {
    return this.update(id, { isRead: true });
  }
}

// 피드백 템플릿 서비스
export class RealtimeFeedbackTemplateService extends BaseFirebaseRealtimeService<FirebaseRealtimeFeedbackTemplate> {
  constructor() {
    super(FIREBASE_REALTIME_PATHS.FEEDBACK_TEMPLATES);
  }

  // 교사의 템플릿들 조회
  async getByTeacherId(teacherId: string): Promise<FirebaseRealtimeFeedbackTemplate[]> {
    return this.getMany('teacherId', teacherId);
  }

  // 템플릿 사용 횟수 증가
  async incrementUsage(id: string): Promise<FirebaseRealtimeFeedbackTemplate> {
    const template = await this.getById(id);
    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    return this.update(id, {
      'usage.count': template.usage.count + 1,
      'usage.lastUsed': new Date().toISOString()
    });
  }
}

// ==================== 서비스 인스턴스 생성 ====================

export const realtimeTeacherService = new RealtimeTeacherService();
export const realtimeClassService = new RealtimeClassService();
export const realtimeStudentService = new RealtimeStudentService();
export const realtimeOpinionService = new RealtimeOpinionService();
export const realtimeNotificationService = new RealtimeNotificationService();
export const realtimeFeedbackTemplateService = new RealtimeFeedbackTemplateService();