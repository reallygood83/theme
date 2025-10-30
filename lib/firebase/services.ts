/**
 * Firebase Firestore 서비스 레이어
 * MongoDB CRUD 작업을 Firebase로 완전 대체
 * 개발지침: 모든 작업이 Always Works™ 보장
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  FirestoreError
} from 'firebase/firestore';

import { firestore } from '../firebase';
import {
  FirebaseTeacher,
  FirebaseClass,
  FirebaseStudent,
  FirebaseOpinion,
  FirebaseNotification,
  FirebaseFeedbackTemplate,
  FIREBASE_COLLECTIONS,
  FirebaseQueryFilter,
  FirebaseOrderBy
} from './types';

// ==================== 에러 처리 ====================

export class FirebaseServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: FirestoreError
  ) {
    super(message);
    this.name = 'FirebaseServiceError';
  }
}

// ==================== 기본 CRUD 서비스 클래스 ====================

export class BaseFirebaseService<T extends { id: string }> {
  constructor(private collectionName: string) {}

  // 문서 ID로 단일 문서 조회
  async getById(id: string): Promise<T | null> {
    try {
      if (!firestore) throw new Error('Firestore가 초기화되지 않았습니다.');
      
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as unknown as T;
    } catch (error) {
      console.error(`Firebase ${this.collectionName} getById 오류:`, error);
      throw new FirebaseServiceError(
        `문서 조회 실패: ${id}`,
        'GET_DOCUMENT_FAILED',
        error as FirestoreError
      );
    }
  }

  // 필터 조건으로 문서들 조회
  async getMany(
    filters: FirebaseQueryFilter[] = [],
    orderBys: FirebaseOrderBy[] = [],
    limitCount?: number
  ): Promise<T[]> {
    try {
      if (!firestore) throw new Error('Firestore가 초기화되지 않았습니다.');
      
      let q = collection(firestore, this.collectionName);
      let queryConstraints: any[] = [];
      
      // 필터 조건 추가
      filters.forEach(filter => {
        queryConstraints.push(where(filter.field, filter.operator, filter.value));
      });
      
      // 정렬 조건 추가
      orderBys.forEach(orderByClause => {
        queryConstraints.push(orderBy(orderByClause.field, orderByClause.direction));
      });
      
      // 개수 제한 추가
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }
      
      const querySnapshot = await getDocs(query(q, ...queryConstraints));
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as T));
    } catch (error) {
      console.error(`Firebase ${this.collectionName} getMany 오류:`, error);
      throw new FirebaseServiceError(
        '문서 목록 조회 실패',
        'GET_DOCUMENTS_FAILED',
        error as FirestoreError
      );
    }
  }

  // 새 문서 생성
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      if (!firestore) throw new Error('Firestore가 초기화되지 않았습니다.');
      
      const now = Timestamp.now();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(firestore, this.collectionName), docData);
      
      return {
        id: docRef.id,
        ...docData
      } as unknown as T;
    } catch (error) {
      console.error(`Firebase ${this.collectionName} create 오류:`, error);
      throw new FirebaseServiceError(
        '문서 생성 실패',
        'CREATE_DOCUMENT_FAILED',
        error as FirestoreError
      );
    }
  }

  // 문서 업데이트
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      if (!firestore) throw new Error('Firestore가 초기화되지 않았습니다.');
      
      const docRef = doc(firestore, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
      
      // 업데이트된 문서 반환
      const updatedDoc = await this.getById(id);
      if (!updatedDoc) {
        throw new Error('업데이트 후 문서를 찾을 수 없습니다.');
      }
      
      return updatedDoc;
    } catch (error) {
      console.error(`Firebase ${this.collectionName} update 오류:`, error);
      throw new FirebaseServiceError(
        `문서 업데이트 실패: ${id}`,
        'UPDATE_DOCUMENT_FAILED',
        error as FirestoreError
      );
    }
  }

  // 문서 삭제
  async delete(id: string): Promise<void> {
    try {
      if (!firestore) throw new Error('Firestore가 초기화되지 않았습니다.');
      
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Firebase ${this.collectionName} delete 오류:`, error);
      throw new FirebaseServiceError(
        `문서 삭제 실패: ${id}`,
        'DELETE_DOCUMENT_FAILED',
        error as FirestoreError
      );
    }
  }
}

// ==================== 전문화된 서비스 클래스들 ====================

// 교사 서비스
export class TeacherService extends BaseFirebaseService<FirebaseTeacher> {
  constructor() {
    super(FIREBASE_COLLECTIONS.TEACHERS);
  }

  // 이메일로 교사 찾기
  async getByEmail(email: string): Promise<FirebaseTeacher | null> {
    const teachers = await this.getMany([
      { field: 'email', operator: '==', value: email.toLowerCase() }
    ]);
    return teachers.length > 0 ? teachers[0] : null;
  }

  // Firebase UID로 교사 찾기
  async getByFirebaseUid(uid: string): Promise<FirebaseTeacher | null> {
    const teachers = await this.getMany([
      { field: 'firebaseUid', operator: '==', value: uid }
    ]);
    return teachers.length > 0 ? teachers[0] : null;
  }

  // 마지막 로그인 시간 업데이트
  async updateLastLogin(id: string): Promise<FirebaseTeacher> {
    return this.update(id, { lastLoginAt: Timestamp.now() });
  }

  // 권한 확인 메서드
  hasPermission(teacher: FirebaseTeacher, permission: keyof FirebaseTeacher['permissions']): boolean {
    return teacher.permissions[permission] === true;
  }

  // 표시명 생성
  getDisplayName(teacher: FirebaseTeacher): string {
    if (teacher.position && teacher.school) {
      return `${teacher.name} (${teacher.school} ${teacher.position})`;
    } else if (teacher.school) {
      return `${teacher.name} (${teacher.school})`;
    }
    return teacher.name;
  }
}

// 클래스 서비스
export class ClassService extends BaseFirebaseService<FirebaseClass> {
  constructor() {
    super(FIREBASE_COLLECTIONS.CLASSES);
  }

  // 교사의 클래스들 조회
  async getByTeacherId(teacherId: string): Promise<FirebaseClass[]> {
    return this.getMany([
      { field: 'teacherId', operator: '==', value: teacherId },
      { field: 'isActive', operator: '==', value: true }
    ], [
      { field: 'createdAt', direction: 'desc' }
    ]);
  }

  // 클래스 코드로 찾기
  async getByCode(code: string): Promise<FirebaseClass | null> {
    const classes = await this.getMany([
      { field: 'code', operator: '==', value: code.toUpperCase() }
    ]);
    return classes.length > 0 ? classes[0] : null;
  }

  // 세션 코드로 찾기
  async getBySessionCode(sessionCode: string): Promise<FirebaseClass | null> {
    const classes = await this.getMany([
      { field: 'sessionCode', operator: '==', value: sessionCode }
    ]);
    return classes.length > 0 ? classes[0] : null;
  }
}

// 학생 서비스  
export class StudentService extends BaseFirebaseService<FirebaseStudent> {
  constructor() {
    super(FIREBASE_COLLECTIONS.STUDENTS);
  }

  // 클래스의 학생들 조회
  async getByClassId(classId: string): Promise<FirebaseStudent[]> {
    return this.getMany([
      { field: 'classId', operator: '==', value: classId },
      { field: 'isActive', operator: '==', value: true }
    ], [
      { field: 'name', direction: 'asc' }
    ]);
  }

  // 접근 코드로 학생 찾기
  async getByAccessCode(accessCode: string): Promise<FirebaseStudent | null> {
    const students = await this.getMany([
      { field: 'accessCode', operator: '==', value: accessCode }
    ]);
    return students.length > 0 ? students[0] : null;
  }

  // 세션 코드로 학생들 찾기
  async getBySessionCode(sessionCode: string): Promise<FirebaseStudent[]> {
    return this.getMany([
      { field: 'sessionCode', operator: '==', value: sessionCode },
      { field: 'isActive', operator: '==', value: true }
    ]);
  }
}

// 의견 서비스
export class OpinionService extends BaseFirebaseService<FirebaseOpinion> {
  constructor() {
    super(FIREBASE_COLLECTIONS.OPINIONS);
  }

  // 교사의 의견들 조회
  async getByTeacherId(teacherId: string): Promise<FirebaseOpinion[]> {
    return this.getMany([
      { field: 'teacherId', operator: '==', value: teacherId }
    ], [
      { field: 'submittedAt', direction: 'desc' }
    ]);
  }

  // 클래스의 의견들 조회
  async getByClassId(classId: string): Promise<FirebaseOpinion[]> {
    return this.getMany([
      { field: 'classId', operator: '==', value: classId }
    ], [
      { field: 'submittedAt', direction: 'desc' }
    ]);
  }

  // 상태별 의견들 조회
  async getByStatus(teacherId: string, status: FirebaseOpinion['status']): Promise<FirebaseOpinion[]> {
    return this.getMany([
      { field: 'teacherId', operator: '==', value: teacherId },
      { field: 'status', operator: '==', value: status }
    ], [
      { field: 'submittedAt', direction: 'desc' }
    ]);
  }

  // 참조 코드로 의견 찾기
  async getByReferenceCode(referenceCode: string): Promise<FirebaseOpinion | null> {
    const opinions = await this.getMany([
      { field: 'referenceCode', operator: '==', value: referenceCode }
    ]);
    return opinions.length > 0 ? opinions[0] : null;
  }
}

// 알림 서비스
export class NotificationService extends BaseFirebaseService<FirebaseNotification> {
  constructor() {
    super(FIREBASE_COLLECTIONS.NOTIFICATIONS);
  }

  // 교사의 알림들 조회
  async getByTeacherId(teacherId: string, unreadOnly = false): Promise<FirebaseNotification[]> {
    const filters = [{ field: 'teacherId', operator: '==', value: teacherId }] as FirebaseQueryFilter[];
    
    if (unreadOnly) {
      filters.push({ field: 'isRead', operator: '==', value: false });
    }
    
    return this.getMany(filters, [
      { field: 'createdAt', direction: 'desc' }
    ]);
  }

  // 알림 읽음 처리
  async markAsRead(id: string): Promise<FirebaseNotification> {
    return this.update(id, { isRead: true });
  }
}

// 피드백 템플릿 서비스
export class FeedbackTemplateService extends BaseFirebaseService<FirebaseFeedbackTemplate> {
  constructor() {
    super(FIREBASE_COLLECTIONS.FEEDBACK_TEMPLATES);
  }

  // 교사의 템플릿들 조회
  async getByTeacherId(teacherId: string): Promise<FirebaseFeedbackTemplate[]> {
    return this.getMany([
      { field: 'teacherId', operator: '==', value: teacherId },
      { field: 'isActive', operator: '==', value: true }
    ], [
      { field: 'usage.count', direction: 'desc' }
    ]);
  }

  // 템플릿 사용 횟수 증가
  async incrementUsage(id: string): Promise<FirebaseFeedbackTemplate> {
    const template = await this.getById(id);
    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    return this.update(id, {
      usage: {
        count: template.usage.count + 1,
        lastUsed: Timestamp.now()
      }
    });
  }
}

// ==================== 서비스 인스턴스 생성 ====================

export const teacherService = new TeacherService();
export const classService = new ClassService();
export const studentService = new StudentService();
export const opinionService = new OpinionService();
export const notificationService = new NotificationService();
export const feedbackTemplateService = new FeedbackTemplateService();