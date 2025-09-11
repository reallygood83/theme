/**
 * 공유 세션 API 라우트
 * Phase 1: 기본 CRUD 및 목록 조회 기능
 * 
 * GET /api/shared/sessions - 공유 세션 목록 조회 (페이지네이션)
 * POST /api/shared/sessions - 새 세션 공유
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSharedSessions, createSharedSession } from '@/lib/shared-db';

/**
 * Phase 1: 간소화된 사용자 검증 (인증은 Phase 2에서 구현)
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
  
  // Phase 2에서 실제 Firebase Auth 구현 예정
  return null;
}

/**
 * GET /api/shared/sessions
 * 공유 세션 목록 조회
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
    
    const searchParams = request.nextUrl.searchParams;
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      category: searchParams.get('category') || undefined,
      targetGrade: searchParams.get('targetGrade') || undefined,
      sortBy: (searchParams.get('sortBy') as 'latest' | 'popular' | 'mostImported') || 'latest',
      search: searchParams.get('search') || undefined
    };
    
    // 입력 검증
    if (params.page < 1 || params.limit < 1 || params.limit > 50) {
      return NextResponse.json(
        { error: '잘못된 페이지네이션 매개변수입니다.' },
        { status: 400 }
      );
    }
    
    const result = await getSharedSessions(params);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('공유 세션 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '세션 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shared/sessions
 * 새 세션 공유
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
    const requiredFields = ['originalSessionId', 'title', 'description', 'category', 'targetGrade'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} 필드가 필요합니다.` },
          { status: 400 }
        );
      }
    }
    
    // Phase 1: 기본 검증만 수행 (실제 원본 세션 검증은 Phase 2에서)
    console.log('📍 Phase 1: 세션 공유 요청 처리 시작', {
      teacherId: user.uid,
      originalSessionId: data.originalSessionId,
      title: data.title
    });
    
    // 공유 세션 데이터 구성
    const sharedSessionData = {
      originalSessionId: data.originalSessionId,
      teacherId: user.uid,
      teacherName: user.displayName || '익명 교사',
      title: data.title,
      description: data.description,
      materials: data.materials || [], // Phase 1: 빈 배열로 시작
      shareType: data.shareType || 'public',
      tags: data.tags || [],
      category: data.category,
      targetGrade: data.targetGrade,
      viewCount: 0,
      importCount: 0,
      likeCount: 0,
      importedBy: {},
      isActive: true,
      moderation: {
        status: 'approved' as const // Phase 1에서는 자동 승인
      }
    };
    
    const sessionId = await createSharedSession(sharedSessionData);
    
    console.log('✅ Phase 1: 세션 공유 완료', { sessionId });
    
    return NextResponse.json({
      success: true,
      sessionId,
      message: '세션이 성공적으로 공유되었습니다!'
    });
    
  } catch (error) {
    console.error('세션 공유 오류:', error);
    return NextResponse.json(
      { error: '세션 공유에 실패했습니다.' },
      { status: 500 }
    );
  }
}