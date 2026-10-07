/**
 * 공유 콘텐츠 데이터베이스 접근 계층
 * Phase 2: Firebase Admin SDK로 권한 문제 해결
 * 
 * ✅ Admin SDK 사용으로 보안 규칙 우회 및 서버사이드 권한 보장
 */

import { getAdminDatabase } from '@/lib/firebase-admin';

/**
 * 공유 세션 데이터 구조
 */
export interface SharedSession {
  id?: string;
  originalSessionId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  content?: string;
  
  // 세션 데이터 (학생 데이터 완전 제외)
  materials: Array<{
    id: string;
    type: 'text' | 'youtube' | 'link' | 'file';
    title: string;
    content: string;
    url?: string;
  }>;
  
  // 공유 메타데이터
  shareType: 'public' | 'restricted';
  tags: string[];
  category: string;
  targetGrade: '1-2학년' | '3-4학년' | '5-6학년';
  
  // 통계 정보
  viewCount: number;
  importCount: number;
  likeCount: number;
  
  // 가져오기 추적
  importedBy: Record<string, {
    importedAt: number;
    customTitle?: string;
  }>;
  
  // 타임스탬프
  createdAt: number;
  updatedAt: number;
  
  // 상태 관리
  isActive: boolean;
  moderation: {
    status: 'approved' | 'pending' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: number;
  };
}

/**
 * 공유 주제 데이터 구조
 */
export interface SharedTopic {
  id?: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  content?: string;
  
  // AI 관련 정보
  aiGenerated: boolean;
  originalPrompt?: string;
  aiModel?: string;
  generatedAt?: number;
  
  // 토론 정보
  debateType: '찬반' | '자유' | '정책';
  difficulty: '초급' | '중급' | '고급';
  estimatedTime: number;
  
  // 관련 자료
  relatedTopics: string[];
  keywords: string[];
  agendas?: string[];
  
  // 분류 정보
  subject: '국어' | '사회' | '과학' | '기타';
  grade: '1-2학년' | '3-4학년' | '5-6학년';
  tags: string[];
  
  // 커뮤니티 정보
  viewCount: number;
  useCount: number;
  ratingAverage: number;
  ratingCount: number;
  
  // 타임스탬프
  createdAt: number;
  updatedAt: number;
  
  // 상태 관리
  isActive: boolean;
  moderation: {
    status: 'approved' | 'pending' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: number;
  };
}

/**
 * 페이지네이션 매개변수
 */
export interface PaginationParams {
  page: number;
  limit: number;
  category?: string;
  targetGrade?: string;
  sortBy?: 'latest' | 'popular' | 'mostImported';
  search?: string;
}

/**
 * 페이지네이션 결과
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
  };
}

/**
 * Firebase Admin SDK 초기화
 */
function initializeAdminSDK() {
  const database = getAdminDatabase();
  if (!database) throw new Error('Firebase Admin Database is unavailable');
  return database;
}

/**
 * Feature Flag 확인 (개발 단계에서만 사용)
 */
function checkSharingEnabled(): boolean {
  // 서버사이드에서는 NEXT_PUBLIC_ 접두사 없이 사용
  const enabled = process.env.ENABLE_SHARING === 'true';
  const debug = process.env.SHARING_DEBUG === 'true';
  
  console.log('🔍 shared-db.ts 환경변수 디버깅 (Always Works™):', {
    // 서버사이드 환경변수 (올바른 방법)
    ENABLE_SHARING: process.env.ENABLE_SHARING,
    SHARING_DEBUG: process.env.SHARING_DEBUG,
    // 클라이언트사이드 환경변수 (참고용)
    NEXT_PUBLIC_ENABLE_SHARING: process.env.NEXT_PUBLIC_ENABLE_SHARING,
    NEXT_PUBLIC_SHARING_DEBUG: process.env.NEXT_PUBLIC_SHARING_DEBUG,
    enabled,
    debug
  });
  
  if (!enabled) {
    console.log('📍 shared-db.ts: 공유 기능이 비활성화되어 있습니다. 서버사이드 ENABLE_SHARING=true로 설정하세요.');
  }
  
  return enabled;
}

/**
 * 공유 세션 생성 (Admin SDK 사용)
 */
