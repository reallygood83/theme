import { NextRequest } from 'next/server';
import { withMongoDB, createSuccessResponse, createErrorResponse } from '@/lib/utils/api';
import getTeacherModel from '@/models/Teacher';
import getClassModel from '@/models/Class';
import getStudentModel from '@/models/Student';
import { Opinion } from '@/models/Opinion';
import mongoose from 'mongoose';

// POST: 데이터 마이그레이션 실행
export async function POST(request: NextRequest) {
  return withMongoDB(async () => {
    try {
      const body = await request.json();
      const { operation, sourceEmail, targetFirebaseUid, targetEmail } = body;

      const Teacher = getTeacherModel();
      const Class = getClassModel();
      const Student = getStudentModel();

      switch (operation) {
        case 'link_firebase_account':
          return await linkFirebaseAccount(Teacher, sourceEmail, targetFirebaseUid);
        
        case 'create_demo_account':
          return await createDemoAccount(Teacher, Class, Student, targetEmail);
        
        case 'copy_sample_data':
          return await copySampleData(Teacher, Class, Student, sourceEmail, targetEmail);
        
        case 'query_current_data':
          return await queryCurrentData(Teacher, Class, Student, sourceEmail);
        
        default:
          return createErrorResponse('지원되지 않는 작업입니다.', 400);
      }
    } catch (error) {
      console.error('Migration error:', error);
      return createErrorResponse('마이그레이션 중 오류가 발생했습니다.', 500);
    }
  });
}

// GET: 현재 데이터 조회 
export async function GET(request: NextRequest) {
  return withMongoDB(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const email = searchParams.get('email');
      const operation = searchParams.get('operation') || 'query_current_data';

      const Teacher = getTeacherModel();
      const Class = getClassModel();
      const Student = getStudentModel();

      if (operation === 'query_current_data' && email) {
        return await queryCurrentData(Teacher, Class, Student, email);
      }

      return createErrorResponse('이메일이 필요합니다.', 400);
    } catch (error) {
      console.error('Query error:', error);
      return createErrorResponse('데이터 조회 중 오류가 발생했습니다.', 500);
    }
  });
}

async function linkFirebaseAccount(TeacherModel: any, sourceEmail: string, firebaseUid: string) {
  try {
    // 기존 mjt@naver.com 계정 찾기
    const existingTeacher = await TeacherModel.findOne({ email: sourceEmail });
    
    if (!existingTeacher) {
      return createErrorResponse(`${sourceEmail} 계정을 찾을 수 없습니다.`, 404);
    }

    // Firebase UID 업데이트
    const updatedTeacher = await TeacherModel.findByIdAndUpdate(
      existingTeacher._id,
      { firebaseUid: firebaseUid },
      { new: true }
    );

    if (!updatedTeacher) {
      return createErrorResponse('Firebase UID 업데이트에 실패했습니다.', 500);
    }

    return createSuccessResponse({
      teacherId: updatedTeacher._id,
      email: updatedTeacher.email,
      firebaseUid: updatedTeacher.firebaseUid,
      name: updatedTeacher.name
    }, `${sourceEmail} 계정이 Firebase UID ${firebaseUid}와 성공적으로 연결되었습니다.`);

  } catch (error) {
    console.error('Link Firebase account error:', error);
    return createErrorResponse('Firebase 계정 연결 중 오류가 발생했습니다.', 500);
  }
}

async function createDemoAccount(TeacherModel: any, ClassModel: any, StudentModel: any, demoEmail: string) {
  try {
    // 기존 데모 계정 확인
    let demoTeacher = await TeacherModel.findOne({ email: demoEmail });
    
    if (!demoTeacher) {
      // 새 데모 계정 생성
      demoTeacher = new TeacherModel({
        firebaseUid: `demo_${Date.now()}`, // 임시 Firebase UID
        email: demoEmail,
        name: '데모 평가위원',
        provider: 'google',
        isActive: true
      });
      
      await demoTeacher.save();
    }

    return createSuccessResponse({
      teacherId: demoTeacher._id,
      email: demoTeacher.email,
      firebaseUid: demoTeacher.firebaseUid,
      name: demoTeacher.name
    }, `${demoEmail} 데모 계정이 성공적으로 생성/확인되었습니다.`);

  } catch (error) {
    console.error('Create demo account error:', error);
    return createErrorResponse('데모 계정 생성 중 오류가 발생했습니다.', 500);
  }
}

