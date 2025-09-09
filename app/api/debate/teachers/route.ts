import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getTeacherModel from '@/lib/models/Teacher';

// POST: Firebase 사용자에 대응하는 교사 정보 조회/생성
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { firebaseUid, email, name, provider = 'google' } = body;

    if (!firebaseUid || !email || !name) {
      return createErrorResponse('Firebase UID, 이메일, 이름이 필요합니다.');
    }

    const Teacher = getTeacherModel();
    
    // 기존 교사 정보 확인 (Firebase UID 또는 이메일로)
    let teacher = await Teacher.findOne({
      $or: [
        { firebaseUid },
        { email: email.toLowerCase() }
      ]
    });

    if (teacher) {
      // 기존 교사 정보 업데이트
      let updated = false;
      
      if (!teacher.firebaseUid && firebaseUid) {
        teacher.firebaseUid = firebaseUid;
        updated = true;
      }
      
      if (teacher.name !== name) {
        teacher.name = name;
        updated = true;
      }
      
      if (teacher.provider !== provider) {
        teacher.provider = provider;
        updated = true;
      }
      
      if (updated) {
        await teacher.save();
      }

      // 로그인 시간 업데이트
      await teacher.updateLastLogin();

    } else {
      // 새 교사 생성
      teacher = new Teacher({
        firebaseUid,
        email: email.toLowerCase(),
        name,
        provider,
        lastLoginAt: new Date(),
        permissions: {
          canCreateSession: true,
          canManageStudents: true,
          canViewStatistics: true,
          isAdmin: false
        }
      });

      await teacher.save();
    }

    // 민감한 정보 제거
    const teacherResponse = {
      _id: teacher._id,
      email: teacher.email,
      name: teacher.name,
      school: teacher.school,
      position: teacher.position,
      provider: teacher.provider,
      displayName: teacher.displayName,
      permissions: teacher.permissions,
      lastLoginAt: teacher.lastLoginAt,
      createdAt: teacher.createdAt
    };

    return createSuccessResponse(teacherResponse);
  });
}

// GET: 교사 정보 조회 (Firebase UID로)
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

    const teacherResponse = {
      _id: teacher._id,
      email: teacher.email,
      name: teacher.name,
      school: teacher.school,
      position: teacher.position,
      provider: teacher.provider,
      displayName: teacher.displayName,
      permissions: teacher.permissions,
      lastLoginAt: teacher.lastLoginAt,
      createdAt: teacher.createdAt
    };

    return createSuccessResponse(teacherResponse);
  });
}

// PUT: 교사 정보 업데이트
export async function PUT(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { teacherId, name, school, position, phone } = body;

    if (!teacherId) {
      return createErrorResponse('교사 ID가 필요합니다.');
    }

    const Teacher = getTeacherModel();
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return createErrorResponse('교사를 찾을 수 없습니다.', 404);
    }

    // 업데이트 가능한 필드들
    let updated = false;
    
    if (name && teacher.name !== name) {
      teacher.name = name;
      updated = true;
    }
    
    if (school !== undefined && teacher.school !== school) {
      teacher.school = school;
      updated = true;
    }
    
    if (position !== undefined && teacher.position !== position) {
      teacher.position = position;
      updated = true;
    }
    
    if (phone !== undefined && teacher.phone !== phone) {
      teacher.phone = phone;
      updated = true;
    }

    if (updated) {
      await teacher.save();
    }

    const teacherResponse = {
      _id: teacher._id,
      email: teacher.email,
      name: teacher.name,
      school: teacher.school,
      position: teacher.position,
      provider: teacher.provider,
      displayName: teacher.displayName,
      permissions: teacher.permissions,
      lastLoginAt: teacher.lastLoginAt,
      createdAt: teacher.createdAt
    };

    return createSuccessResponse(teacherResponse, '교사 정보가 업데이트되었습니다.');
  });
}