/**
 * 공유된 토론 주제 목록 조회 API 라우트
 * Admin SDK를 통해 승인된 토론 주제들을 안전하게 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSharedTopics } from '@/lib/shared-db';

export async function GET(request: NextRequest) {
  try {
    console.log('📚 공유 토론 주제 목록 API 시작');
    
    // URL 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || 'all';
    const targetGrade = searchParams.get('targetGrade') || 'all';
    const sortBy = (searchParams.get('sortBy') || 'latest') as 'latest' | 'popular' | 'mostImported';
    const search = searchParams.get('search') || '';

    console.log('📊 조회 파라미터:', {
      page,
      limit,
      category,
      targetGrade,
      sortBy,
      search
    });

    // Admin SDK를 통한 토론 주제 조회
    const result = await getSharedTopics({
      page,
      limit,
      category,
      targetGrade,
      sortBy,
      search
    });

    console.log(`✅ 토론 주제 목록 조회 완료: ${result.data.length}개 주제`);

    return NextResponse.json({
      success: true,
      topics: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ 토론 주제 목록 조회 오류:', error);
    
    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      if (error.message.includes('공유 기능이 비활성화')) {
        return NextResponse.json({
          success: false,
          topics: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNext: false
          },
          message: '공유 기능이 현재 비활성화되어 있습니다.'
        });
      }
      
      return NextResponse.json(
        { error: `토론 주제 조회 실패: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '토론 주제 목록을 불러오는 중 알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}