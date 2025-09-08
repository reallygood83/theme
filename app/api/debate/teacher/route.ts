import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getTeacherModel from '@/lib/models/Teacher';

// GET: 교사 정보 조회
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
      return createErrorResponse('Firebase UID가 필요합니다.');
    }

    const Teacher = getTeacherModel();
    const teacher = await Teacher.findOne({ firebaseUid, isActive: true });

    if (!teacher) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    return createSuccessResponse(teacher);
  });
}

// POST: 교사 계정 생성/업데이트
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { firebaseUid, email, name } = body;

    if (!firebaseUid || !email || !name) {
      return createErrorResponse('Firebase UID, 이메일, 이름이 필요합니다.');
    }

    const Teacher = getTeacherModel();
    
    // 기존 교사 확인
    let teacher = await Teacher.findOne({ firebaseUid });
    
    if (teacher) {
      // 기존 교사 정보 업데이트
      teacher.email = email;
      teacher.name = name;
      teacher.isActive = true;
      await teacher.save();
    } else {
      // 새 교사 생성
      teacher = new Teacher({
        firebaseUid,
        email,
        name,
        provider: 'google'
      });
      await teacher.save();
    }

    return createSuccessResponse(teacher, '교사 정보가 저장되었습니다.');
  });
}