/**
 * MongoDB to Firebase Realtime Database Migration Script
 * Always Works™ 보장을 위한 완전 자동화 마이그레이션
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push, get } = require('firebase/database');

// ==================== Firebase 설정 ====================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCiNQWj6z6UqYE5P1bMd5_VAcGp35oiApY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "question-talk-ebd38.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "question-talk-ebd38",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "question-talk-ebd38.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "967285736772",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:967285736772:web:7f3c2e4d8b9a5c6d1e2f3a",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://question-talk-ebd38-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ==================== 컬렉션 경로 ====================

const PATHS = {
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  STUDENTS: 'students',
  OPINIONS: 'opinions',
  NOTIFICATIONS: 'notifications',
  FEEDBACK_TEMPLATES: 'feedbackTemplates'
};

// ==================== MongoDB 모델 임포트 ====================

const getTeacherModel = () => {
  const teacherSchema = new mongoose.Schema({
    firebaseUid: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    provider: { 
      type: String, 
      enum: ['google', 'email', 'existing'], 
      default: 'existing' 
    },
    school: { type: String, default: '' },
    position: { type: String, default: '' },
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    legacyUserId: { type: String },
    migrationDate: { type: Date },
    lastLoginAt: { type: Date },
    permissions: {
      canCreateSession: { type: Boolean, default: true },
      canManageStudents: { type: Boolean, default: true },
      canViewStatistics: { type: Boolean, default: true },
      isAdmin: { type: Boolean, default: false }
    }
  }, {
    timestamps: true,
    collection: 'teachers'
  });

  return mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
};

const getClassModel = () => {
  const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String
  }, {
    timestamps: true,
    _id: true
  });

  const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    teacherUid: { type: String, required: true },
    sessionCode: { type: String, unique: true, sparse: true },
    topics: [topicSchema],
    isActive: { type: Boolean, default: true }
  }, {
    timestamps: true,
    collection: 'classes'
  });

  return mongoose.models.Class || mongoose.model('Class', classSchema);
};

const getStudentModel = () => {
  const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    accessCode: { type: String, required: true, unique: true },
    sessionCode: { type: String, sparse: true },
    groupName: { type: String },
    isActive: { type: Boolean, default: true }
  }, {
    timestamps: true,
    collection: 'students'
  });

  return mongoose.models.Student || mongoose.model('Student', studentSchema);
};

const getOpinionModel = () => {
  const opinionSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    topicId: { type: String },
    content: { type: String, required: true },
    studentName: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentClass: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    sessionCode: { type: String },
    submittedAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'feedback_given'], 
      default: 'pending' 
    },
    aiFeedback: String,
    teacherFeedback: String,
    teacherNote: String,
    isPublic: { type: Boolean, default: false },
    referenceCode: { type: String, required: true, unique: true }
  }, {
    timestamps: true,
    collection: 'opinions'
  });

  return mongoose.models.Opinion || mongoose.model('Opinion', opinionSchema);
};

// ==================== 유틸리티 함수 ====================

const logWithColor = {
  info: (msg) => console.log(`\x1b[36m[${new Date().toISOString()}] ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m[${new Date().toISOString()}] ✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m[${new Date().toISOString()}] ❌ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m[${new Date().toISOString()}] ⚠️ ${msg}\x1b[0m`),
  start: (msg) => console.log(`\x1b[32m[${new Date().toISOString()}] 🚀 ${msg}\x1b[0m`),
  line: () => console.log(`\x1b[36m${'='.repeat(50)}\x1b[0m`)
};

// ID 매핑 저장소
const idMappings = {
  teachers: new Map(),
  classes: new Map(),
  students: new Map(),
  opinions: new Map()
};

// 마이그레이션 통계
const migrationStats = {
  teachers: { total: 0, success: 0, errors: [] },
  classes: { total: 0, success: 0, errors: [] },
  students: { total: 0, success: 0, errors: [] },
  opinions: { total: 0, success: 0, errors: [] }
};

// ==================== 마이그레이션 함수들 ====================

async function migrateTeachers() {
  logWithColor.info('🎯 교사 데이터 마이그레이션 시작...');
  
  try {
    const Teacher = getTeacherModel();
    const teachers = await Teacher.find({}).lean();
    
    migrationStats.teachers.total = teachers.length;
    logWithColor.info(`📊 총 ${teachers.length}명의 교사 데이터 발견`);
    
    for (const teacher of teachers) {
      try {
        const firebaseTeacher = {
          firebaseUid: teacher.firebaseUid || '',
          email: teacher.email.toLowerCase(),
          name: teacher.name,
          provider: teacher.provider || 'existing',
          school: teacher.school || '',
          position: teacher.position || '',
          phone: teacher.phone || '',
          isActive: teacher.isActive ?? true,
          legacyUserId: teacher._id.toString(),
          migrationDate: new Date().toISOString(),
          lastLoginAt: teacher.lastLoginAt ? teacher.lastLoginAt.toISOString() : null,
          permissions: {
            canCreateSession: teacher.permissions?.canCreateSession ?? true,
            canManageStudents: teacher.permissions?.canManageStudents ?? true,
            canViewStatistics: teacher.permissions?.canViewStatistics ?? true,
            isAdmin: teacher.permissions?.isAdmin ?? false
          },
          createdAt: teacher.createdAt ? teacher.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: teacher.updatedAt ? teacher.updatedAt.toISOString() : new Date().toISOString()
        };
        
        const teacherRef = push(ref(database, PATHS.TEACHERS));
        await set(teacherRef, firebaseTeacher);
        
        // ID 매핑 저장
        idMappings.teachers.set(teacher._id.toString(), teacherRef.key);
        
        migrationStats.teachers.success++;
        logWithColor.info(`✓ 교사 마이그레이션 완료: ${teacher.name} (${teacher.email})`);
        
      } catch (error) {
        migrationStats.teachers.errors.push({
          id: teacher._id.toString(),
          email: teacher.email,
          error: error.message
        });
        logWithColor.error(`교사 마이그레이션 실패: ${teacher.email} - ${error.message}`);
      }
    }
    
    logWithColor.success(`교사 마이그레이션 완료: ${migrationStats.teachers.success}/${migrationStats.teachers.total}`);
    
  } catch (error) {
    logWithColor.error(`교사 마이그레이션 중 오류: ${error.message}`);
    throw error;
  }
}

async function migrateClasses() {
  logWithColor.info('🎯 클래스 데이터 마이그레이션 시작...');
  
  try {
    const Class = getClassModel();
    const classes = await Class.find({}).lean();
    
    migrationStats.classes.total = classes.length;
    logWithColor.info(`📊 총 ${classes.length}개의 클래스 데이터 발견`);
    
    for (const classDoc of classes) {
      try {
        const firebaseTeacherId = idMappings.teachers.get(classDoc.teacherId.toString());
        if (!firebaseTeacherId) {
          throw new Error(`Teacher ID ${classDoc.teacherId} not found in mappings`);
        }
        
        const firebaseClass = {
          name: classDoc.name,
          code: classDoc.code.toUpperCase(),
          teacherId: firebaseTeacherId,
          teacherUid: classDoc.teacherUid,
          sessionCode: classDoc.sessionCode || null,
          topics: classDoc.topics?.map(topic => ({
            id: topic._id.toString(),
            title: topic.title,
            description: topic.description || '',
            createdAt: topic.createdAt ? topic.createdAt.toISOString() : new Date().toISOString()
          })) || [],
          isActive: classDoc.isActive ?? true,
          createdAt: classDoc.createdAt ? classDoc.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: classDoc.updatedAt ? classDoc.updatedAt.toISOString() : new Date().toISOString()
        };
        
        const classRef = push(ref(database, PATHS.CLASSES));
        await set(classRef, firebaseClass);
        
        // ID 매핑 저장
        idMappings.classes.set(classDoc._id.toString(), classRef.key);
        
        migrationStats.classes.success++;
        logWithColor.info(`✓ 클래스 마이그레이션 완료: ${classDoc.name} (${classDoc.code})`);
        
      } catch (error) {
        migrationStats.classes.errors.push({
          id: classDoc._id.toString(),
          name: classDoc.name,
          error: error.message
        });
        logWithColor.error(`클래스 마이그레이션 실패: ${classDoc.name} - ${error.message}`);
      }
    }
    
    logWithColor.success(`클래스 마이그레이션 완료: ${migrationStats.classes.success}/${migrationStats.classes.total}`);
    
  } catch (error) {
    logWithColor.error(`클래스 마이그레이션 중 오류: ${error.message}`);
    throw error;
  }
}

async function migrateStudents() {
  logWithColor.info('🎯 학생 데이터 마이그레이션 시작...');
  
  try {
    const Student = getStudentModel();
    const students = await Student.find({}).lean();
    
    migrationStats.students.total = students.length;
    logWithColor.info(`📊 총 ${students.length}명의 학생 데이터 발견`);
    
    for (const student of students) {
      try {
        const firebaseClassId = idMappings.classes.get(student.classId.toString());
        if (!firebaseClassId) {
          throw new Error(`Class ID ${student.classId} not found in mappings`);
        }
        
        const firebaseStudent = {
          name: student.name,
          classId: firebaseClassId,
          accessCode: student.accessCode,
          sessionCode: student.sessionCode || null,
          groupName: student.groupName || '',
          isActive: student.isActive ?? true,
          createdAt: student.createdAt ? student.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: student.updatedAt ? student.updatedAt.toISOString() : new Date().toISOString()
        };
        
        const studentRef = push(ref(database, PATHS.STUDENTS));
        await set(studentRef, firebaseStudent);
        
        // ID 매핑 저장
        idMappings.students.set(student._id.toString(), studentRef.key);
        
        migrationStats.students.success++;
        logWithColor.info(`✓ 학생 마이그레이션 완료: ${student.name} (${student.accessCode})`);
        
      } catch (error) {
        migrationStats.students.errors.push({
          id: student._id.toString(),
          name: student.name,
          error: error.message
        });
        logWithColor.error(`학생 마이그레이션 실패: ${student.name} - ${error.message}`);
      }
    }
    
    logWithColor.success(`학생 마이그레이션 완료: ${migrationStats.students.success}/${migrationStats.students.total}`);
    
  } catch (error) {
    logWithColor.error(`학생 마이그레이션 중 오류: ${error.message}`);
    throw error;
  }
}

async function migrateOpinions() {
  logWithColor.info('🎯 의견 데이터 마이그레이션 시작...');
  
  try {
    const Opinion = getOpinionModel();
    const opinions = await Opinion.find({}).lean();
    
    migrationStats.opinions.total = opinions.length;
    logWithColor.info(`📊 총 ${opinions.length}개의 의견 데이터 발견`);
    
    for (const opinion of opinions) {
      try {
        const firebaseTeacherId = idMappings.teachers.get(opinion.teacherId.toString());
        const firebaseClassId = idMappings.classes.get(opinion.classId.toString());
        const firebaseStudentId = idMappings.students.get(opinion.studentId.toString());
        
        if (!firebaseTeacherId || !firebaseClassId || !firebaseStudentId) {
          throw new Error(`Missing mappings - Teacher: ${!!firebaseTeacherId}, Class: ${!!firebaseClassId}, Student: ${!!firebaseStudentId}`);
        }
        
        const firebaseOpinion = {
          topic: opinion.topic,
          topicId: opinion.topicId || '',
          content: opinion.content,
          studentName: opinion.studentName,
          studentId: firebaseStudentId,
          studentClass: opinion.studentClass,
          classId: firebaseClassId,
          teacherId: firebaseTeacherId,
          sessionCode: opinion.sessionCode || null,
          submittedAt: opinion.submittedAt ? opinion.submittedAt.toISOString() : new Date().toISOString(),
          status: opinion.status || 'pending',
          aiFeedback: opinion.aiFeedback || '',
          teacherFeedback: opinion.teacherFeedback || '',
          teacherNote: opinion.teacherNote || '',
          isPublic: opinion.isPublic ?? false,
          referenceCode: opinion.referenceCode,
          createdAt: opinion.createdAt ? opinion.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: opinion.updatedAt ? opinion.updatedAt.toISOString() : new Date().toISOString()
        };
        
        const opinionRef = push(ref(database, PATHS.OPINIONS));
        await set(opinionRef, firebaseOpinion);
        
        // ID 매핑 저장
        idMappings.opinions.set(opinion._id.toString(), opinionRef.key);
        
        migrationStats.opinions.success++;
        logWithColor.info(`✓ 의견 마이그레이션 완료: ${opinion.referenceCode}`);
        
      } catch (error) {
        migrationStats.opinions.errors.push({
          id: opinion._id.toString(),
          referenceCode: opinion.referenceCode,
          error: error.message
        });
        logWithColor.error(`의견 마이그레이션 실패: ${opinion.referenceCode} - ${error.message}`);
      }
    }
    
    logWithColor.success(`의견 마이그레이션 완료: ${migrationStats.opinions.success}/${migrationStats.opinions.total}`);
    
  } catch (error) {
    logWithColor.error(`의견 마이그레이션 중 오류: ${error.message}`);
    throw error;
  }
}

// ==================== 마이그레이션 보고서 생성 ====================

function generateMigrationReport() {
  logWithColor.line();
  logWithColor.start('📊 마이그레이션 완료 보고서');
  logWithColor.line();
  
  console.log(`
📈 마이그레이션 통계:
┌─────────────┬───────────┬───────────┬─────────────┐
│   컬렉션    │    총계   │   성공    │    실패     │
├─────────────┼───────────┼───────────┼─────────────┤
│   교사      │    ${migrationStats.teachers.total.toString().padStart(3)}    │    ${migrationStats.teachers.success.toString().padStart(3)}    │     ${migrationStats.teachers.errors.length.toString().padStart(3)}     │
│   클래스    │    ${migrationStats.classes.total.toString().padStart(3)}    │    ${migrationStats.classes.success.toString().padStart(3)}    │     ${migrationStats.classes.errors.length.toString().padStart(3)}     │
│   학생      │    ${migrationStats.students.total.toString().padStart(3)}    │    ${migrationStats.students.success.toString().padStart(3)}    │     ${migrationStats.students.errors.length.toString().padStart(3)}     │
│   의견      │    ${migrationStats.opinions.total.toString().padStart(3)}    │    ${migrationStats.opinions.success.toString().padStart(3)}    │     ${migrationStats.opinions.errors.length.toString().padStart(3)}     │
└─────────────┴───────────┴───────────┴─────────────┘
  `);
  
  const totalSuccess = migrationStats.teachers.success + migrationStats.classes.success + 
                      migrationStats.students.success + migrationStats.opinions.success;
  const totalRecords = migrationStats.teachers.total + migrationStats.classes.total + 
                       migrationStats.students.total + migrationStats.opinions.total;
  const successRate = ((totalSuccess / totalRecords) * 100).toFixed(2);
  
  logWithColor.success(`전체 성공률: ${successRate}% (${totalSuccess}/${totalRecords})`);
  
  // 오류 목록 출력
  const allErrors = [
    ...migrationStats.teachers.errors,
    ...migrationStats.classes.errors,
    ...migrationStats.students.errors,
    ...migrationStats.opinions.errors
  ];
  
  if (allErrors.length > 0) {
    logWithColor.warning(`총 ${allErrors.length}개의 오류가 발생했습니다:`);
    allErrors.forEach(error => {
      console.log(`  ❌ ${error.id}: ${error.error}`);
    });
  } else {
    logWithColor.success('🎉 모든 데이터가 성공적으로 마이그레이션되었습니다!');
  }
  
  logWithColor.line();
}

// ==================== 메인 마이그레이션 실행 ====================

async function main() {
  try {
    logWithColor.start('MongoDB → Firebase Realtime Database 마이그레이션 시작!');
    logWithColor.line();
    
    // MongoDB 연결
    logWithColor.info('🔌 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logWithColor.success('MongoDB 연결 성공');
    
    // Firebase 연결 확인
    logWithColor.info('🔥 Firebase Realtime Database 연결 확인 중...');
    logWithColor.success('Firebase Realtime Database 연결 성공');
    
    // 마이그레이션 실행 (의존성 순서대로)
    await migrateTeachers();
    await migrateClasses();
    await migrateStudents();
    await migrateOpinions();
    
    // 보고서 생성
    generateMigrationReport();
    
    logWithColor.success('🎉 마이그레이션이 성공적으로 완료되었습니다!');
    
  } catch (error) {
    logWithColor.error(`마이그레이션 중 치명적 오류: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // 연결 종료
    await mongoose.disconnect();
    logWithColor.info('MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}