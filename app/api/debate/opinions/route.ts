import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse, generateReferenceCode } from '@/lib/utils/api';
import getOpinionModel from '@/lib/models/Opinion';
import getStudentModel from '@/lib/models/Student';
import getClassModel from '@/lib/models/Class';
import getTeacherModel from '@/lib/models/Teacher';
import { NotificationService } from '@/lib/notifications';

// GET: 의견 목록 조회
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

    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Opinion = getOpinionModel();
    const query: any = { teacherId: teacher._id };

    if (classId) query.classId = classId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const opinions = await Opinion.find(query)
      .populate('studentId', 'name groupName')
      .populate('classId', 'name code')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Opinion.countDocuments(query);

    return createSuccessResponse({
      opinions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  });
}

// POST: 새 의견 제출
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { 
      topic, 
      topicId, 
      content, 
      studentName, 
      accessCode, 
      sessionCode 
    } = body;

    if (!topic || !content || !studentName || !accessCode) {
      return createErrorResponse('필수 정보가 누락되었습니다.');
    }

    if (content.length > 5000) {
      return createErrorResponse('의견은 5000자를 초과할 수 없습니다.');
    }

    const Student = getStudentModel();
    const student = await Student.findOne({ 
      name: studentName,
      accessCode,
      isActive: true 
    }).populate('classId');

    if (!student) {
      return createErrorResponse('학생 정보를 찾을 수 없습니다.', 404);
    }

    const Class = getClassModel();
    const classInfo = await Class.findById(student.classId);

    if (!classInfo) {
      return createErrorResponse('학급 정보를 찾을 수 없습니다.', 404);
    }

    const Teacher = getTeacherModel();
    const teacher = await Teacher.findById(classInfo.teacherId);

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Opinion = getOpinionModel();
    
    // 고유한 참조 코드 생성
    let referenceCode: string;
    let isCodeUnique = false;

    while (!isCodeUnique) {
      referenceCode = generateReferenceCode();
      const existingOpinion = await Opinion.findOne({ referenceCode });
      if (!existingOpinion) {
        isCodeUnique = true;
      }
    }

    const newOpinion = new Opinion({
      topic,
      topicId,
      content,
      studentName,
      studentId: student._id,
      studentClass: classInfo.name,
      classId: classInfo._id,
      teacherId: teacher._id,
      sessionCode,
      referenceCode: referenceCode!,
      status: 'pending'
    });

    await newOpinion.save();

    // 교사에게 새 의견 제출 알림 전송
    try {
      await NotificationService.notifyNewOpinion(
        teacher.firebaseUid,
        studentName,
        topic,
        newOpinion._id.toString()
      );
    } catch (notificationError) {
      console.error('알림 생성 실패:', notificationError);
      // 알림 실패해도 의견 제출은 성공으로 처리
    }

    // 세션 코드가 있으면 학생 정보에도 업데이트
    if (sessionCode && !student.sessionCode) {
      student.sessionCode = sessionCode;
      await student.save();
    }

    return createSuccessResponse(newOpinion, '의견이 성공적으로 제출되었습니다.');
  });
}