export async function createSharedSession(sessionData: Omit<SharedSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!checkSharingEnabled()) {
    throw new Error('공유 기능이 비활성화되어 있습니다.');
  }
  
  console.log('📤 Admin SDK로 공유 세션 생성 시작');
  const database = initializeAdminSDK();
  
  const sharedSessionsRef = database.ref('sharedSessions');
  const newSessionRef = sharedSessionsRef.push();
  
  const newSession: SharedSession = {
    ...sessionData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    viewCount: 0,
    importCount: 0,
    likeCount: 0,
    importedBy: {},
    isActive: true,
    moderation: {
      status: 'approved' // Phase 2에서는 자동 승인
    }
  };
  
  console.log('💾 공유 세션 데이터베이스 쓰기 시작:', {
    sessionId: newSessionRef.key,
    materialsCount: newSession.materials?.length
  });
  
  await newSessionRef.set(newSession);
  
  console.log('✅ Admin SDK로 공유 세션 생성 완료:', newSessionRef.key);
  return newSessionRef.key!;
}

/**
 * 공유 세션 목록 조회 (페이지네이션) - Admin SDK 사용
 */
export async function getSharedSessions(params: PaginationParams): Promise<PaginatedResult<SharedSession>> {
  if (!checkSharingEnabled()) {
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false
      }
    };
  }
  
  console.log('📚 Admin SDK로 공유 세션 목록 조회 시작');
  
  try {
    const database = initializeAdminSDK();
    
    const sharedSessionsRef = database.ref('sharedSessions');
    
    // Admin SDK는 다른 문법 사용
    const snapshot = await sharedSessionsRef.once('value');
    const data = snapshot.val() || {};
    
    // Phase 1: 빈 데이터인 경우 안전하게 처리
    if (!data || Object.keys(data).length === 0) {
      console.log('📍 Admin SDK: 공유 세션 데이터가 비어있음 (정상)');
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false
        }
      };
    }
    
    // 데이터를 배열로 변환하고 ID 추가
    let sessions: SharedSession[] = Object.entries(data)
      .map(([id, session]) => ({ id, ...session as SharedSession }))
      .filter(session => {
        // 활성 세션만 필터링
        if (!session.isActive) return false;
        
        // 공개 세션만 표시 (보안)
        if (session.shareType !== 'public') return false;
        
        // 카테고리 필터링
        if (params.category && params.category !== 'all' && session.category !== params.category) {
          return false;
        }
        
        // 학년 필터링
        if (params.targetGrade && params.targetGrade !== 'all' && session.targetGrade !== params.targetGrade) {
          return false;
        }
        
        // 검색 필터링
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          if (!session.title.toLowerCase().includes(searchTerm) &&
              !session.description.toLowerCase().includes(searchTerm)) {
            return false;
          }
        }
        
        return true;
      });

    // 정렬 적용
    switch (params.sortBy) {
      case 'popular':
        sessions.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'mostImported':
        sessions.sort((a, b) => (b.importCount || 0) - (a.importCount || 0));
        break;
      case 'latest':
      default:
        sessions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }
    
    // 페이지네이션 계산
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedSessions = sessions.slice(startIndex, endIndex);
    
    // 민감한 정보 제거 (보안)
    const sanitizedSessions = paginatedSessions.map(session => ({
      ...session,
      teacherId: '', // 교사 ID 숨김
      originalSessionId: '' // 원본 세션 ID 숨김
    }));
    
    console.log(`✅ Admin SDK 공유 세션 조회 완료: ${paginatedSessions.length}개 세션`);
    
    return {
      data: sanitizedSessions,
      pagination: {
        currentPage: params.page,
        totalPages: Math.ceil(sessions.length / params.limit),
        totalCount: sessions.length,
        hasNext: endIndex < sessions.length
      }
    };
  } catch (error) {
    console.error('❌ Admin SDK getSharedSessions 오류:', error);
    // Phase 1: 오류 시 빈 결과 반환 (기존 시스템에 영향 없음)
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false
      }
    };
  }
}

/**
 * 특정 공유 세션 조회 (Admin SDK 사용)
 */
export async function getSharedSession(sessionId: string): Promise<SharedSession | null> {
  if (!checkSharingEnabled()) {
    return null;
  }
  
  console.log('🔍 getSharedSession 시작:', sessionId);
  
  try {
    const database = initializeAdminSDK();
    const sessionRef = database.ref(`sharedSessions/${sessionId}`);
    const snapshot = await sessionRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('❌ 공유 세션을 찾을 수 없음:', sessionId);
      return null;
    }
    
    const sessionData = snapshot.val() as SharedSession;
    console.log('✅ 공유 세션 조회 성공:', {
      id: sessionId,
      title: sessionData.title,
      materialsCount: sessionData.materials?.length || 0
    });
    
    return {
      id: sessionId,
      ...sessionData
    };
  } catch (error) {
    console.error('❌ getSharedSession 오류:', error);
    throw error;
  }
}

