/**
 * Database debugging script
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function debugDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔗 MongoDB 연결 성공');
    console.log('📊 데이터베이스:', db.databaseName);
    
    // 컬렉션 목록 조회
    const collections = await db.listCollections().toArray();
    console.log('\n📁 컬렉션 목록:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Teachers 컬렉션 전체 조회
    console.log('\n👨‍🏫 Teachers 컬렉션:');
    const teachers = await db.collection('teachers').find({}).toArray();
    console.log(`총 ${teachers.length}명의 교사`);
    teachers.forEach((teacher, index) => {
      console.log(`  ${index + 1}. ${teacher.name} (${teacher.email}) - Firebase UID: ${teacher.firebaseUid || 'null'}`);
    });
    
    // mjt@naver.com 계정 상세 조회
    console.log('\n🔍 mjt@naver.com 계정 상세:');
    const mjtTeacher = await db.collection('teachers').findOne({ email: 'mjt@naver.com' });
    if (mjtTeacher) {
      console.log('✅ 계정 발견:', JSON.stringify(mjtTeacher, null, 2));
    } else {
      console.log('❌ mjt@naver.com 계정을 찾을 수 없음');
    }
    
    // Classes 컬렉션 조회
    console.log('\n📚 Classes 컬렉션:');
    const classes = await db.collection('classes').find({}).toArray();
    console.log(`총 ${classes.length}개의 클래스`);
    classes.forEach((cls, index) => {
      console.log(`  ${index + 1}. ${cls.name} (${cls.joinCode || cls.code || 'no-code'}) - 교사 ID: ${cls.teacherId}`);
    });
    
    // Opinions 컬렉션 통계
    console.log('\n💬 Opinions 컬렉션:');
    const opinionsCount = await db.collection('opinions').countDocuments();
    console.log(`총 ${opinionsCount}개의 의견`);
    
    // 교사별 의견 수 조회
    if (teachers.length > 0) {
      console.log('\n📊 교사별 의견 수:');
      for (const teacher of teachers) {
        const opinionCount = await db.collection('opinions').countDocuments({ teacherId: teacher._id });
        console.log(`  ${teacher.name}: ${opinionCount}개 의견`);
      }
    }
    
  } catch (error) {
    console.error('❌ 디버깅 오류:', error);
  } finally {
    await client.close();
    console.log('\n🔗 MongoDB 연결 종료');
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  debugDatabase().catch(console.error);
}

module.exports = { debugDatabase };