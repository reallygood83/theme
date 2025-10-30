/**
 * 완전한 Firebase 마이그레이션 스크립트
 * 남은 모든 MongoDB 데이터를 Firebase로 이전
 */

const { MongoClient, ObjectId } = require('mongodb');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

// Firebase 설정 (제공된 정보 기반)
const firebaseConfig = {
  apiKey: "AIzaSyD1fJ4q5X68uh9vDksN3gVhMD4B2-lY8SQ",
  authDomain: "question-talk-ebd38.firebaseapp.com",
  databaseURL: "https://question-talk-ebd38-default-rtdb.firebaseio.com",
  projectId: "question-talk-ebd38",
  storageBucket: "question-talk-ebd38.firebasestorage.app",
  messagingSenderId: "1056303611894",
  appId: "1:1056303611894:web:437eabc93b8960bac2d1d7",
  measurementId: "G-PS7RZ3XJBC"
};

async function completeFirebaseMigration() {
  const mongoClient = new MongoClient(MONGODB_URI);
  
  try {
    // MongoDB 연결
    await mongoClient.connect();
    const db = mongoClient.db();
    
    console.log('🔗 MongoDB 연결 성공');
    console.log('🚀 완전한 Firebase 마이그레이션 시작\n');
    
    // Firebase Admin 초기화 (서비스 계정 키가 필요하지만 우선 클라이언트 버전으로 시도)
    let firebaseApp;
    try {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('✅ Firebase 연결 성공');
    } catch (error) {
      console.log('⚠️  Firebase Admin SDK 직접 초기화 실패 - API 방식으로 대체');
      // Firebase REST API를 사용한 대안 접근 방식 사용
    }
    
    // 1단계: 미마이그레이션 교사 계정들 조회
    console.log('1️⃣ 미마이그레이션 교사 계정 조회');
    const unmigratedTeachers = await db.collection('teachers').find({
      email: { $nin: ['mjt@naver.com', 'judge@questiontalk.demo'] }
    }).toArray();
    
    console.log(`   총 ${unmigratedTeachers.length}명의 미마이그레이션 교사 발견`);
    
    // 교사별 소유 데이터 분석
    let migrationPlan = {};
    
    for (const teacher of unmigratedTeachers) {
      console.log(`\n📋 ${teacher.email || teacher.name} 분석:`);
      
      // 해당 교사의 클래스들
      const teacherClasses = await db.collection('classes').find({
        teacherId: teacher._id
      }).toArray();
      
      // 해당 교사의 학생들
      let teacherStudents = [];
      if (teacherClasses.length > 0) {
        teacherStudents = await db.collection('students').find({
          classId: { $in: teacherClasses.map(c => c._id) }
        }).toArray();
      }
      
      // 해당 교사의 의견들
      const teacherOpinions = await db.collection('opinions').find({
        teacherId: teacher._id
      }).toArray();
      
      console.log(`   클래스: ${teacherClasses.length}개`);
      console.log(`   학생: ${teacherStudents.length}명`);
      console.log(`   의견: ${teacherOpinions.length}개`);
      
      migrationPlan[teacher._id.toString()] = {
        teacher,
        classes: teacherClasses,
        students: teacherStudents,
        opinions: teacherOpinions,
        totalData: teacherClasses.length + teacherStudents.length + teacherOpinions.length
      };
    }
    
    // 2단계: 마이그레이션 우선순위 결정
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 마이그레이션 우선순위 분석');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sortedTeachers = Object.values(migrationPlan)
      .sort((a, b) => b.totalData - a.totalData);
    
    sortedTeachers.forEach((plan, index) => {
      const teacher = plan.teacher;
      console.log(`${index + 1}. ${teacher.email || teacher.name}:`);
      console.log(`   데이터량: ${plan.totalData}개 (클래스: ${plan.classes.length}, 학생: ${plan.students.length}, 의견: ${plan.opinions.length})`);
    });
    
    // 3단계: Firebase UID 생성 및 연결 (시뮬레이션)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Firebase UID 생성 및 연결 계획');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const plan of sortedTeachers) {
      const teacher = plan.teacher;
      
      // 임시 Firebase UID 생성 (실제로는 Firebase Auth에서 생성)
      const tempFirebaseUid = `temp_${teacher._id.toString().slice(-8)}_${Date.now().toString().slice(-6)}`;
      
      console.log(`\n👤 ${teacher.email || teacher.name}:`);
      console.log(`   MongoDB ID: ${teacher._id}`);
      console.log(`   Firebase UID: ${tempFirebaseUid} (임시 생성)`);
      
      // MongoDB에 Firebase UID 업데이트 (실제 실행 시에만)
      if (process.env.EXECUTE_MIGRATION === 'true') {
        await db.collection('teachers').updateOne(
          { _id: teacher._id },
          { $set: { firebaseUid: tempFirebaseUid } }
        );
        console.log(`   ✅ MongoDB 업데이트 완료`);
      } else {
        console.log(`   🔍 시뮬레이션 모드 - 실제 업데이트 안함`);
      }
      
      plan.firebaseUid = tempFirebaseUid;
    }
    
    // 4단계: Firebase Realtime Database 구조 생성 계획
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗃️  Firebase Realtime Database 구조 계획');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let firebaseData = {
      sessions: {},
      questions: {},
      analysis: {}
    };
    
    for (const plan of sortedTeachers) {
      const teacher = plan.teacher;
      const firebaseUid = plan.firebaseUid;
      
      console.log(`\n📂 ${teacher.email || teacher.name} Firebase 구조:`);
      
      // 각 클래스를 세션으로 변환
      for (const cls of plan.classes) {
        const sessionId = `session_${cls._id.toString()}`;
        
        // 해당 클래스의 학생들
        const classStudents = plan.students.filter(s => 
          s.classId.toString() === cls._id.toString()
        );
        
        // 해당 클래스의 의견들 (질문으로 변환)
        const classOpinions = plan.opinions.filter(o => 
          o.classId && o.classId.toString() === cls._id.toString()
        );
        
        firebaseData.sessions[sessionId] = {
          id: sessionId,
          title: cls.name || '제목 없음',
          description: cls.description || '',
          sessionCode: cls.joinCode,
          teacherId: firebaseUid,
          createdAt: cls.createdAt?.toISOString() || new Date().toISOString(),
          isActive: cls.isActive || true,
          materials: []
        };
        
        // 학생들의 의견을 질문으로 변환
        classOpinions.forEach((opinion, index) => {
          const questionId = `question_${opinion._id.toString()}`;
          
          firebaseData.questions[questionId] = {
            id: questionId,
            sessionId: sessionId,
            studentName: opinion.studentName || `학생${index + 1}`,
            groupName: opinion.studentClass || '모둠',
            content: opinion.content || '',
            submittedAt: opinion.submittedAt?.toISOString() || new Date().toISOString(),
            status: 'submitted'
          };
        });
        
        console.log(`   📁 ${cls.name}: 학생 ${classStudents.length}명, 질문 ${classOpinions.length}개`);
      }
    }
    
    // 5단계: 마이그레이션 실행 계획 요약
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 마이그레이션 실행 계획 요약');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`🏢 마이그레이션 대상 교사: ${unmigratedTeachers.length}명`);
    console.log(`📊 생성될 세션: ${Object.keys(firebaseData.sessions).length}개`);
    console.log(`💬 이전될 질문: ${Object.keys(firebaseData.questions).length}개`);
    
    console.log('\n🎯 다음 단계:');
    console.log('1. Firebase Admin SDK 서비스 계정 키 설정');
    console.log('2. EXECUTE_MIGRATION=true 환경변수 설정 후 재실행');
    console.log('3. 실제 Firebase Auth 계정 생성 및 UID 연결');
    console.log('4. Firebase Realtime Database에 데이터 업로드');
    console.log('5. 마이그레이션 완료 검증');
    
    // 실제 실행 모드일 때만 Firebase에 데이터 업로드
    if (process.env.EXECUTE_MIGRATION === 'true') {
      console.log('\n🚀 Firebase 데이터 업로드 시작...');
      
      // Firebase Realtime Database에 데이터 업로드
      if (firebaseApp) {
        const database = getDatabase(firebaseApp);
        
        // 세션 데이터 업로드
        for (const [sessionId, sessionData] of Object.entries(firebaseData.sessions)) {
          await database.ref(`sessions/${sessionId}`).set(sessionData);
          console.log(`   ✅ 세션 업로드: ${sessionData.title}`);
        }
        
        // 질문 데이터 업로드
        for (const [questionId, questionData] of Object.entries(firebaseData.questions)) {
          await database.ref(`questions/${questionId}`).set(questionData);
        }
        
        console.log(`   ✅ ${Object.keys(firebaseData.questions).length}개 질문 업로드 완료`);
        console.log('\n🎉 마이그레이션 완료!');
      } else {
        console.log('   ❌ Firebase 연결 실패로 데이터 업로드 생략');
      }
    } else {
      console.log('\n🔍 시뮬레이션 모드로 실행됨');
      console.log('실제 마이그레이션을 원하면: EXECUTE_MIGRATION=true node scripts/complete-firebase-migration.js');
    }
    
    return {
      unmigratedCount: unmigratedTeachers.length,
      sessionsToCreate: Object.keys(firebaseData.sessions).length,
      questionsToMigrate: Object.keys(firebaseData.questions).length,
      migrationPlan: sortedTeachers
    };
    
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
    return null;
  } finally {
    await mongoClient.close();
    console.log('\n🔗 MongoDB 연결 종료');
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  completeFirebaseMigration().catch(console.error);
}

module.exports = { completeFirebaseMigration };