/**
 * 공유 주제 생성 (Admin SDK 사용)
 */
export async function createSharedTopic(topicData: Omit<SharedTopic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!checkSharingEnabled()) {
    throw new Error('공유 기능이 비활성화되어 있습니다.');
  }
  
  console.log('📝 공유 주제 생성 시작');
  
  try {
    const database = initializeAdminSDK();
    const sharedTopicsRef = database.ref('shared-scenarios');
    const newTopicRef = sharedTopicsRef.push();
    
    const newTopic: SharedTopic = {
      ...topicData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewCount: 0,
      useCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      relatedTopics: topicData.relatedTopics || [],
      keywords: topicData.keywords || [],
      isActive: true,
      moderation: {
        status: 'approved' // Phase 1에서는 자동 승인
      }
    };
    
    await newTopicRef.set(newTopic);
    console.log('✅ 공유 주제 생성 완료:', newTopicRef.key);
    return newTopicRef.key!;
  } catch (error) {
    console.error('❌ 공유 주제 생성 오류:', error);
    throw error;
  }
}

/**
 * 공유 주제 목록 조회 (페이지네이션) - Admin SDK 사용
 */
export async function getSharedTopics(params: PaginationParams): Promise<PaginatedResult<SharedTopic>> {
  if (!checkSharingEnabled()) {
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false
      }
    };
  }
  
  console.log('📚 Admin SDK로 공유 주제 목록 조회 시작');
  
  try {
    const database = initializeAdminSDK();
    
    const sharedTopicsRef = database.ref('shared-scenarios');
    
    // Admin SDK로 데이터 조회
    const snapshot = await sharedTopicsRef.once('value');
    const data = snapshot.val() || {};
    
    // 빈 데이터인 경우 안전하게 처리
    if (!data || Object.keys(data).length === 0) {
      console.log('📍 Admin SDK: 공유 주제 데이터가 비어있음 (정상)');
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false
        }
      };
    }
    
    // 데이터를 배열로 변환하고 ID 추가
    let topics: SharedTopic[] = Object.entries(data)
      .map(([id, topic]) => ({ id, ...topic as SharedTopic }))
      .filter(topic => {
        // 활성 주제만 필터링
        if (!topic.isActive) return false;
        
        // 승인된 주제만 표시 (보안)
        if (topic.moderation?.status !== 'approved') return false;
        
        // 카테고리 필터링
        if (params.category && params.category !== 'all' && topic.subject !== params.category) {
          return false;
        }
        
        // 학년 필터링
        if (params.targetGrade && params.targetGrade !== 'all' && topic.grade !== params.targetGrade) {
          return false;
        }
        
        // 검색 필터링
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          if (!topic.title.toLowerCase().includes(searchTerm) &&
              !topic.description.toLowerCase().includes(searchTerm)) {
            return false;
          }
        }
        
        return true;
      });

    // 정렬 적용
    switch (params.sortBy) {
      case 'popular':
        topics.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
        break;
      case 'mostImported':
        topics.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
        break;
      case 'latest':
      default:
        topics.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }
    
    // 페이지네이션 계산
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedTopics = topics.slice(startIndex, endIndex);
    
    // 민감한 정보 제거 (보안)
    const sanitizedTopics = paginatedTopics.map(topic => ({
      ...topic,
      teacherId: '' // 교사 ID 숨김
    }));
    
    console.log(`✅ Admin SDK 공유 주제 조회 완료: ${paginatedTopics.length}개 주제`);
    
    return {
      data: sanitizedTopics,
      pagination: {
        currentPage: params.page,
        totalPages: Math.ceil(topics.length / params.limit),
        totalCount: topics.length,
        hasNext: endIndex < topics.length
      }
    };
  } catch (error) {
    console.error('❌ Admin SDK getSharedTopics 오류:', error);
    // 오류 시 빈 결과 반환 (기존 시스템에 영향 없음)
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false
      }
    };
  }
}

/**
 * 특정 공유 토론 주제 조회 (Admin SDK 사용)
 */
