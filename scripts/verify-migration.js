/**
 * Migration verification script
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function verifyMigration() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔗 MongoDB 연결 성공');
    console.log('✅ 마이그레이션 검증 시작\n');
    
    // Step 1: mjt@naver.com 계정 검증
    console.log('1️⃣ mjt@naver.com 계정 검증');
    const mjtTeacher = await db.collection('teachers').findOne({ email: 'mjt@naver.com' });
    
    if (mjtTeacher && mjtTeacher.firebaseUid === 'MSMk1a3iHBfbLzLwwnwpFnwJjS63') {
      console.log('✅ mjt@naver.com Firebase UID 연결 확인');
      console.log(`   Firebase UID: ${mjtTeacher.firebaseUid}`);
    } else {
      console.log('❌ mjt@naver.com Firebase UID 연결 실패');
      return false;
    }
    
    // mjt@naver.com의 원본 데이터 확인
    const mjtClasses = await db.collection('classes').find({ teacherId: mjtTeacher._id }).toArray();
    const mjtOpinions = await db.collection('opinions').countDocuments({ teacherId: mjtTeacher._id });
    
    console.log(`   원본 클래스: ${mjtClasses.length}개`);
    console.log(`   원본 의견: ${mjtOpinions}개`);
    
    // Step 2: judge@questiontalk.demo 계정 검증
    console.log('\n2️⃣ judge@questiontalk.demo 계정 검증');
    const demoTeacher = await db.collection('teachers').findOne({ email: 'judge@questiontalk.demo' });
    
    if (demoTeacher) {
      console.log('✅ judge@questiontalk.demo 계정 존재 확인');
      console.log(`   Firebase UID: ${demoTeacher.firebaseUid}`);
      console.log(`   이름: ${demoTeacher.name}`);
    } else {
      console.log('❌ judge@questiontalk.demo 계정을 찾을 수 없음');
      return false;
    }
    
    // Step 3: 복사된 데모 데이터 검증
    console.log('\n3️⃣ 복사된 데모 데이터 검증');
    
    // 데모 클래스 조회
    const demoClasses = await db.collection('classes').find({ teacherId: demoTeacher._id }).toArray();
    console.log(`✅ 데모 클래스: ${demoClasses.length}개`);
    
    demoClasses.forEach((cls, index) => {
      console.log(`   ${index + 1}. ${cls.name} (조인코드: ${cls.joinCode})`);
    });
    
    // 데모 학생 조회
    const demoStudents = await db.collection('students').find({ 
      classId: { $in: demoClasses.map(cls => cls._id) }
    }).toArray();
    console.log(`✅ 데모 학생: ${demoStudents.length}명`);
    
    // 샘플 학생 정보 출력
    demoStudents.slice(0, 5).forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} (액세스코드: ${student.accessCode})`);
    });
    if (demoStudents.length > 5) {
      console.log(`   ... 외 ${demoStudents.length - 5}명`);
    }
    
    // 데모 의견 조회
    const demoOpinions = await db.collection('opinions').find({ teacherId: demoTeacher._id }).toArray();
    console.log(`✅ 데모 의견: ${demoOpinions.length}개`);
    
    // 샘플 의견 주제 출력
    const topicCounts = {};
    demoOpinions.forEach(opinion => {
      topicCounts[opinion.topic] = (topicCounts[opinion.topic] || 0) + 1;
    });
    
    console.log('   주제별 의견 분포:');
    Object.entries(topicCounts).forEach(([topic, count]) => {
      console.log(`     ${topic}: ${count}개`);
    });
    
    // Step 4: 데이터 무결성 검증
    console.log('\n4️⃣ 데이터 무결성 검증');
    
    // 모든 의견이 올바른 학생 ID를 참조하는지 확인
    let validOpinions = 0;
    for (const opinion of demoOpinions) {
      const student = await db.collection('students').findOne({ _id: opinion.studentId });
      if (student) {
        validOpinions++;
      }
    }
    
    if (validOpinions === demoOpinions.length) {
      console.log('✅ 모든 의견이 유효한 학생 ID를 참조함');
    } else {
      console.log(`❌ ${demoOpinions.length - validOpinions}개의 의견이 무효한 학생 ID를 참조함`);
    }
    
    // 중복 참조 코드 검증
    const referenceCodes = demoOpinions.map(o => o.referenceCode);
    const uniqueReferenceCodes = [...new Set(referenceCodes)];
    
    if (referenceCodes.length === uniqueReferenceCodes.length) {
      console.log('✅ 모든 참조 코드가 고유함');
    } else {
      console.log(`❌ ${referenceCodes.length - uniqueReferenceCodes.length}개의 중복 참조 코드 발견`);
    }
    
    // Step 5: 최종 요약
    console.log('\n🎯 마이그레이션 검증 결과');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ mjt@naver.com Firebase UID 연결: ${mjtTeacher.firebaseUid}`);
    console.log(`✅ judge@questiontalk.demo 계정 생성: ${demoTeacher.firebaseUid}`);
    console.log(`✅ 데모 클래스 복사: ${demoClasses.length}개`);
    console.log(`✅ 데모 학생 생성: ${demoStudents.length}명`);
    console.log(`✅ 데모 의견 복사: ${demoOpinions.length}개`);
    console.log(`✅ 데이터 무결성: ${validOpinions}/${demoOpinions.length} 유효한 의견`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🚀 다음 단계 가이드:');
    console.log('1. 웹사이트 접속: https://question-talk.vercel.app');
    console.log('2. jpmjkim23@gmail.com 구글 계정으로 로그인');
    console.log('3. 대시보드에서 기존 데이터 확인');
    console.log('4. judge@questiontalk.demo 계정 테스트 (별도 Firebase 인증 필요)');
    console.log('5. 데모 클래스 조인코드로 학생 참여 테스트');
    console.log(`6. 데모 조인코드: ${demoClasses[0]?.joinCode || 'N/A'}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ 검증 오류:', error);
    return false;
  } finally {
    await client.close();
    console.log('\n🔗 MongoDB 연결 종료');
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  verifyMigration().catch(console.error);
}

module.exports = { verifyMigration };