import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse, generateClassCode } from '@/lib/utils/api';
import getClassModel from '@/lib/models/Class';
import getTeacherModel from '@/lib/models/Teacher';

// GET: 교사의 학급 목록 조회
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
      return createErrorResponse('Firebase UID가 필요합니다.');
    }

    const Class = getClassModel();
    const classes = await Class.find({ 
      firebaseUid, 
      isActive: true 
    }).sort({ createdAt: -1 });

    return createSuccessResponse(classes);
  });
}

// POST: 새 학급 생성
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { name, firebaseUid, sessionCode } = body;

    if (!name || !firebaseUid) {
      return createErrorResponse('학급명과 Firebase UID가 필요합니다.');
    }

    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const Class = getClassModel();
    let code: string;
    let isCodeUnique = false;

    // 고유한 학급 코드 생성
    while (!isCodeUnique) {
      code = generateClassCode();
      const existingClass = await Class.findOne({ code });
      if (!existingClass) {
        isCodeUnique = true;
      }
    }

    const newClass = new Class({
      name,
      code: code!,
      teacherId: teacher._id,
      firebaseUid,
      sessionCode,
      topics: []
    });

    await newClass.save();

    return createSuccessResponse(newClass, '학급이 생성되었습니다.');
  });
}