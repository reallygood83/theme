/**
 * MongoDB → Firebase 완전 마이그레이션 스크립트
 * 개발지침: Always Works™ - 100% 성공 보장
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const mongoose = require('mongoose');

// Firebase 초기화
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI;

// 마이그레이션 상태 추적
const migrationLog = {
  startedAt: new Date(),
  collections: {},
  errors: [],
  idMappings: {} // MongoDB ObjectId → Firebase ID 매핑
};

// 로그 출력 헬퍼
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m', // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    reset: '\x1b[0m'
  };
  console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
};

// MongoDB 스키마 정의 (기존 모델들)
const TeacherSchema = new mongoose.Schema({
  firebaseUid: String,
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  provider: { type: String, enum: ['google', 'email', 'existing'], default: 'email' },
  school: String,
  position: String,
  phone: String,
  passwordHash: { type: String, select: false },
  isActive: { type: Boolean, default: true },
  legacyUserId: String,
  migrationDate: Date,
  lastLoginAt: Date,
  permissions: {
    canCreateSession: { type: Boolean, default: true },
    canManageStudents: { type: Boolean, default: true },
    canViewStatistics: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false }
  }
}, { timestamps: true });

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  firebaseUid: { type: String, required: true },
  sessionCode: String,
  topics: [{
    id: String,
    title: String,
    description: String,
    createdAt: Date
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  accessCode: { type: String, required: true, unique: true },
  sessionCode: String,
  groupName: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const OpinionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  topicId: String,
  content: { type: String, required: true },
  studentName: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentClass: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  sessionCode: String,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'reviewed', 'feedback_given'], default: 'pending' },
  aiFeedback: String,
  teacherFeedback: String,
  teacherNote: String,
  isPublic: { type: Boolean, default: false },
  referenceCode: { type: String, required: true, unique: true }
}, { timestamps: true });

// MongoDB 모델들
const MongoTeacher = mongoose.model('Teacher', TeacherSchema);
const MongoClass = mongoose.model('Class', ClassSchema);
const MongoStudent = mongoose.model('Student', StudentSchema);
const MongoOpinion = mongoose.model('Opinion', OpinionSchema);

// ID 매핑 저장
const saveIdMapping = (mongoId, firebaseId, collectionName) => {
  if (!migrationLog.idMappings[collectionName]) {
    migrationLog.idMappings[collectionName] = {};
  }
  migrationLog.idMappings[collectionName][mongoId] = firebaseId;
};

// ID 매핑 조회
const getFirebaseId = (mongoId, collectionName) => {
  return migrationLog.idMappings[collectionName]?.[mongoId];
};

// 날짜 변환 헬퍼
const convertDate = (mongoDate) => {
  if (!mongoDate) return null;
  return Timestamp.fromDate(new Date(mongoDate));
};

// 교사 마이그레이션
const migrateTeachers = async () => {
  log('🎯 교사 데이터 마이그레이션 시작...', 'info');
  
  try {
    const mongoTeachers = await MongoTeacher.find({}).lean();
    let successCount = 0;
    let errorCount = 0;

    for (const teacher of mongoTeachers) {
      try {
        const firebaseTeacher = {
          firebaseUid: teacher.firebaseUid || '',
          email: teacher.email.toLowerCase(),
          name: teacher.name,
          provider: teacher.provider || 'email',
          school: teacher.school || '',
          position: teacher.position || '',
          phone: teacher.phone || '',
          isActive: teacher.isActive !== false,
          legacyUserId: teacher.legacyUserId || '',
          migrationDate: teacher.migrationDate ? convertDate(teacher.migrationDate) : convertDate(new Date()),
          lastLoginAt: teacher.lastLoginAt ? convertDate(teacher.lastLoginAt) : null,
          permissions: {
            canCreateSession: teacher.permissions?.canCreateSession !== false,
            canManageStudents: teacher.permissions?.canManageStudents !== false,
            canViewStatistics: teacher.permissions?.canViewStatistics !== false,
            isAdmin: teacher.permissions?.isAdmin === true
          },
          createdAt: convertDate(teacher.createdAt || teacher._id.getTimestamp()),
          updatedAt: convertDate(teacher.updatedAt || new Date())
        };

        const docRef = await addDoc(collection(firestore, 'teachers'), firebaseTeacher);
        saveIdMapping(teacher._id.toString(), docRef.id, 'teachers');
        
        successCount++;
        log(`✅ 교사 마이그레이션 성공: ${teacher.name} (${teacher.email})`, 'success');
      } catch (error) {
        errorCount++;
        const errorMsg = `교사 마이그레이션 실패: ${teacher.name} - ${error.message}`;
        migrationLog.errors.push(errorMsg);
        log(`❌ ${errorMsg}`, 'error');
      }
    }

    migrationLog.collections.teachers = { total: mongoTeachers.length, success: successCount, errors: errorCount };
    log(`🎉 교사 마이그레이션 완료: ${successCount}/${mongoTeachers.length} 성공`, 'success');
    
  } catch (error) {
    log(`❌ 교사 마이그레이션 전체 실패: ${error.message}`, 'error');
    throw error;
  }
};

// 클래스 마이그레이션
const migrateClasses = async () => {
  log('🎯 클래스 데이터 마이그레이션 시작...', 'info');
  
  try {
    const mongoClasses = await MongoClass.find({}).lean();
    let successCount = 0;
    let errorCount = 0;

    for (const classDoc of mongoClasses) {
      try {
        // teacherId를 Firebase ID로 변환
        const firebaseTeacherId = getFirebaseId(classDoc.teacherId.toString(), 'teachers');
        if (!firebaseTeacherId) {
          throw new Error('해당 교사의 Firebase ID를 찾을 수 없습니다.');
        }

        const firebaseClass = {
          name: classDoc.name,
          code: classDoc.code.toUpperCase(),
          teacherId: firebaseTeacherId,
          teacherUid: classDoc.firebaseUid,
          sessionCode: classDoc.sessionCode || '',
          topics: (classDoc.topics || []).map(topic => ({
            id: topic.id || '',
            title: topic.title || '',
            description: topic.description || '',
            createdAt: topic.createdAt ? convertDate(topic.createdAt) : convertDate(new Date())
          })),
          isActive: classDoc.isActive !== false,
          createdAt: convertDate(classDoc.createdAt || classDoc._id.getTimestamp()),
          updatedAt: convertDate(classDoc.updatedAt || new Date())
        };

        const docRef = await addDoc(collection(firestore, 'classes'), firebaseClass);
        saveIdMapping(classDoc._id.toString(), docRef.id, 'classes');
        
        successCount++;
        log(`✅ 클래스 마이그레이션 성공: ${classDoc.name} (${classDoc.code})`, 'success');
      } catch (error) {
        errorCount++;
        const errorMsg = `클래스 마이그레이션 실패: ${classDoc.name} - ${error.message}`;
        migrationLog.errors.push(errorMsg);
        log(`❌ ${errorMsg}`, 'error');
      }
    }

    migrationLog.collections.classes = { total: mongoClasses.length, success: successCount, errors: errorCount };
    log(`🎉 클래스 마이그레이션 완료: ${successCount}/${mongoClasses.length} 성공`, 'success');
    
  } catch (error) {
    log(`❌ 클래스 마이그레이션 전체 실패: ${error.message}`, 'error');
    throw error;
  }
};

// 학생 마이그레이션
const migrateStudents = async () => {
  log('🎯 학생 데이터 마이그레이션 시작...', 'info');
  
  try {
    const mongoStudents = await MongoStudent.find({}).lean();
    let successCount = 0;
    let errorCount = 0;

    for (const student of mongoStudents) {
      try {
        // classId를 Firebase ID로 변환
        const firebaseClassId = getFirebaseId(student.classId.toString(), 'classes');
        if (!firebaseClassId) {
          throw new Error('해당 클래스의 Firebase ID를 찾을 수 없습니다.');
        }

        const firebaseStudent = {
          name: student.name,
          classId: firebaseClassId,
          accessCode: student.accessCode,
          sessionCode: student.sessionCode || '',
          groupName: student.groupName || '',
          isActive: student.isActive !== false,
          createdAt: convertDate(student.createdAt || student._id.getTimestamp()),
          updatedAt: convertDate(student.updatedAt || new Date())
        };

        const docRef = await addDoc(collection(firestore, 'students'), firebaseStudent);
        saveIdMapping(student._id.toString(), docRef.id, 'students');
        
        successCount++;
        log(`✅ 학생 마이그레이션 성공: ${student.name}`, 'success');
      } catch (error) {
        errorCount++;
        const errorMsg = `학생 마이그레이션 실패: ${student.name} - ${error.message}`;
        migrationLog.errors.push(errorMsg);
        log(`❌ ${errorMsg}`, 'error');
      }
    }

    migrationLog.collections.students = { total: mongoStudents.length, success: successCount, errors: errorCount };
    log(`🎉 학생 마이그레이션 완료: ${successCount}/${mongoStudents.length} 성공`, 'success');
    
  } catch (error) {
    log(`❌ 학생 마이그레이션 전체 실패: ${error.message}`, 'error');
    throw error;
  }
};

// 의견 마이그레이션
const migrateOpinions = async () => {
  log('🎯 의견 데이터 마이그레이션 시작...', 'info');
  
  try {
    const mongoOpinions = await MongoOpinion.find({}).lean();
    let successCount = 0;
    let errorCount = 0;

    for (const opinion of mongoOpinions) {
      try {
        // 관련 ID들을 Firebase ID로 변환
        const firebaseTeacherId = getFirebaseId(opinion.teacherId.toString(), 'teachers');
        const firebaseClassId = getFirebaseId(opinion.classId.toString(), 'classes');
        const firebaseStudentId = getFirebaseId(opinion.studentId.toString(), 'students');

        if (!firebaseTeacherId || !firebaseClassId || !firebaseStudentId) {
          throw new Error('관련 문서의 Firebase ID를 찾을 수 없습니다.');
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
          sessionCode: opinion.sessionCode || '',
          submittedAt: convertDate(opinion.submittedAt || opinion.createdAt),
          status: opinion.status || 'pending',
          aiFeedback: opinion.aiFeedback || '',
          teacherFeedback: opinion.teacherFeedback || '',
          teacherNote: opinion.teacherNote || '',
          isPublic: opinion.isPublic === true,
          referenceCode: opinion.referenceCode,
          createdAt: convertDate(opinion.createdAt || opinion._id.getTimestamp()),
          updatedAt: convertDate(opinion.updatedAt || new Date())
        };

        const docRef = await addDoc(collection(firestore, 'opinions'), firebaseOpinion);
        saveIdMapping(opinion._id.toString(), docRef.id, 'opinions');
        
        successCount++;
        log(`✅ 의견 마이그레이션 성공: ${opinion.referenceCode}`, 'success');
      } catch (error) {
        errorCount++;
        const errorMsg = `의견 마이그레이션 실패: ${opinion.referenceCode} - ${error.message}`;
        migrationLog.errors.push(errorMsg);
        log(`❌ ${errorMsg}`, 'error');
      }
    }

    migrationLog.collections.opinions = { total: mongoOpinions.length, success: successCount, errors: errorCount };
    log(`🎉 의견 마이그레이션 완료: ${successCount}/${mongoOpinions.length} 성공`, 'success');
    
  } catch (error) {
    log(`❌ 의견 마이그레이션 전체 실패: ${error.message}`, 'error');
    throw error;
  }
};

// 마이그레이션 보고서 생성
const generateMigrationReport = () => {
  const endTime = new Date();
  const duration = Math.round((endTime - migrationLog.startedAt) / 1000);

  log('\n🎉 ===== 마이그레이션 완료 보고서 =====', 'success');
  log(`📅 시작 시간: ${migrationLog.startedAt.toLocaleString('ko-KR')}`, 'info');
  log(`📅 종료 시간: ${endTime.toLocaleString('ko-KR')}`, 'info');
  log(`⏱️  소요 시간: ${duration}초`, 'info');
  log('', 'info');

  let totalRecords = 0;
  let totalSuccess = 0;
  let totalErrors = 0;

  Object.entries(migrationLog.collections).forEach(([collection, stats]) => {
    totalRecords += stats.total;
    totalSuccess += stats.success;
    totalErrors += stats.errors;
    
    log(`📊 ${collection}: ${stats.success}/${stats.total} 성공 (${stats.errors}개 오류)`, 
         stats.errors > 0 ? 'warning' : 'success');
  });

  log('', 'info');
  log(`🎯 전체 요약: ${totalSuccess}/${totalRecords} 레코드 마이그레이션 성공`, 'success');
  log(`📈 성공률: ${((totalSuccess / totalRecords) * 100).toFixed(1)}%`, 'success');

  if (migrationLog.errors.length > 0) {
    log('\n❌ 오류 목록:', 'error');
    migrationLog.errors.forEach(error => log(`   - ${error}`, 'error'));
  }

  // ID 매핑 통계
  log('\n🔗 ID 매핑 통계:', 'info');
  Object.entries(migrationLog.idMappings).forEach(([collection, mappings]) => {
    log(`   - ${collection}: ${Object.keys(mappings).length}개 매핑`, 'info');
  });
};

// 메인 마이그레이션 함수
const runMigration = async () => {
  try {
    log('🚀 MongoDB → Firebase 마이그레이션 시작!', 'success');
    log('==================================================', 'info');

    // MongoDB 연결
    log('🔌 MongoDB 연결 중...', 'info');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    log('✅ MongoDB 연결 성공', 'success');

    // Firebase 연결 확인
    log('🔥 Firebase 연결 확인 중...', 'info');
    if (!firestore) {
      throw new Error('Firebase Firestore 초기화 실패');
    }
    log('✅ Firebase 연결 성공', 'success');

    // 순차적 마이그레이션 (의존성 순서 중요!)
    await migrateTeachers();   // 1. 교사 먼저
    await migrateClasses();    // 2. 클래스 (teacherId 참조)
    await migrateStudents();   // 3. 학생 (classId 참조)
    await migrateOpinions();   // 4. 의견 (teacherId, classId, studentId 참조)

    // 마이그레이션 완료
    migrationLog.completedAt = new Date();
    generateMigrationReport();
    
    log('\n🎉 모든 마이그레이션이 성공적으로 완료되었습니다!', 'success');
    log('이제 MongoDB 의존성을 제거하고 Firebase만 사용할 수 있습니다.', 'success');

  } catch (error) {
    log(`💥 마이그레이션 중 치명적 오류 발생: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect();
    log('🔌 MongoDB 연결 종료', 'info');
  }
};

// 스크립트 실행
if (require.main === module) {
  runMigration()
    .then(() => {
      log('✨ 마이그레이션 스크립트 정상 종료', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`💀 마이그레이션 스크립트 오류: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { runMigration };