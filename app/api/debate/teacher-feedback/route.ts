import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getOpinionModel from '@/lib/models/Opinion';
import getTeacherModel from '@/lib/models/Teacher';

// POST: 교사 피드백 추가
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { firebaseUid, opinionId, teacherFeedback } = body;

    if (!firebaseUid || !opinionId || !teacherFeedback) {
      return createErrorResponse('필수 정보가 누락되었습니다.');
    }

    if (teacherFeedback.trim().length < 5) {
      return createErrorResponse('피드백은 최소 5자 이상이어야 합니다.');
    }

    if (teacherFeedback.length > 2000) {
      return createErrorResponse('피드백은 2000자를 초과할 수 없습니다.');
    }

    // 교사 인증
    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Opinion = getOpinionModel();
    const opinion = await Opinion.findById(opinionId)
      .populate('studentId', 'name groupName')
      .populate('classId', 'name code');

    if (!opinion) {
      return createErrorResponse('의견을 찾을 수 없습니다.', 404);
    }

    // 교사 권한 확인
    if (opinion.teacherId.toString() !== teacher._id.toString()) {
      return createErrorResponse('해당 의견에 대한 피드백 권한이 없습니다.', 403);
    }

    // 교사 피드백 추가
    opinion.teacherFeedback = teacherFeedback.trim();
    opinion.teacherFeedbackAt = new Date();
    
    // 상태 업데이트: AI 피드백이 있으면 reviewed, 없으면 feedback_given
    if (opinion.aiFeedback) {
      opinion.status = 'reviewed'; // AI + 교사 피드백 모두 있음
    } else {
      opinion.status = 'feedback_given'; // 교사 피드백만 있음
    }

    await opinion.save();

    return createSuccessResponse({
      opinion,
      teacherInfo: {
        name: teacher.name,
        feedbackAt: opinion.teacherFeedbackAt
      }
    }, '교사 피드백이 추가되었습니다.');
  });
}

// GET: 교사별 피드백 현황 조회
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');
    const classId = searchParams.get('classId');

    if (!firebaseUid) {
      return createErrorResponse('Firebase UID가 필요합니다.');
    }

    // 교사 인증
    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Opinion = getOpinionModel();
    
    let baseQuery: any = { teacherId: teacher._id };
    if (classId) {
      baseQuery.classId = classId;
    }

    // 피드백 현황 통계
    const feedbackStats = {
      // 전체 의견 수
      totalOpinions: await Opinion.countDocuments(baseQuery),
      
      // 피드백 상태별 통계
      pending: await Opinion.countDocuments({ ...baseQuery, status: 'pending' }),
      aiFeedbackOnly: await Opinion.countDocuments({ 
        ...baseQuery, 
        aiFeedback: { $exists: true, $ne: null },
        teacherFeedback: { $exists: false }
      }),
      teacherFeedbackOnly: await Opinion.countDocuments({ 
        ...baseQuery, 
        teacherFeedback: { $exists: true, $ne: null },
        aiFeedback: { $exists: false }
      }),
      bothFeedbacks: await Opinion.countDocuments({ 
        ...baseQuery, 
        aiFeedback: { $exists: true, $ne: null },
        teacherFeedback: { $exists: true, $ne: null }
      }),
      
      // 오늘 작성한 교사 피드백 수
      todayTeacherFeedbacks: await Opinion.countDocuments({
        ...baseQuery,
        teacherFeedback: { $exists: true, $ne: null },
        teacherFeedbackAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),

      // 최근 7일간 교사 피드백 수
      weeklyTeacherFeedbacks: await Opinion.countDocuments({
        ...baseQuery,
        teacherFeedback: { $exists: true, $ne: null },
        teacherFeedbackAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    };

    // 최근 교사 피드백 목록 (최대 10개)
    const recentTeacherFeedbacks = await Opinion.find({
      ...baseQuery,
      teacherFeedback: { $exists: true, $ne: null }
    })
      .populate('studentId', 'name groupName')
      .populate('classId', 'name code')
      .sort({ teacherFeedbackAt: -1 })
      .limit(10)
      .select('topic content teacherFeedback teacherFeedbackAt studentId classId');

    return createSuccessResponse({
      stats: feedbackStats,
      recentFeedbacks: recentTeacherFeedbacks,
      teacher: {
        name: teacher.name,
        email: teacher.email
      }
    });
  });
}

// PUT: 교사 피드백 수정
export async function PUT(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { firebaseUid, opinionId, teacherFeedback } = body;

    if (!firebaseUid || !opinionId || !teacherFeedback) {
      return createErrorResponse('필수 정보가 누락되었습니다.');
    }

    if (teacherFeedback.trim().length < 5) {
      return createErrorResponse('피드백은 최소 5자 이상이어야 합니다.');
    }

    if (teacherFeedback.length > 2000) {
      return createErrorResponse('피드백은 2000자를 초과할 수 없습니다.');
    }

    // 교사 인증
    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Opinion = getOpinionModel();
    const opinion = await Opinion.findById(opinionId);

    if (!opinion) {
      return createErrorResponse('의견을 찾을 수 없습니다.', 404);
    }

    // 교사 권한 확인
    if (opinion.teacherId.toString() !== teacher._id.toString()) {
      return createErrorResponse('해당 의견에 대한 권한이 없습니다.', 403);
    }

    // 기존 교사 피드백이 있는지 확인
    if (!opinion.teacherFeedback) {
      return createErrorResponse('수정할 교사 피드백이 존재하지 않습니다.', 404);
    }

    // 교사 피드백 수정
    opinion.teacherFeedback = teacherFeedback.trim();
    opinion.teacherFeedbackAt = new Date(); // 수정 시간으로 업데이트
    
    await opinion.save();

    const updatedOpinion = await Opinion.findById(opinionId)
      .populate('studentId', 'name groupName')
      .populate('classId', 'name code');

    return createSuccessResponse(updatedOpinion, '교사 피드백이 수정되었습니다.');
  });
}

// DELETE: 교사 피드백 삭제
export async function DELETE(request: NextRequest) {
  return withMongoDB(async () => {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');
    const opinionId = searchParams.get('opinionId');

    if (!firebaseUid || !opinionId) {
      return createErrorResponse('필수 정보가 누락되었습니다.');
    }

    // 교사 인증
    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Opinion = getOpinionModel();
    const opinion = await Opinion.findById(opinionId);

    if (!opinion) {
      return createErrorResponse('의견을 찾을 수 없습니다.', 404);
    }

    // 교사 권한 확인
    if (opinion.teacherId.toString() !== teacher._id.toString()) {
      return createErrorResponse('해당 의견에 대한 권한이 없습니다.', 403);
    }

    // 교사 피드백 삭제
    opinion.teacherFeedback = undefined;
    opinion.teacherFeedbackAt = undefined;
    
    // 상태 업데이트: AI 피드백만 있으면 feedback_given, 둘 다 없으면 pending
    if (opinion.aiFeedback) {
      opinion.status = 'feedback_given'; // AI 피드백만 남음
    } else {
      opinion.status = 'pending'; // 피드백이 없음
    }

    await opinion.save();

    return createSuccessResponse({ opinionId }, '교사 피드백이 삭제되었습니다.');
  });
}