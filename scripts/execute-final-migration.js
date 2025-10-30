/**
 * 최종 Firebase 마이그레이션 실행 스크립트
 * 실제로 데이터를 Firebase로 이전
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

// Firebase REST API를 통한 직접 업로드 함수
async function uploadToFirebase(path, data) {
  const firebaseUrl = 'https://question-talk-ebd38-default-rtdb.firebaseio.com';
  const url = `${firebaseUrl}/${path}.json`;
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Firebase 업로드 실패: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Firebase 업로드 오류 (${path}):`, error.message);
    return null;
  }
}

async function executeFinalMigration() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔗 MongoDB 연결 성공');
    console.log('🚀 최종 마이그레이션 실행 시작\n');
    
    // 1단계: 주요 데이터만 있는 교사들 선별 (빈 데이터 제외)
    const meaningfulTeachers = await db.collection('teachers').find({
      email: { $nin: ['mjt@naver.com', 'judge@questiontalk.demo'] }
    }).toArray();
    
    let validTeachers = [];
    
    for (const teacher of meaningfulTeachers) {
      // 해당 교사의 데이터 확인
      const classes = await db.collection('classes').find({ teacherId: teacher._id }).toArray();
      const opinions = await db.collection('opinions').find({ teacherId: teacher._id }).toArray();
      
      const totalData = classes.length + opinions.length;
      
      if (totalData > 0) {
        validTeachers.push({
          teacher,
          classes,
          opinions,
          totalData
        });
        
        console.log(`📊 ${teacher.email}: ${classes.length}개 클래스, ${opinions.length}개 의견`);
      }
    }
    
    console.log(`\n✅ 유효한 교사: ${validTeachers.length}명 (빈 데이터 제외)`);
    
    // 2단계: Firebase UID 생성 및 MongoDB 업데이트
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 Firebase UID 생성 및 연결');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const teacherData of validTeachers) {
      const teacher = teacherData.teacher;
      
      // Firebase UID 생성 (실제 프로젝트 기반)
      const firebaseUid = `migrated_${teacher._id.toString().slice(-12)}_${Date.now().toString().slice(-6)}`;
      
      console.log(`👤 ${teacher.email}:`);
      console.log(`   Firebase UID: ${firebaseUid}`);
      
      // MongoDB에 Firebase UID 업데이트
      await db.collection('teachers').updateOne(
        { _id: teacher._id },
        { $set: { firebaseUid } }
      );
      
      teacherData.firebaseUid = firebaseUid;
      console.log(`   ✅ MongoDB 업데이트 완료`);
    }
    
    // 3단계: Firebase에 세션 데이터 생성
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Firebase 세션 데이터 생성');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let sessionsCreated = 0;
    let questionsCreated = 0;
    
    for (const teacherData of validTeachers) {
      const { teacher, classes, opinions, firebaseUid } = teacherData;
      
      console.log(`\n📂 ${teacher.email} 세션 생성:`);
      
      for (const cls of classes) {
        const sessionId = `session_${cls._id.toString()}`;
        
        // 해당 클래스의 의견들 (질문으로 변환)
        const classOpinions = opinions.filter(o => 
          o.classId && o.classId.toString() === cls._id.toString()
        );
        
        // 세션 데이터
        const sessionData = {
          id: sessionId,
          title: cls.name || '제목 없음',
          description: cls.description || `${teacher.email}의 클래스`,
          sessionCode: cls.joinCode,
          teacherId: firebaseUid,
          createdAt: cls.createdAt?.toISOString() || new Date().toISOString(),
          isActive: true,
          materials: [],
          questionCount: classOpinions.length
        };
        
        // Firebase에 세션 업로드
        const sessionResult = await uploadToFirebase(`sessions/${sessionId}`, sessionData);
        
        if (sessionResult !== null) {
          console.log(`   ✅ 세션: ${cls.name} (질문 ${classOpinions.length}개)`);
          sessionsCreated++;
          
          // 질문들도 Firebase에 업로드
          for (const opinion of classOpinions) {
            const questionId = `question_${opinion._id.toString()}`;
            
            const questionData = {
              id: questionId,
              sessionId: sessionId,
              studentName: opinion.studentName || '익명',
              groupName: opinion.studentClass || '모둠',
              content: opinion.content || '',
              submittedAt: opinion.submittedAt?.toISOString() || new Date().toISOString(),
              status: 'submitted'
            };
            
            const questionResult = await uploadToFirebase(`questions/${questionId}`, questionData);
            
            if (questionResult !== null) {
              questionsCreated++;
            }
          }
        } else {
          console.log(`   ❌ 세션 업로드 실패: ${cls.name}`);
        }
      }
    }
    
    // 4단계: 마이그레이션 완료 보고서 생성
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 마이그레이션 완료 보고서');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`✅ 처리된 교사: ${validTeachers.length}명`);
    console.log(`✅ 생성된 세션: ${sessionsCreated}개`);
    console.log(`✅ 이전된 질문: ${questionsCreated}개`);
    
    const completionReport = {
      timestamp: new Date().toISOString(),
      migratedTeachers: validTeachers.length,
      sessionsCreated,
      questionsCreated,
      details: validTeachers.map(td => ({
        email: td.teacher.email,
        firebaseUid: td.firebaseUid,
        classes: td.classes.length,
        opinions: td.opinions.length
      }))
    };
    
    // 보고서도 Firebase에 저장
    await uploadToFirebase('migrationReports/final', completionReport);
    
    console.log('\n🌐 Firebase 접속 정보:');
    console.log('URL: https://question-talk.vercel.app');
    console.log('계정: jpmjkim23@gmail.com (기존 Google 로그인)');
    console.log('새 마이그레이션 계정들: Firebase Auth에서 확인 필요');
    
    return completionReport;
    
  } catch (error) {
    console.error('❌ 마이그레이션 실행 오류:', error);
    return null;
  } finally {
    await client.close();
    console.log('\n🔗 MongoDB 연결 종료');
  }
}

// 스크립트 직접 실행
if (require.main === module) {
  executeFinalMigration().catch(console.error);
}

module.exports = { executeFinalMigration };