export async function getSharedTopic(topicId: string): Promise<SharedTopic | null> {
  if (!checkSharingEnabled()) {
    return null;
  }
  
  console.log('📖 공유 토론 주제 단일 조회 시작:', topicId);
  
  try {
    const database = initializeAdminSDK();
    const topicRef = database.ref(`shared-scenarios/${topicId}`);
    const snapshot = await topicRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('❌ 공유 토론 주제를 찾을 수 없음:', topicId);
      return null;
    }
    
    const topicData = snapshot.val() as SharedTopic;
    
    // 비활성화되었거나 승인되지 않은 주제는 반환하지 않음
    if (!topicData.isActive || topicData.moderation?.status !== 'approved') {
      console.log('❌ 비활성화되었거나 승인되지 않은 주제:', topicId);
      return null;
    }
    
    console.log('✅ 공유 토론 주제 조회 성공:', {
      id: topicId,
      title: topicData.title,
      category: topicData.subject
    });
    
    // 조회수 증가
    try {
      await topicRef.update({
        viewCount: (topicData.viewCount || 0) + 1,
        updatedAt: Date.now()
      });
    } catch (viewError) {
      console.warn('⚠️ 조회수 업데이트 실패 (조회는 성공):', viewError);
    }
    
    return {
      id: topicId,
      ...topicData
    };
  } catch (error) {
    console.error('❌ getSharedTopic 오류:', error);
    throw error;
  }
}

/**
 * 세션 가져오기 통계 업데이트 (Admin SDK 사용)
 */
export async function incrementImportCount(sessionId: string, importInfo: { teacherId: string; importedAt: number; customTitle?: string }): Promise<void> {
  if (!checkSharingEnabled()) {
    return;
  }
  
  console.log('📊 통계 업데이트 시작:', { sessionId, teacherId: importInfo.teacherId });
  
  try {
    const database = initializeAdminSDK();
    const sessionRef = database.ref(`sharedSessions/${sessionId}`);
    const snapshot = await sessionRef.once('value');
    
    if (snapshot.exists()) {
      const session = snapshot.val() as SharedSession;
      const updates = {
        importCount: (session.importCount || 0) + 1,
        [`importedBy/${importInfo.teacherId}`]: importInfo,
        updatedAt: Date.now()
      };
      
      await sessionRef.update(updates);
      console.log('✅ 통계 업데이트 완료:', {
        newImportCount: updates.importCount,
        sessionId
      });
    } else {
      console.warn('⚠️ 공유 세션을 찾을 수 없어 통계를 업데이트하지 않음:', sessionId);
    }
  } catch (error) {
    console.error('❌ 통계 업데이트 오료:', error);
    throw error;
  }
}

/**
 * 개발/테스트용 유틸리티 함수들
 */
export const SharedDBUtils = {
  /**
   * 개발 환경에서 테스트 데이터 생성
   */
  async createTestData(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('테스트 데이터는 개발 환경에서만 생성할 수 있습니다.');
      return;
    }
    
    console.log('🧪 테스트 데이터 생성 중...');
    
    // 테스트 공유 세션 생성
    const testSession: Omit<SharedSession, 'id' | 'createdAt' | 'updatedAt'> = {
      originalSessionId: 'test_session_001',
      teacherId: 'test_teacher_001',
      teacherName: '테스트 교사',
      title: '환경 보호를 위한 토론',
      description: '기후 변화와 환경 보호에 대한 다양한 관점을 토론해봅시다.',
      materials: [
        {
          id: 'material_1',
          type: 'text',
          title: '환경 보호의 중요성',
          content: '환경 보호는 현재와 미래 세대를 위한 필수적인 과제입니다.'
        }
      ],
      shareType: 'public',
      tags: ['환경', '기후변화', '과학'],
      category: 'science',
      targetGrade: '5-6학년',
      viewCount: 0,
      importCount: 0,
      likeCount: 0,
      importedBy: {},
      isActive: true,
      moderation: {
        status: 'approved'
      }
    };
    
    try {
      await createSharedSession(testSession);
      console.log('✅ 테스트 세션 데이터 생성 완료');
    } catch (error) {
      console.error('❌ 테스트 데이터 생성 실패:', error);
    }
  },
  
  /**
   * 공유 기능 상태 확인
   */
  getFeatureStatus(): { sharing: boolean; community: boolean; debug: boolean } {
    return {
      sharing: process.env.NEXT_PUBLIC_ENABLE_SHARING === 'true',
      community: process.env.NEXT_PUBLIC_ENABLE_COMMUNITY === 'true',
      debug: process.env.NEXT_PUBLIC_SHARING_DEBUG === 'true'
    };
  }
};

export default {
  createSharedSession,
  getSharedSessions,
  getSharedSession,
  createSharedTopic,
  getSharedTopic,
  getSharedTopics,
  incrementImportCount,
  SharedDBUtils
};