async function copySampleData(TeacherModel: any, ClassModel: any, StudentModel: any, sourceEmail: string, targetEmail: string) {
  try {
    // 소스 교사 계정 찾기
    const sourceTeacher = await TeacherModel.findOne({ email: sourceEmail });
    if (!sourceTeacher) {
      return createErrorResponse(`소스 계정 ${sourceEmail}을 찾을 수 없습니다.`, 404);
    }

    // 타겟 교사 계정 찾기
    const targetTeacher = await TeacherModel.findOne({ email: targetEmail });
    if (!targetTeacher) {
      return createErrorResponse(`타겟 계정 ${targetEmail}을 찾을 수 없습니다.`, 404);
    }

    // 소스 계정의 클래스와 학생 데이터 조회
    const sourceClasses = await ClassModel.find({ teacherId: sourceTeacher._id })
      .sort({ createdAt: -1 })
      .limit(3); // 최신 3개 클래스만 복사

    const copiedData = {
      classes: [],
      students: [],
      opinions: []
    };

    for (const sourceClass of sourceClasses) {
      // 클래스 복사 (고유한 코드 생성)
      const uniqueCode = await generateUniqueClassCode(ClassModel);
      const demoJoinCode = `DEMO_${uniqueCode}_${Date.now().toString().slice(-4)}`;
      const newClass = new ClassModel({
        name: `[데모] ${sourceClass.name}`,
        code: uniqueCode,
        joinCode: demoJoinCode, // 고유한 데모 조인코드
        teacherId: targetTeacher._id,
        firebaseUid: targetTeacher.firebaseUid,
        sessionCode: sourceClass.sessionCode,
        topics: sourceClass.topics || [],
        description: `데모용 복사: ${sourceClass.description || sourceClass.name}`,
        isActive: true
      });
      
      await newClass.save();
      copiedData.classes.push(newClass);

      // 해당 클래스의 학생 데이터 복사 (최대 10명)
      const sourceStudents = await StudentModel.find({ classId: sourceClass._id })
        .limit(10);

      for (const sourceStudent of sourceStudents) {
        const newStudent = new StudentModel({
          name: sourceStudent.name,
          classId: newClass._id,
          accessCode: `${newClass.code}_${sourceStudent.name.substring(0, 3)}`,
          sessionCode: sourceStudent.sessionCode,
          groupName: sourceStudent.groupName,
          isActive: true
        });
        
        await newStudent.save();
        copiedData.students.push(newStudent);
      }

      // 해당 클래스의 의견 데이터 복사 (최대 20개)
      const sourceOpinions = await Opinion.find({ classId: sourceClass._id })
        .sort({ submittedAt: -1 })
        .limit(20);

      for (const sourceOpinion of sourceOpinions) {
        // 새 학생 ID 매핑 찾기
        const newStudent = copiedData.students.find(s => 
          s.name === sourceOpinion.studentName && 
          s.classId.toString() === newClass._id.toString()
        );

        if (newStudent) {
          const newOpinion = new Opinion({
            topic: sourceOpinion.topic,
            topicId: sourceOpinion.topicId,
            content: sourceOpinion.content,
            studentName: sourceOpinion.studentName,
            studentId: newStudent._id,
            studentClass: newClass.name,
            classId: newClass._id,
            teacherId: targetTeacher._id,
            sessionCode: sourceOpinion.sessionCode,
            submittedAt: new Date(), // 현재 시간으로 설정
            status: sourceOpinion.status,
            aiFeedback: sourceOpinion.aiFeedback,
            teacherFeedback: sourceOpinion.teacherFeedback,
            isPublic: sourceOpinion.isPublic,
            referenceCode: generateUniqueReferenceCode()
          });

          await newOpinion.save();
          copiedData.opinions.push(newOpinion);
        }
      }
    }

    return createSuccessResponse({
      sourceEmail,
      targetEmail,
      copiedCounts: {
        classes: copiedData.classes.length,
        students: copiedData.students.length,
        opinions: copiedData.opinions.length
      },
      details: copiedData
    }, `${sourceEmail}의 데이터가 ${targetEmail}으로 성공적으로 복사되었습니다.`);

  } catch (error) {
    console.error('Copy sample data error:', error);
    return createErrorResponse('샘플 데이터 복사 중 오류가 발생했습니다.', 500);
  }
}

async function queryCurrentData(TeacherModel: any, ClassModel: any, StudentModel: any, email: string) {
  try {
    // 교사 정보 조회
    const teacher = await TeacherModel.findOne({ email });
    if (!teacher) {
      return createErrorResponse(`${email} 계정을 찾을 수 없습니다.`, 404);
    }

    // 해당 교사의 클래스 조회
    const classes = await ClassModel.find({ teacherId: teacher._id })
      .sort({ createdAt: -1 });

    // 각 클래스의 학생 수와 의견 수 조회
    const classDetails = [];
    for (const cls of classes) {
      const studentCount = await StudentModel.countDocuments({ classId: cls._id });
      const opinionCount = await Opinion.countDocuments({ classId: cls._id });
      
      classDetails.push({
        ...cls.toObject(),
        studentCount,
        opinionCount
      });
    }

    // 전체 통계
    const totalStudents = await StudentModel.countDocuments({ 
      classId: { $in: classes.map(c => c._id) }
    });
    const totalOpinions = await Opinion.countDocuments({ teacherId: teacher._id });

    return createSuccessResponse({
      teacher: {
        id: teacher._id,
        email: teacher.email,
        name: teacher.name,
        firebaseUid: teacher.firebaseUid,
        createdAt: teacher.createdAt
      },
      classes: classDetails,
      statistics: {
        totalClasses: classes.length,
        totalStudents,
        totalOpinions
      }
    }, `${email} 계정의 데이터 조회가 완료되었습니다.`);

  } catch (error) {
    console.error('Query current data error:', error);
    return createErrorResponse('데이터 조회 중 오류가 발생했습니다.', 500);
  }
}

// 고유한 클래스 코드 생성
async function generateUniqueClassCode(ClassModel: any): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await ClassModel.findOne({ code });
    exists = !!existing;
  }
  
  return code!;
}

// 고유한 레퍼런스 코드 생성
function generateUniqueReferenceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DEMO_${result}_${Date.now()}`;
}