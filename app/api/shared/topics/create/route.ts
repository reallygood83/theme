/**
 * 토론 주제 공유 API 라우트
 * AI 시나리오 생성기에서 생성된 토론 주제를 공유 가능한 형태로 저장
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSharedTopic, SharedTopic } from '@/lib/shared-db';

interface CreateTopicRequest {
  // 기본 정보
  title: string;
  description: string;
  
  // 교사 정보
  teacherId: string;
  teacherName: string;
  
  // 토론 정보
  debateType: '찬반' | '자유' | '정책';
  difficulty: '초급' | '중급' | '고급';
  estimatedTime: number;
  
  // 분류 정보
  subject: '국어' | '사회' | '과학' | '기타';
  grade: '1-2학년' | '3-4학년' | '5-6학년';
  tags: string[];
  
  // AI 생성 정보 (선택적)
  aiGenerated?: boolean;
  originalPrompt?: string;
  pros?: string[];
  cons?: string[];
  keyTerms?: string[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 토론 주제 공유 API 시작');
    
    const body = await request.json() as CreateTopicRequest;
    
    // 필수 필드 검증
    if (!body.title || !body.description || !body.teacherId || !body.teacherName) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    if (!body.debateType || !body.difficulty || !body.subject || !body.grade) {
      return NextResponse.json(
        { error: '토론 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // SharedTopic 형태로 데이터 변환
    const topicData: Omit<SharedTopic, 'id' | 'createdAt' | 'updatedAt'> = {
      // 기본 정보
      title: body.title,
      description: body.description,
      teacherId: body.teacherId,
      teacherName: body.teacherName,
      
      // AI 관련 정보
      aiGenerated: body.aiGenerated || true, // AI 시나리오 생성기에서 오는 경우 기본값
      originalPrompt: body.originalPrompt || undefined,
      aiModel: 'gemini-pro',
      generatedAt: Date.now(),
      
      // 토론 정보
      debateType: body.debateType,
      difficulty: body.difficulty,
      estimatedTime: body.estimatedTime || 40, // 기본값 40분
      
      // 관련 자료 (AI 생성 데이터에서 추출)
      relatedTopics: [],
      keywords: body.keyTerms || [],
      
      // 분류 정보
      subject: body.subject,
      grade: body.grade,
      tags: body.tags || [],
      
      // 커뮤니티 정보 (초기값)
      viewCount: 0,
      useCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      
      // 상태 관리
      isActive: true,
      moderation: {
        status: 'approved' // 교사가 생성한 내용은 자동 승인
      }
    };

    console.log('📤 공유 주제 생성 데이터:', {
      title: topicData.title,
      teacherName: topicData.teacherName,
      debateType: topicData.debateType,
      difficulty: topicData.difficulty,
      aiGenerated: topicData.aiGenerated
    });

    // Firebase Admin SDK를 통해 토론 주제 생성
    const sharedTopicId = await createSharedTopic(topicData);
    
    console.log('✅ 토론 주제 공유 완료:', sharedTopicId);
    
    return NextResponse.json({
      success: true,
      sharedTopicId,
      message: '토론 주제가 교육자료실에 성공적으로 공유되었습니다.'
    });

  } catch (error) {
    console.error('❌ 토론 주제 공유 오류:', error);
    
    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      if (error.message.includes('공유 기능이 비활성화')) {
        return NextResponse.json(
          { error: '공유 기능이 현재 비활성화되어 있습니다.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: `공유 실패: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '토론 주제 공유 중 알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}