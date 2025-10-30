/**
 * MongoDB 전체 데이터 조사 스크립트 (수정된 버전)
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function checkAllDataFixed() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔗 MongoDB 연결 성공');
    console.log('📊 전체 데이터베이스 조사 시작\n');
    
    // 모든 컬렉션 조회
    const collections = await db.listCollections().toArray();
    console.log(`📁 총 컬렉션 수: ${collections.length}개\n`);
    
    let totalDocuments = 0;
    let collectionSummary = {};
    
    // 1단계: 각 컬렉션별 기본 정보 수집
    for (const collection of collections) {
      const collName = collection.name;
      const count = await db.collection(collName).countDocuments();
      totalDocuments += count;
      
      console.log(`📂 ${collName}: ${count}개 문서`);
      
      if (count > 0) {
        const sample = await db.collection(collName).findOne();
        console.log(`   샘플 필드: ${Object.keys(sample).slice(0, 8).join(', ')}`);
        
        collectionSummary[collName] = {
          count,
          sample: sample
        };
      }
      console.log('');
    }
    
    // 2단계: 마이그레이션된 계정 확인
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 마이그레이션 상태 상세 분석');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Teachers 분석
    if (collectionSummary.teachers) {
      console.log('👥 TEACHERS 분석:');
      const allTeachers = await db.collection('teachers').find().toArray();
      
      console.log(`   총 교사 수: ${allTeachers.length}명`);
      
      // Firebase UID가 있는 교사들
      const withFirebaseUid = allTeachers.filter(t => t.firebaseUid);
      console.log(`   Firebase UID 연결: ${withFirebaseUid.length}명`);
      
      // 마이그레이션된 계정들
      const migratedAccounts = allTeachers.filter(t => 
        t.email === 'mjt@naver.com' || t.email === 'judge@questiontalk.demo'
      );
      console.log(`   마이그레이션 완료: ${migratedAccounts.length}명`);
      
      // 미마이그레이션 계정들
      const unmigratedAccounts = allTeachers.filter(t => 
        t.email !== 'mjt@naver.com' && t.email !== 'judge@questiontalk.demo'
      );
      console.log(`   미마이그레이션: ${unmigratedAccounts.length}명`);
      
      if (unmigratedAccounts.length > 0) {
        console.log('   📝 미마이그레이션 계정 목록:');
        unmigratedAccounts.forEach((t, i) => {
          console.log(`      ${i+1}. ${t.email || t.name || 'N/A'} (ID: ${t._id})`);
        });
      }
      
      console.log('');
    }
    
    // Classes 분석
    if (collectionSummary.classes) {
      console.log('🏫 CLASSES 분석:');
      const allClasses = await db.collection('classes').find().toArray();
      
      // 마이그레이션된 교사 ID들
      const migratedTeachers = await db.collection('teachers').find({
        $or: [{ email: 'mjt@naver.com' }, { email: 'judge@questiontalk.demo' }]
      }).toArray();
      
      console.log(`   총 클래스 수: ${allClasses.length}개`);
      
      let migratedClasses = 0;
      let unmigratedClasses = 0;
      
      for (const cls of allClasses) {
        const teacherObjectId = typeof cls.teacherId === 'string' ? 
          new ObjectId(cls.teacherId) : cls.teacherId;
        
        const isMigrated = migratedTeachers.some(t => t._id.equals(teacherObjectId));
        
        if (isMigrated) {
          migratedClasses++;
        } else {
          unmigratedClasses++;
        }
      }
      
      console.log(`   마이그레이션 완료: ${migratedClasses}개`);
      console.log(`   미마이그레이션: ${unmigratedClasses}개`);
      console.log('');
    }
    
    // Students 분석
    if (collectionSummary.students) {
      console.log('🎓 STUDENTS 분석:');
      const allStudents = await db.collection('students').find().toArray();
      
      console.log(`   총 학생 수: ${allStudents.length}명`);
      
      // 마이그레이션된 클래스들
      const migratedTeachers = await db.collection('teachers').find({
        $or: [{ email: 'mjt@naver.com' }, { email: 'judge@questiontalk.demo' }]
      }).toArray();
      
      const migratedClasses = await db.collection('classes').find({
        teacherId: { $in: migratedTeachers.map(t => t._id) }
      }).toArray();
      
      let migratedStudents = 0;
      let unmigratedStudents = 0;
      
      for (const student of allStudents) {
        const classObjectId = typeof student.classId === 'string' ? 
          new ObjectId(student.classId) : student.classId;
        
        const isMigrated = migratedClasses.some(c => c._id.equals(classObjectId));
        
        if (isMigrated) {
          migratedStudents++;
        } else {
          unmigratedStudents++;
        }
      }
      
      console.log(`   마이그레이션 완료: ${migratedStudents}명`);
      console.log(`   미마이그레이션: ${unmigratedStudents}명`);
      console.log('');
    }
    
    // Opinions 분석
    if (collectionSummary.opinions) {
      console.log('💬 OPINIONS 분석:');
      const allOpinions = await db.collection('opinions').find().toArray();
      
      console.log(`   총 의견 수: ${allOpinions.length}개`);
      
      // 마이그레이션된 교사들
      const migratedTeachers = await db.collection('teachers').find({
        $or: [{ email: 'mjt@naver.com' }, { email: 'judge@questiontalk.demo' }]
      }).toArray();
      
      let migratedOpinions = 0;
      let unmigratedOpinions = 0;
      
      for (const opinion of allOpinions) {
        const teacherObjectId = typeof opinion.teacherId === 'string' ? 
          new ObjectId(opinion.teacherId) : opinion.teacherId;
        
        const isMigrated = migratedTeachers.some(t => t._id.equals(teacherObjectId));
        
        if (isMigrated) {
          migratedOpinions++;
        } else {
          unmigratedOpinions++;
        }
      }
      
      console.log(`   마이그레이션 완료: ${migratedOpinions}개`);
      console.log(`   미마이그레이션: ${unmigratedOpinions}개`);
      console.log('');
    }
    
    // 전체 요약
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 마이그레이션 최종 현황');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 추가 마이그레이션 필요 여부 계산
    const unmigratedTeachers = (await db.collection('teachers').find({
      email: { $nin: ['mjt@naver.com', 'judge@questiontalk.demo'] }
    }).toArray()).length;
    
    const needsMigration = unmigratedTeachers > 0;
    
    if (needsMigration) {
      console.log('❗ 추가 마이그레이션 필요');
      console.log(`📝 미마이그레이션 교사: ${unmigratedTeachers}명`);
      console.log('🚀 Firebase로 추가 데이터 이전 권장');
    } else {
      console.log('✅ 모든 교사 계정 마이그레이션 완료');
      console.log('🎉 추가 마이그레이션 불필요');
    }
    
    return {
      totalCollections: collections.length,
      totalDocuments,
      needsMigration,
      unmigratedTeachers,
      collectionSummary
    };
    
  } catch (error) {
    console.error('❌ 데이터 조사 오류:', error);
    return null;
  } finally {
    await client.close();
    console.log('\n🔗 MongoDB 연결 종료');
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  checkAllDataFixed().catch(console.error);
}

module.exports = { checkAllDataFixed };