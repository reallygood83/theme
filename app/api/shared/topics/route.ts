/**
 * 공유 주제 API 라우트
 * Phase 1: 기본 구조 및 스키마 검증
 * 
 * GET /api/shared/topics - 공유 주제 목록 조회 (페이지네이션)
 * POST /api/shared/topics - AI 생성 주제 공유
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSharedTopic } from '@/lib/shared-db';

/**
 * Phase 1: 간소화된 사용자 검증
 */
async function getCurrentUser(request: NextRequest) {
  // Phase 1: 개발 단계에서는 mock 사용자 반환
  if (process.env.NODE_ENV === 'development') {
    return {
      uid: 'dev_user_001',
      email: 'dev@test.com',
      displayName: 'Phase 1 개발자'
    };
  }
  
  return null;
}

/**
 * GET /api/shared/topics
 * 공유 주제 목록 조회 (Phase 1: 기본 구조만)
 */
export async function GET(request: NextRequest) {
  try {
    // Feature Flag 확인
    if (process.env.NEXT_PUBLIC_ENABLE_SHARING !== 'true') {
      return NextResponse.json(
        { error: '공유 기능이 비활성화되어 있습니다.' },
        { status: 503 }
      );
    }
    
    console.log('📍 Phase 1: 공유 주제 목록 조회 요청 (기본 구조)');
    
    // Phase 1: 빈 배열 반환 (실제 구현은 Phase 3에서)
    return NextResponse.json({
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false
      }
    });
    
  } catch (error) {
    console.error('공유 주제 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '주제 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shared/topics
 * AI 생성 주제 공유 (Phase 1: 기본 검증)
 */
export async function POST(request: NextRequest) {
  try {
    // Feature Flag 확인
    if (process.env.NEXT_PUBLIC_ENABLE_SHARING !== 'true') {
      return NextResponse.json(
        { error: '공유 기능이 비활성화되어 있습니다.' },
        { status: 503 }
      );
    }
    
    // 사용자 인증 확인
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // 입력 데이터 검증
    const requiredFields = ['title', 'description', 'debateType', 'difficulty', 'subject', 'grade'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} 필드가 필요합니다.` },
          { status: 400 }
        );
      }
    }
    
    // 유효한 값 검증
    const validDebateTypes = ['찬반', '자유', '정책'];
    const validDifficulties = ['초급', '중급', '고급'];
    const validSubjects = ['국어', '사회', '과학', '기타'];
    const validGrades = ['초등', '중등', '고등'];
    
    if (!validDebateTypes.includes(data.debateType)) {
      return NextResponse.json(
        { error: '유효하지 않은 토론 유형입니다.' },
        { status: 400 }
      );
    }
    
    if (!validDifficulties.includes(data.difficulty)) {
      return NextResponse.json(
        { error: '유효하지 않은 난이도입니다.' },
        { status: 400 }
      );
    }
    
    if (!validSubjects.includes(data.subject)) {
      return NextResponse.json(
        { error: '유효하지 않은 과목입니다.' },
        { status: 400 }
      );
    }
    
    if (!validGrades.includes(data.grade)) {
      return NextResponse.json(
        { error: '유효하지 않은 학년입니다.' },
        { status: 400 }
      );
    }
    
    console.log('📍 Phase 1: 토론 주제 공유 요청 처리 시작', {
      teacherId: user.uid,
      title: data.title,
      subject: data.subject,
      grade: data.grade
    });
    
    // 공유 주제 데이터 구성
    const sharedTopicData = {
      teacherId: user.uid,
      teacherName: user.displayName || '익명 교사',
      title: data.title,
      description: data.description,
      
      // AI 관련 정보
      aiGenerated: data.aiGenerated || false,
      originalPrompt: data.originalPrompt,
      aiModel: data.aiModel || 'gemini-1.5',
      generatedAt: data.aiGenerated ? Date.now() : undefined,
      
      // 토론 정보
      debateType: data.debateType,
      difficulty: data.difficulty,
      estimatedTime: data.estimatedTime || 45, // 기본 45분
      
      // 관련 자료
      relatedTopics: data.relatedTopics || [],
      keywords: data.keywords || [],
      
      // 분류 정보
      subject: data.subject,
      grade: data.grade,
      tags: data.tags || [],
      
      // 커뮤니티 정보
      viewCount: 0,
      useCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      
      // 상태 관리
      isActive: true,
      moderation: {
        status: 'approved' as const // Phase 1에서는 자동 승인
      }
    };
    
    const topicId = await createSharedTopic(sharedTopicData);
    
    console.log('✅ Phase 1: 토론 주제 공유 완료', { topicId });
    
    return NextResponse.json({
      success: true,
      topicId,
      message: '토론 주제가 성공적으로 공유되었습니다!'
    });
    
  } catch (error) {
    console.error('토론 주제 공유 오류:', error);
    return NextResponse.json(
      { error: '토론 주제 공유에 실패했습니다.' },
      { status: 500 }
    );
  }
}