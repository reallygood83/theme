/**
 * Direct MongoDB migration script
 * Bypasses Mongoose models to handle schema inconsistencies
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function directMigration() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔗 MongoDB 연결 성공');
    
    // Step 1: mjt@naver.com 계정에 Firebase UID 추가
    console.log('\n1️⃣ Firebase UID 연결 중...');
    
    const updateResult = await db.collection('teachers').updateOne(
      { email: 'mjt@naver.com' },
      { 
        $set: { 
          firebaseUid: 'MSMk1a3iHBfbLzLwwnwpFnwJjS63',
          updatedAt: new Date()
        }
      }
    );
    
    if (updateResult.matchedCount > 0) {
      console.log('✅ mjt@naver.com 계정에 Firebase UID 연결 완료');
    }
    
    // mjt@naver.com 교사 정보 조회
    const sourceTeacher = await db.collection('teachers').findOne({ email: 'mjt@naver.com' });
    if (!sourceTeacher) {
      throw new Error('소스 교사 계정을 찾을 수 없습니다');
    }
    
    console.log('👤 소스 교사:', {
      id: sourceTeacher._id,
      name: sourceTeacher.name,
      email: sourceTeacher.email,
      firebaseUid: sourceTeacher.firebaseUid
    });
    
    // Step 2: judge@questiontalk.demo 계정 생성/확인
    console.log('\n2️⃣ 데모 계정 생성/확인 중...');
    
    let demoTeacher = await db.collection('teachers').findOne({ email: 'judge@questiontalk.demo' });
    
    if (!demoTeacher) {
      const insertResult = await db.collection('teachers').insertOne({
        firebaseUid: `demo_${Date.now()}`,
        email: 'judge@questiontalk.demo',
        name: '데모 평가위원',
        provider: 'google',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      demoTeacher = await db.collection('teachers').findOne({ _id: insertResult.insertedId });
      console.log('✅ 새 데모 계정 생성 완료');
    } else {
      console.log('✅ 기존 데모 계정 확인 완료');
    }
    
    console.log('👤 데모 교사:', {
      id: demoTeacher._id,
      name: demoTeacher.name,
      email: demoTeacher.email,
      firebaseUid: demoTeacher.firebaseUid
    });
    
    // Step 3: 소스 데이터 조회 및 복사
    console.log('\n3️⃣ 소스 데이터 복사 중...');
    
    // 소스 클래스 조회
    const sourceClasses = await db.collection('classes')
      .find({ teacherId: sourceTeacher._id })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    console.log(`📚 복사할 클래스 수: ${sourceClasses.length}`);
    
    const copiedData = {
      classes: [],
      students: [],
      opinions: []
    };
    
    for (const sourceClass of sourceClasses) {
      console.log(`\n📋 클래스 복사 중: ${sourceClass.name}`);
      
      // 고유한 joinCode 생성
      const uniqueJoinCode = `DEMO${Math.random().toString(36).substr(2, 4).toUpperCase()}${Date.now().toString().slice(-3)}`;
      
      // 클래스 복사
      const newClassData = {
        name: `[데모] ${sourceClass.name}`,
        joinCode: uniqueJoinCode,
        teacherId: demoTeacher._id,
        description: `데모용 복사: ${sourceClass.description || sourceClass.name}`,
        isActive: true,
        topics: sourceClass.topics || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const classResult = await db.collection('classes').insertOne(newClassData);
      const newClass = await db.collection('classes').findOne({ _id: classResult.insertedId });
      copiedData.classes.push(newClass);
      
      console.log(`✅ 클래스 복사 완료: ${newClass.name} (${newClass.joinCode})`);
      
      // 소스 클래스의 의견 데이터 복사 (최대 20개)
      const sourceOpinions = await db.collection('opinions')
        .find({ classId: sourceClass._id })
        .sort({ submittedAt: -1 })
        .limit(20)
        .toArray();
      
      console.log(`💬 복사할 의견 수: ${sourceOpinions.length}`);
      
      // 각 의견마다 가상의 학생 생성하여 복사
      for (let i = 0; i < sourceOpinions.length; i++) {
        const sourceOpinion = sourceOpinions[i];
        
        // 가상 학생 생성
        const studentName = sourceOpinion.studentName || `데모학생${i + 1}`;
        const studentAccessCode = `${uniqueJoinCode}_S${i + 1}`;
        
        const newStudentData = {
          name: studentName,
          classId: newClass._id,
          accessCode: studentAccessCode,
          groupName: sourceOpinion.groupName || `데모모둠${Math.floor(i / 4) + 1}`,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const studentResult = await db.collection('students').insertOne(newStudentData);
        const newStudent = await db.collection('students').findOne({ _id: studentResult.insertedId });
        copiedData.students.push(newStudent);
        
        // 의견 복사
        const newOpinionData = {
          topic: sourceOpinion.topic,
          topicId: sourceOpinion.topicId,
          content: sourceOpinion.content,
          studentName: newStudent.name,
          studentId: newStudent._id,
          studentClass: newClass.name,
          classId: newClass._id,
          teacherId: demoTeacher._id,
          submittedAt: new Date(),
          status: sourceOpinion.status || 'pending',
          aiFeedback: sourceOpinion.aiFeedback,
          teacherFeedback: sourceOpinion.teacherFeedback,
          isPublic: sourceOpinion.isPublic || false,
          referenceCode: `DEMO_${Math.random().toString(36).substr(2, 8).toUpperCase()}_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const opinionResult = await db.collection('opinions').insertOne(newOpinionData);
        const newOpinion = await db.collection('opinions').findOne({ _id: opinionResult.insertedId });
        copiedData.opinions.push(newOpinion);
      }
      
      console.log(`✅ 의견 ${sourceOpinions.length}개 복사 완료`);
    }
    
    // Step 4: 결과 요약
    console.log('\n🎯 마이그레이션 결과 요약');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 소스: ${sourceTeacher.email} (Firebase UID: ${sourceTeacher.firebaseUid})`);
    console.log(`📧 타겟: ${demoTeacher.email} (Firebase UID: ${demoTeacher.firebaseUid})`);
    console.log(`📚 복사된 클래스: ${copiedData.classes.length}개`);
    console.log(`👥 생성된 학생: ${copiedData.students.length}명`);
    console.log(`💬 복사된 의견: ${copiedData.opinions.length}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 복사된 클래스 정보 출력
    console.log('\n📋 복사된 클래스 상세:');
    copiedData.classes.forEach((cls, index) => {
      console.log(`  ${index + 1}. ${cls.name} (조인코드: ${cls.joinCode})`);
    });
    
    console.log('\n🎉 데이터 마이그레이션 완료!');
    console.log('\n📋 다음 단계:');
    console.log('1. 웹사이트에서 jpmjkim23@gmail.com로 로그인 테스트');
    console.log('2. judge@questiontalk.demo 계정으로 데모 데이터 확인');
    console.log('3. 토론 기능들이 정상 작동하는지 검증');
    
    return {
      sourceTeacher,
      demoTeacher,
      copiedData
    };
    
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔗 MongoDB 연결 종료');
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  directMigration().catch(console.error);
}

module.exports = { directMigration };