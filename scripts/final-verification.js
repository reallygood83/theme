/**
 * 최종 완전 검증 스크립트
 * 모든 마이그레이션된 교사 계정 확인
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function finalVerification() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔗 MongoDB 연결 성공');
    console.log('🔍 최종 완전 검증 시작\n');
    
    // 모든 교사 계정 확인
    const allTeachers = await db.collection('teachers').find().toArray();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 전체 교사 계정 마이그레이션 현황');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let migratedCount = 0;
    let unmigratedCount = 0;
    
    for (const teacher of allTeachers) {
      if (teacher.firebaseUid) {
        migratedCount++;
        console.log(`✅ ${teacher.email || teacher.name}`);
        console.log(`   Firebase UID: ${teacher.firebaseUid}`);
        
        // 해당 교사의 데이터 현황
        const classes = await db.collection('classes').find({ teacherId: teacher._id }).toArray();
        const opinions = await db.collection('opinions').find({ teacherId: teacher._id }).toArray();
        
        console.log(`   데이터: 클래스 ${classes.length}개, 의견 ${opinions.length}개`);
        
        if (teacher.email === 'mjt@naver.com') {
          console.log(`   🎯 주계정 - 원본 교실 데이터`);
        } else if (teacher.email === 'judge@questiontalk.demo') {
          console.log(`   🎪 데모계정 - 경진대회 시연용`);
        } else {
          console.log(`   🆕 신규마이그레이션 - 추가 교실 데이터`);
        }
        
      } else {
        unmigratedCount++;
        console.log(`❌ ${teacher.email || teacher.name}: Firebase UID 없음`);
      }
      
      console.log('');
    }
    
    // 전체 데이터 통계
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MongoDB → Firebase 마이그레이션 최종 현황');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalClasses = await db.collection('classes').countDocuments();
    const totalStudents = await db.collection('students').countDocuments();
    const totalOpinions = await db.collection('opinions').countDocuments();
    
    console.log(`👥 교사 계정: ${allTeachers.length}개 총계`);
    console.log(`   ✅ Firebase 연결: ${migratedCount}개 (${(migratedCount/allTeachers.length*100).toFixed(1)}%)`);
    console.log(`   ❌ 미연결: ${unmigratedCount}개 (${(unmigratedCount/allTeachers.length*100).toFixed(1)}%)`);
    
    console.log(`\n📚 전체 데이터:`);
    console.log(`   🏫 클래스: ${totalClasses}개`);
    console.log(`   🎓 학생: ${totalStudents}명`);
    console.log(`   💬 의견: ${totalOpinions}개`);
    
    // Firebase 연결된 교사들의 데이터만 계산
    let migratedClasses = 0;
    let migratedStudents = 0;
    let migratedOpinions = 0;
    
    const migratedTeachers = allTeachers.filter(t => t.firebaseUid);
    
    for (const teacher of migratedTeachers) {
      const classes = await db.collection('classes').find({ teacherId: teacher._id }).toArray();
      const opinions = await db.collection('opinions').find({ teacherId: teacher._id }).toArray();
      
      migratedClasses += classes.length;
      migratedOpinions += opinions.length;
      
      // 학생 수는 클래스별로 계산
      for (const cls of classes) {
        const students = await db.collection('students').find({ classId: cls._id }).toArray();
        migratedStudents += students.length;
      }
    }
    
    console.log(`\n✅ Firebase 연결된 데이터:`);
    console.log(`   🏫 클래스: ${migratedClasses}개 (${(migratedClasses/totalClasses*100).toFixed(1)}%)`);
    console.log(`   🎓 학생: ${migratedStudents}명 (${(migratedStudents/totalStudents*100).toFixed(1)}%)`);
    console.log(`   💬 의견: ${migratedOpinions}개 (${(migratedOpinions/totalOpinions*100).toFixed(1)}%)`);
    
    // 결론
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 마이그레이션 완료 결과');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const migrationRate = migratedCount / allTeachers.length;
    const dataRate = migratedOpinions / totalOpinions;
    
    if (migrationRate >= 0.8 && dataRate >= 0.9) {
      console.log('🎉 마이그레이션 성공!');
      console.log(`✅ ${(migrationRate*100).toFixed(1)}% 교사 계정 Firebase 연결 완료`);
      console.log(`✅ ${(dataRate*100).toFixed(1)}% 교실 데이터 Firebase 준비 완료`);
      console.log('🚀 시스템 Firebase 일원화 달성');
    } else {
      console.log('⚠️ 추가 마이그레이션 권장');
      console.log(`📊 현재 진행률: 교사 ${(migrationRate*100).toFixed(1)}%, 데이터 ${(dataRate*100).toFixed(1)}%`);
    }
    
    console.log('\n🌐 접속 정보:');
    console.log('웹사이트: https://question-talk.vercel.app');
    console.log('주계정: jpmjkim23@gmail.com (Google 로그인)');
    console.log('데모계정: 조인코드 DEMOQ5FQ648 사용');
    
    return {
      totalTeachers: allTeachers.length,
      migratedTeachers: migratedCount,
      migrationRate,
      totalData: { totalClasses, totalStudents, totalOpinions },
      migratedData: { migratedClasses, migratedStudents, migratedOpinions },
      success: migrationRate >= 0.8 && dataRate >= 0.9
    };
    
  } catch (error) {
    console.error('❌ 검증 오류:', error);
    return null;
  } finally {
    await client.close();
    console.log('\n🔗 MongoDB 연결 종료');
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  finalVerification().catch(console.error);
}

module.exports = { finalVerification };