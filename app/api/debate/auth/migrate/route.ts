import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getTeacherModel from '@/lib/models/Teacher';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST: 기존 사용자 마이그레이션 또는 로그인
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { email, password, name, school, position, legacyUserId } = body;

    if (!email) {
      return createErrorResponse('이메일이 필요합니다.');
    }

    const Teacher = getTeacherModel();
    
    // 1. 기존 교사 정보 확인
    let teacher = await Teacher.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { legacyUserId: legacyUserId }
      ]
    });

    if (teacher) {
      // 기존 사용자 로그인/업데이트
      if (password) {
        // 비밀번호 검증 로직 (기존 시스템의 비밀번호 해시와 비교)
        // 여기서는 단순화된 예시
        const isPasswordValid = await bcrypt.compare(password, teacher.passwordHash || '');
        
        if (!isPasswordValid && teacher.provider !== 'existing') {
          return createErrorResponse('비밀번호가 일치하지 않습니다.', 401);
        }
      }

      // 추가 정보 업데이트
      let updated = false;
      if (name && teacher.name !== name) {
        teacher.name = name;
        updated = true;
      }
      if (school && teacher.school !== school) {
        teacher.school = school;
        updated = true;
      }
      if (position && teacher.position !== position) {
        teacher.position = position;
        updated = true;
      }
      if (legacyUserId && teacher.legacyUserId !== legacyUserId) {
        teacher.legacyUserId = legacyUserId;
        teacher.migrationDate = new Date();
        teacher.provider = 'existing';
        updated = true;
      }

      if (updated) {
        await teacher.save();
      }

      // 로그인 시간 업데이트
      await teacher.updateLastLogin();

    } else {
      // 새로운 사용자 생성 (마이그레이션)
      if (!name) {
        return createErrorResponse('새 사용자 생성을 위해 이름이 필요합니다.');
      }

      teacher = new Teacher({
        email: email.toLowerCase(),
        name,
        school,
        position,
        legacyUserId,
        provider: legacyUserId ? 'existing' : 'email',
        migrationDate: legacyUserId ? new Date() : undefined,
        lastLoginAt: new Date(),
        permissions: {
          canCreateSession: true,
          canManageStudents: true,
          canViewStatistics: true,
          isAdmin: false
        }
      });

      // 비밀번호가 제공된 경우 해시화 저장
      if (password) {
        teacher.passwordHash = await bcrypt.hash(password, 12);
      }

      await teacher.save();
    }

    // JWT 토큰 생성 (Firebase 대신 사용할 수 있는 인증 토큰)
    const token = jwt.sign(
      { 
        teacherId: teacher._id, 
        email: teacher.email,
        provider: teacher.provider 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

    return createSuccessResponse({
      teacher: teacherResponse,
      token,
      message: teacher.migrationDate ? '기존 사용자 정보가 마이그레이션되었습니다.' : '로그인되었습니다.'
    });
  });
}

// GET: 토큰 검증 및 사용자 정보 조회
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('인증 토큰이 필요합니다.', 401);
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const Teacher = getTeacherModel();
      
      const teacher = await Teacher.findById(decoded.teacherId).select('-passwordHash');
      
      if (!teacher || !teacher.isActive) {
        return createErrorResponse('유효하지 않은 사용자입니다.', 404);
      }

      return createSuccessResponse({
        teacher: {
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
        }
      });

    } catch (error) {
      return createErrorResponse('유효하지 않은 토큰입니다.', 401);
    }
  });
}

// PUT: 기존 사용자 대량 마이그레이션
export async function PUT(request: NextRequest) {
  return withMongoDB(async () => {
    const body = await request.json();
    const { users, adminKey } = body;

    // 관리자 키 확인 (보안을 위해)
    if (adminKey !== process.env.MIGRATION_ADMIN_KEY) {
      return createErrorResponse('관리자 권한이 필요합니다.', 403);
    }

    if (!Array.isArray(users)) {
      return createErrorResponse('사용자 배열이 필요합니다.');
    }

    const Teacher = getTeacherModel();
    const results = {
      migrated: 0,
      updated: 0,
      errors: []
    };

    for (const userData of users) {
      try {
        const { email, name, school, position, legacyUserId, password } = userData;
        
        if (!email || !name) {
          results.errors.push(`${email || 'unknown'}: 필수 정보 누락`);
          continue;
        }

        const migratedTeacher = await Teacher.migrateExistingUser({
          email,
          name,
          school,
          position,
          legacyUserId
        });

        // 비밀번호가 있으면 해시화하여 저장
        if (password && !migratedTeacher.passwordHash) {
          migratedTeacher.passwordHash = await bcrypt.hash(password, 12);
          await migratedTeacher.save();
        }

        if (migratedTeacher.migrationDate) {
          results.migrated++;
        } else {
          results.updated++;
        }

      } catch (error) {
        results.errors.push(`${userData.email}: ${error.message}`);
      }
    }

    return createSuccessResponse(results, '사용자 마이그레이션이 완료되었습니다.');
  });
}