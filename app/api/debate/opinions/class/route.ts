import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getOpinionModel from '@/lib/models/Opinion';
import getClassModel from '@/lib/models/Class';
import getTeacherModel from '@/lib/models/Teacher';

// GET: 학급별 의견 조회 (교사용)
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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
    const Class = getClassModel();

    let query: any = { teacherId: teacher._id };

    // 특정 학급으로 필터링
    if (classId) {
      // 해당 학급이 교사의 것인지 확인
      const classInfo = await Class.findOne({ 
        _id: classId, 
        teacherId: teacher._id,
        isActive: true 
      });

      if (!classInfo) {
        return createErrorResponse('해당 학급에 접근 권한이 없습니다.', 403);
      }

      query.classId = classId;
    } else {
      // 교사의 모든 학급에서 의견 조회
      const classes = await Class.find({ 
        teacherId: teacher._id,
        isActive: true 
      });
      const classIds = classes.map(c => c._id);
      query.classId = { $in: classIds };
    }

    // 상태로 필터링
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // 의견 조회 (학생 정보와 학급 정보 포함)
    const opinions = await Opinion.find(query)
      .populate('studentId', 'name accessCode groupName')
      .populate('classId', 'name code')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Opinion.countDocuments(query);

    // 통계 정보 추가
    const stats = {
      total,
      pending: await Opinion.countDocuments({ ...query, status: 'pending' }),
      feedback_given: await Opinion.countDocuments({ ...query, status: 'feedback_given' }),
      reviewed: await Opinion.countDocuments({ ...query, status: 'reviewed' })
    };

    return createSuccessResponse({
      opinions,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  });
}

// PUT: 의견 상태 업데이트 (교사용)
export async function PUT(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { firebaseUid, opinionId, status, teacherFeedback } = body;

    if (!firebaseUid || !opinionId || !status) {
      return createErrorResponse('필수 정보가 누락되었습니다.');
    }

    // 유효한 상태 확인
    const validStatuses = ['pending', 'feedback_given', 'reviewed', 'archived'];
    if (!validStatuses.includes(status)) {
      return createErrorResponse('유효하지 않은 상태입니다.');
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

    // 교사 권한 확인 (해당 의견이 교사의 학급에 속하는지)
    if (opinion.teacherId.toString() !== teacher._id.toString()) {
      return createErrorResponse('해당 의견에 대한 권한이 없습니다.', 403);
    }

    // 의견 상태 업데이트
    opinion.status = status;
    
    if (teacherFeedback) {
      opinion.teacherFeedback = teacherFeedback;
      opinion.teacherFeedbackAt = new Date();
    }

    await opinion.save();

    // 업데이트된 의견 정보 반환 (관련 정보 포함)
    const updatedOpinion = await Opinion.findById(opinionId)
      .populate('studentId', 'name accessCode groupName')
      .populate('classId', 'name code');

    return createSuccessResponse(updatedOpinion, '의견 상태가 업데이트되었습니다.');
  });
}