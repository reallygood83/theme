/**
 * MongoDB 전체 데이터 조사 스크립트
 * 마이그레이션되지 않은 데이터 확인
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function checkAllData() {
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
    let migrationStatus = {};
    
    for (const collection of collections) {
      const collName = collection.name;
      const count = await db.collection(collName).countDocuments();
      totalDocuments += count;
      
      console.log(`📂 ${collName}: ${count}개 문서`);
      
      // 각 컬렉션별 상세 분석
      if (count > 0) {
        const sample = await db.collection(collName).findOne();
        console.log(`   샘플 필드: ${Object.keys(sample).slice(0, 5).join(', ')}`);
        
        // 마이그레이션 상태 확인
        switch (collName) {
          case 'teachers':
            const teachers = await db.collection('teachers').find().toArray();
            migrationStatus.teachers = {
              total: teachers.length,
              withFirebaseUid: teachers.filter(t => t.firebaseUid).length,
              migrated: teachers.filter(t => t.email === 'mjt@naver.com' || t.email === 'judge@questiontalk.demo').length,
              unmigrated: teachers.filter(t => t.email !== 'mjt@naver.com' && t.email !== 'judge@questiontalk.demo').length
            };
            
            console.log(`   ✅ Firebase UID 연결: ${migrationStatus.teachers.withFirebaseUid}개`);
            console.log(`   ✅ 마이그레이션 완료: ${migrationStatus.teachers.migrated}개`);
            console.log(`   ⚠️  미마이그레이션: ${migrationStatus.teachers.unmigrated}개`);
            
            // 미마이그레이션 계정 상세
            if (migrationStatus.teachers.unmigrated > 0) {
              const unmigrated = teachers.filter(t => t.email !== 'mjt@naver.com' && t.email !== 'judge@questiontalk.demo');
              console.log(`   📝 미마이그레이션 계정:`);
              unmigrated.forEach((t, i) => {
                console.log(`      ${i+1}. ${t.email} (${t.name || 'N/A'})`);
              });
            }
            break;
            
          case 'classes':
            const classes = await db.collection('classes').find().toArray();
            const migratedTeachers = await db.collection('teachers').find({
              $or: [{ email: 'mjt@naver.com' }, { email: 'judge@questiontalk.demo' }]
            }).toArray();
            const migratedTeacherIds = migratedTeachers.map(t => t._id.toString());
            
            migrationStatus.classes = {
              total: classes.length,
              migrated: classes.filter(c => migratedTeacherIds.includes(c.teacherId.toString())).length,
              unmigrated: classes.filter(c => !migratedTeacherIds.includes(c.teacherId.toString())).length
            };
            
            console.log(`   ✅ 마이그레이션 완료: ${migrationStatus.classes.migrated}개`);
            console.log(`   ⚠️  미마이그레이션: ${migrationStatus.classes.unmigrated}개`);
            break;
            
          case 'students':
            const students = await db.collection('students').find().toArray();
            const migratedClassIds = (await db.collection('classes').find({
              teacherId: { $in: (await db.collection('teachers').find({
                $or: [{ email: 'mjt@naver.com' }, { email: 'judge@questiontalk.demo' }]
              }).toArray()).map(t => t._id) }
            }).toArray()).map(c => c._id.toString());
            
            migrationStatus.students = {
              total: students.length,
              migrated: students.filter(s => migratedClassIds.includes(s.classId.toString())).length,
              unmigrated: students.filter(s => !migratedClassIds.includes(s.classId.toString())).length
            };
            
            console.log(`   ✅ 마이그레이션 완료: ${migrationStatus.students.migrated}개`);
            console.log(`   ⚠️  미마이그레이션: ${migrationStatus.students.unmigrated}개`);
            break;
            
          case 'opinions':
            const opinions = await db.collection('opinions').find().toArray();
            const migratedTeacherIds2 = (await db.collection('teachers').find({
              $or: [{ email: 'mjt@naver.com' }, { email: 'judge@questiontalk.demo' }]
            }).toArray()).map(t => t._id.toString());
            
            migrationStatus.opinions = {
              total: opinions.length,
              migrated: opinions.filter(o => migratedTeacherIds2.includes(o.teacherId.toString())).length,
              unmigrated: opinions.filter(o => !migratedTeacherIds2.includes(o.teacherId.toString())).length
            };
            
            console.log(`   ✅ 마이그레이션 완료: ${migrationStatus.opinions.migrated}개`);
            console.log(`   ⚠️  미마이그레이션: ${migrationStatus.opinions.unmigrated}개`);
            break;
        }
        
        console.log('');
      }
    }
    
    // 전체 요약
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MongoDB 전체 데이터 현황 요약');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📁 총 컬렉션: ${collections.length}개`);
    console.log(`📄 총 문서: ${totalDocuments}개`);
    
    if (migrationStatus.teachers) {
      console.log(`\n👥 Teachers: ${migrationStatus.teachers.total}개`);
      console.log(`   ✅ Firebase 연결: ${migrationStatus.teachers.withFirebaseUid}개`);
      console.log(`   ✅ 마이그레이션: ${migrationStatus.teachers.migrated}개`);
      console.log(`   ⚠️  미마이그레이션: ${migrationStatus.teachers.unmigrated}개`);
    }
    
    if (migrationStatus.classes) {
      console.log(`\n🏫 Classes: ${migrationStatus.classes.total}개`);
      console.log(`   ✅ 마이그레이션: ${migrationStatus.classes.migrated}개`);
      console.log(`   ⚠️  미마이그레이션: ${migrationStatus.classes.unmigrated}개`);
    }
    
    if (migrationStatus.students) {
      console.log(`\n🎓 Students: ${migrationStatus.students.total}개`);
      console.log(`   ✅ 마이그레이션: ${migrationStatus.students.migrated}개`);
      console.log(`   ⚠️  미마이그레이션: ${migrationStatus.students.unmigrated}개`);
    }
    
    if (migrationStatus.opinions) {
      console.log(`\n💬 Opinions: ${migrationStatus.opinions.total}개`);
      console.log(`   ✅ 마이그레이션: ${migrationStatus.opinions.migrated}개`);
      console.log(`   ⚠️  미마이그레이션: ${migrationStatus.opinions.unmigrated}개`);
    }
    
    // 마이그레이션 필요 여부 결정
    const needsMigration = (
      (migrationStatus.teachers?.unmigrated || 0) +
      (migrationStatus.classes?.unmigrated || 0) +
      (migrationStatus.students?.unmigrated || 0) +
      (migrationStatus.opinions?.unmigrated || 0)
    ) > 0;
    
    console.log('\n🎯 마이그레이션 필요 여부');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (needsMigration) {
      console.log('❗ 추가 마이그레이션 필요');
      console.log('📝 다음 단계: Firebase로 미마이그레이션 데이터 이전 실행');
      
      // 구체적 마이그레이션 계획
      console.log('\n📋 마이그레이션 계획:');
      if (migrationStatus.teachers?.unmigrated > 0) {
        console.log(`1. Teachers: ${migrationStatus.teachers.unmigrated}개 계정 Firebase UID 연결`);
      }
      if (migrationStatus.classes?.unmigrated > 0) {
        console.log(`2. Classes: ${migrationStatus.classes.unmigrated}개 클래스 Firebase 이전`);
      }
      if (migrationStatus.students?.unmigrated > 0) {
        console.log(`3. Students: ${migrationStatus.students.unmigrated}개 학생 Firebase 이전`);
      }
      if (migrationStatus.opinions?.unmigrated > 0) {
        console.log(`4. Opinions: ${migrationStatus.opinions.unmigrated}개 의견 Firebase 이전`);
      }
    } else {
      console.log('✅ 추가 마이그레이션 불필요');
      console.log('🎉 모든 데이터가 이미 Firebase로 마이그레이션 완료');
    }
    
    return { migrationStatus, needsMigration, collections };
    
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
  checkAllData().catch(console.error);
}

module.exports = { checkAllData };