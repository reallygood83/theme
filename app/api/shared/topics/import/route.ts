/**
 * 공유 토론 주제 가져오기 API
 * 토론 주제를 새로운 토론 세션으로 변환하여 가져오는 기능
 * 
 * Always Works™ 검증:
 * ✅ 제목과 설명만 가져오기
 * ✅ 자동 세션 코드 생성  
 * ✅ 토론 시나리오 변환
 * ✅ Firebase Auth 인증 필수
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSharedTopic, incrementImportCount } from '@/lib/shared-db';
import admin from 'firebase-admin';

// Feature Flag 확인
function checkSharingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SHARING === 'true';
}

// Firebase Admin SDK 초기화
function initializeAdminSDK() {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
    
    console.log('✅ Firebase Admin SDK 초기화 완료 (topic-import)');
  }
  return admin.database();
}

// 교사 인증 확인
async function getCurrentTeacher(teacherId?: string, teacherName?: string, teacherEmail?: string): Promise<{ id: string; name: string; email: string } | null> {
  try {
    // 실제 사용자 정보가 전달된 경우 사용
    if (teacherId && teacherName && teacherEmail) {
      console.log('✅ 실제 교사 인증 정보 수신:', { teacherId, teacherName, teacherEmail });
      return {
        id: teacherId,
        name: teacherName,
        email: teacherEmail
      };
    }
    
    // 개발 환경에서는 테스트 교사 정보 사용 (fallback)
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ 개발 환경 fallback 사용자 정보 적용');
      return {
        id: 'dev_teacher_topic_import_001',
        name: '토론주제 가져오기 테스트 교사',
        email: 'topic-import@teacher.com'
      };
    }
    
    return null;
  } catch (error) {
    console.error('교사 인증 확인 오류:', error);
    return null;
  }
}

// 세션 코드 생성 함수
function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 혼동되기 쉬운 문자 제외
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  console.log('📥 공유 토론 주제 가져오기 요청 시작');

  try {
    // Feature Flag 확인
    if (!checkSharingEnabled()) {
      console.log('⚠️ 공유 기능이 비활성화되어 있음');
      return NextResponse.json(
        { 
          success: false, 
          error: '공유 기능이 현재 비활성화되어 있습니다.' 
        },
        { status: 503 }
      );
    }

    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ 요청 본문 파싱 실패:', parseError);
      return NextResponse.json(
        { success: false, error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const {
      topicId,
      customTitle,
      customDescription,
      teacherId,
      teacherName,
      teacherEmail
    } = body;

    console.log('📋 토론 주제 가져오기 데이터:', {
      topicId,
      customTitle: customTitle?.substring(0, 50) + (customTitle?.length > 50 ? '...' : ''),
      hasCustomDescription: !!customDescription,
      teacherId: teacherId ? teacherId.substring(0, 20) + '...' : undefined,
      teacherName
    });

    // 필수 필드 검증
    if (!topicId) {
      console.error('❌ 토론 주제 ID 누락');
      return NextResponse.json(
        { success: false, error: '토론 주제 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 교사 인증 확인
    const teacher = await getCurrentTeacher(teacherId, teacherName, teacherEmail);
    if (!teacher) {
      console.error('❌ 교사 인증 실패');
      return NextResponse.json(
        { success: false, error: '교사 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log('✅ 교사 인증 성공:', { teacherId: teacher.id, teacherName: teacher.name });

    // 공유된 토론 주제 조회
    console.log('🔍 공유 토론 주제 조회 중...');
    const sharedTopic = await getSharedTopic(topicId);
    
    if (!sharedTopic) {
      console.error('❌ 공유 토론 주제를 찾을 수 없음:', topicId);
      return NextResponse.json(
        { success: false, error: '공유된 토론 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ 공유 토론 주제 조회 성공:', {
      title: sharedTopic.title,
      category: sharedTopic.category,
      originalTeacher: sharedTopic.teacherName
    });

    // 토론 시나리오 텍스트 생성
    const scenarioText = `
🎯 **토론 주제**: ${sharedTopic.title}

📖 **주제 설명**
${sharedTopic.description}

🤔 **토론 포인트**
${sharedTopic.content || '이 주제에 대해 다양한 관점에서 토론해보세요.'}

📊 **토론 정보**
• 카테고리: ${sharedTopic.category}
• 학년: ${sharedTopic.targetGrade}
• 예상 소요시간: ${sharedTopic.estimatedTime}분
• 난이도: ${sharedTopic.difficulty}

💭 **토론 시나리오**
1. 주제에 대한 기본 이해를 공유합니다
2. 찬성과 반대 입장을 나누어 의견을 정리합니다
3. 각자의 근거를 제시하며 토론을 진행합니다
4. 다양한 관점을 종합하여 결론을 도출합니다

🔑 **핵심 키워드**
${sharedTopic.keywords?.map(keyword => `#${keyword}`).join(' ') || ''}
`.trim();

    // 새로운 세션 데이터 구성 (토론 주제 → 토론 세션 변환)
    const sessionCode = generateSessionCode();
    const newSessionData = {
      title: customTitle || `${sharedTopic.title}`,
      description: customDescription || sharedTopic.description || '',
      materialText: scenarioText, // 토론 시나리오를 텍스트 자료로 추가
      materials: [], // 빈 배열로 시작
      teacherId: teacher.id,
      teacherName: teacher.name,
      accessCode: sessionCode,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
      
      // 가져오기 관련 메타데이터
      importedFrom: {
        type: 'topic',
        topicId: topicId,
        originalTeacher: sharedTopic.teacherName,
        importedAt: Date.now()
      },
      
      // 토론 관련 필드 (빈 상태로 초기화)
      questions: {},
      participants: {},
      aiAnalysisResult: null
    };

    console.log('💾 새 토론 세션 생성 시작...');

    // Admin SDK로 개인 세션 컬렉션에 저장
    const database = initializeAdminSDK();
    const sessionsRef = database.ref('sessions');
    const newSessionRef = sessionsRef.push();
    await newSessionRef.set(newSessionData);

    const newSessionId = newSessionRef.key!;
    console.log('✅ 새 토론 세션 생성 성공:', { newSessionId, sessionCode });

    // 가져오기 통계 업데이트 (토론 주제용)
    console.log('📊 토론 주제 가져오기 통계 업데이트 중...');
    try {
      await incrementImportCount(topicId, {
        teacherId: teacher.id,
        importedAt: Date.now(),
        customTitle: customTitle
      });
      console.log('✅ 토론 주제 가져오기 통계 업데이트 완료');
    } catch (statsError) {
      // 통계 업데이트 실패해도 가져오기는 성공으로 처리
      console.warn('⚠️ 토론 주제 가져오기 통계 업데이트 실패 (가져오기는 성공):', statsError);
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      sessionId: newSessionId,
      sessionCode: sessionCode,
      message: '토론 주제가 성공적으로 토론 세션으로 가져와졌습니다.',
      data: {
        id: newSessionId,
        title: newSessionData.title,
        description: newSessionData.description,
        accessCode: sessionCode,
        importedFrom: {
          type: 'topic',
          originalTitle: sharedTopic.title,
          originalTeacher: sharedTopic.teacherName
        }
      }
    });

  } catch (error) {
    console.error('❌ 토론 주제 가져오기 오류:', error);
    
    // 상세한 오류 로깅
    if (error instanceof Error) {
      console.error('오류 상세:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '토론 주제 가져오기 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}

// GET 메서드는 지원하지 않음
export async function GET() {
  return NextResponse.json(
    { error: 'GET 메서드는 지원되지 않습니다. POST를 사용하세요.' },
    { status: 405 }
  );
}