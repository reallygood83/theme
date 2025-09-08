import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getStudentModel from '@/lib/models/Student';
import getClassModel from '@/lib/models/Class';
import getTeacherModel from '@/lib/models/Teacher';

// GET: 학급의 학생 목록 조회
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');
    const classId = searchParams.get('classId');

    if (!firebaseUid) {
      return createErrorResponse('Firebase UID가 필요합니다.');
    }

    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Student = getStudentModel();
    const query: any = { isActive: true };

    if (classId) {
      // 특정 학급의 학생들
      const Class = getClassModel();
      const classInfo = await Class.findOne({ 
        _id: classId, 
        teacherId: teacher._id 
      });

      if (!classInfo) {
        return createErrorResponse('해당 학급을 찾을 수 없습니다.', 404);
      }

      query.classId = classId;
    } else {
      // 교사의 모든 학급 학생들
      const Class = getClassModel();
      const classes = await Class.find({ 
        teacherId: teacher._id,
        isActive: true 
      });
      const classIds = classes.map(c => c._id);
      query.classId = { $in: classIds };
    }

    const students = await Student.find(query)
      .populate('classId', 'name code')
      .sort({ createdAt: -1 });

    return createSuccessResponse(students);
  });
}

// POST: 새 학생 추가 또는 로그인
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { name, accessCode, classCode, sessionCode, groupName } = body;

    if (!name || !accessCode || !classCode) {
      return createErrorResponse('이름, 고유번호, 학급코드가 필요합니다.');
    }

    const Class = getClassModel();
    const classInfo = await Class.findOne({ code: classCode, isActive: true });

    if (!classInfo) {
      return createErrorResponse('유효하지 않은 학급코드입니다.', 404);
    }

    const Student = getStudentModel();
    
    // 기존 학생 확인
    let student = await Student.findOne({ 
      name, 
      accessCode,
      classId: classInfo._id 
    });

    if (student) {
      // 기존 학생 정보 업데이트
      student.isActive = true;
      if (sessionCode && !student.sessionCode) {
        student.sessionCode = sessionCode;
      }
      if (groupName) {
        student.groupName = groupName;
      }
      await student.save();
      
      await student.populate('classId', 'name code');
      
      return createSuccessResponse(student, '로그인되었습니다.');
    } else {
      // 중복 액세스 코드 확인
      const existingStudent = await Student.findOne({ accessCode });
      if (existingStudent) {
        return createErrorResponse('이미 사용 중인 고유번호입니다.');
      }

      // 새 학생 생성
      student = new Student({
        name,
        accessCode,
        classId: classInfo._id,
        sessionCode,
        groupName
      });

      await student.save();
      await student.populate('classId', 'name code');

      return createSuccessResponse(student, '새 학생이 등록되었습니다.');
    }
  });
}

// PUT: 학생 정보 업데이트
export async function PUT(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { studentId, name, groupName, isActive } = body;

    if (!studentId) {
      return createErrorResponse('학생 ID가 필요합니다.');
    }

    const Student = getStudentModel();
    const student = await Student.findById(studentId);

    if (!student) {
      return createErrorResponse('학생을 찾을 수 없습니다.', 404);
    }

    // 업데이트 가능한 필드들
    if (name !== undefined) student.name = name;
    if (groupName !== undefined) student.groupName = groupName;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();
    await student.populate('classId', 'name code');

    return createSuccessResponse(student, '학생 정보가 업데이트되었습니다.');
  });
}