/**
 * Firebase 전용 교사 API 엔드포인트
 * MongoDB 완전 대체 - Always Works™ 보장
 */

import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import { teacherService } from '@/lib/firebase/services';
import { FirebaseTeacher } from '@/lib/firebase/types';
import { Timestamp } from 'firebase/firestore';

// Firebase 연결 확인 헬퍼
const ensureFirebaseReady = () => {
  if (!teacherService) {
    throw new Error('Firebase 서비스가 초기화되지 않았습니다.');
  }
};

// POST: Firebase 사용자에 대응하는 교사 정보 조회/생성
export async function POST(request: NextRequest) {
  try {
    ensureFirebaseReady();
    
    const body = await request.json();
    const { firebaseUid, email, name, provider = 'google' } = body;

    if (!firebaseUid || !email || !name) {
      return createErrorResponse('Firebase UID, 이메일, 이름이 필요합니다.');
    }

    // 기존 교사 정보 확인 (Firebase UID 또는 이메일로)
    let teacher: FirebaseTeacher | null = null;
    
    // Firebase UID로 먼저 찾기
    teacher = await teacherService.getByFirebaseUid(firebaseUid);
    
    // 없으면 이메일로 찾기
    if (!teacher) {
      teacher = await teacherService.getByEmail(email);
    }

    if (teacher) {
      // 기존 교사 정보 업데이트
      const updateData: Partial<FirebaseTeacher> = {};
      let needsUpdate = false;
      
      if (!teacher.firebaseUid && firebaseUid) {
        updateData.firebaseUid = firebaseUid;
        needsUpdate = true;
      }
      
      if (teacher.name !== name) {
        updateData.name = name;
        needsUpdate = true;
      }
      
      if (teacher.provider !== provider) {
        updateData.provider = provider as 'google' | 'email' | 'existing';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        teacher = await teacherService.update(teacher.id, updateData);
      }

      // 로그인 시간 업데이트
      teacher = await teacherService.updateLastLogin(teacher.id);

    } else {
      // 새 교사 생성
      const newTeacherData = {
        firebaseUid,
        email: email.toLowerCase(),
        name,
        provider: provider as 'google' | 'email' | 'existing',
        school: '',
        position: '',
        phone: '',
        isActive: true,
        lastLoginAt: Timestamp.now(),
        permissions: {
          canCreateSession: true,
          canManageStudents: true,
          canViewStatistics: true,
          isAdmin: false
        }
      };

      teacher = await teacherService.create(newTeacherData);
    }

    // 응답 데이터 구성 (민감한 정보 제거)
    const teacherResponse = {
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      school: teacher.school || '',
      position: teacher.position || '',
      provider: teacher.provider,
      displayName: teacherService.getDisplayName(teacher),
      permissions: teacher.permissions,
      lastLoginAt: teacher.lastLoginAt,
      createdAt: teacher.createdAt
    };

    return createSuccessResponse(teacherResponse);
  } catch (error) {
    console.error('Teacher POST API 오류:', error);
    return createErrorResponse(`교사 정보 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// GET: 교사 정보 조회 (Firebase UID로)
export async function GET(request: NextRequest) {
  try {
    ensureFirebaseReady();
    
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');
    
    if (!firebaseUid) {
      return createErrorResponse('Firebase UID가 필요합니다.');
    }

    const teacher = await teacherService.getByFirebaseUid(firebaseUid);

    if (!teacher || !teacher.isActive) {
      return createErrorResponse('교사 정보를 찾을 수 없습니다.', 404);
    }

    const teacherResponse = {
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      school: teacher.school || '',
      position: teacher.position || '',
      provider: teacher.provider,
      displayName: teacherService.getDisplayName(teacher),
      permissions: teacher.permissions,
      lastLoginAt: teacher.lastLoginAt,
      createdAt: teacher.createdAt
    };

    return createSuccessResponse(teacherResponse);
  } catch (error) {
    console.error('Teacher GET API 오류:', error);
    return createErrorResponse(`교사 정보 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// PUT: 교사 정보 업데이트
export async function PUT(request: NextRequest) {
  try {
    ensureFirebaseReady();
    
    const body = await request.json();
    const { teacherId, name, school, position, phone } = body;

    if (!teacherId) {
      return createErrorResponse('교사 ID가 필요합니다.');
    }

    const existingTeacher = await teacherService.getById(teacherId);
    if (!existingTeacher) {
      return createErrorResponse('교사를 찾을 수 없습니다.', 404);
    }

    // 업데이트 데이터 구성
    const updateData: Partial<FirebaseTeacher> = {};
    let needsUpdate = false;
    
    if (name && existingTeacher.name !== name) {
      updateData.name = name;
      needsUpdate = true;
    }
    
    if (school !== undefined && existingTeacher.school !== school) {
      updateData.school = school;
      needsUpdate = true;
    }
    
    if (position !== undefined && existingTeacher.position !== position) {
      updateData.position = position;
      needsUpdate = true;
    }
    
    if (phone !== undefined && existingTeacher.phone !== phone) {
      updateData.phone = phone;
      needsUpdate = true;
    }

    let teacher = existingTeacher;
    if (needsUpdate) {
      teacher = await teacherService.update(teacherId, updateData);
    }

    const teacherResponse = {
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      school: teacher.school || '',
      position: teacher.position || '',
      provider: teacher.provider,
      displayName: teacherService.getDisplayName(teacher),
      permissions: teacher.permissions,
      lastLoginAt: teacher.lastLoginAt,
      createdAt: teacher.createdAt
    };

    return createSuccessResponse(teacherResponse, '교사 정보가 업데이트되었습니다.');
  } catch (error) {
    console.error('Teacher PUT API 오류:', error);
    return createErrorResponse(`교사 정보 업데이트 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}