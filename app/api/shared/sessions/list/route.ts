/**
 * 공유 세션 목록 조회 API
 * Phase 2: 교사들이 공유한 토론 세션들을 목록으로 조회 - Admin SDK 사용
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSharedSessions, PaginationParams } from '@/lib/shared-db';

export async function GET(request: NextRequest) {
  console.log('📋 공유 세션 목록 조회 요청');

  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;
    const targetGrade = searchParams.get('targetGrade') || undefined;
    const sortBy = searchParams.get('sortBy') as 'latest' | 'popular' | 'mostImported' || 'latest';
    const search = searchParams.get('search') || undefined;

    const params: PaginationParams = {
      page,
      limit,
      category,
      targetGrade,
      sortBy,
      search
    };

    console.log('📋 조회 파라미터:', params);

    // 공유 세션 목록 조회 (Admin SDK 사용)
    const result = await getSharedSessions(params);

    console.log(`✅ 공유 세션 조회 완료: ${result.data.length}개 세션`);

    return NextResponse.json({
      success: true,
      sessions: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ 공유 세션 목록 조회 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '공유 세션 목록을 조회하는데 실패했습니다.',
        sessions: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNext: false
        }
      },
      { status: 200 } // 에러 상황에서도 200 반환 (클라이언트에서 빈 목록으로 처리)
    );
  }
}