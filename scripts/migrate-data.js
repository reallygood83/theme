/**
 * LovableDebate 데이터 마이그레이션 스크립트
 * 
 * 작업 내용:
 * 1. mjt@naver.com MongoDB 계정과 Firebase UID 연결
 * 2. judge@questiontalk.demo 데모 계정 생성
 * 3. 실제 교실 데이터 샘플을 데모 계정으로 복사
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/debate/auth/migrate`;

// 데이터 마이그레이션 실행 함수들
async function queryCurrentData(email) {
  console.log(`\n🔍 ${email} 계정의 현재 데이터 조회 중...`);
  
  try {
    const response = await fetch(`${API_BASE}?email=${encodeURIComponent(email)}&operation=query_current_data`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 데이터 조회 성공:');
      console.log('📊 교사 정보:', result.data.teacher);
      console.log('📚 클래스 수:', result.data.statistics.totalClasses);
      console.log('👥 총 학생 수:', result.data.statistics.totalStudents);
      console.log('💬 총 의견 수:', result.data.statistics.totalOpinions);
      
      if (result.data.classes.length > 0) {
        console.log('\n📋 클래스 상세 정보:');
        result.data.classes.forEach((cls, index) => {
          console.log(`  ${index + 1}. ${cls.name} (코드: ${cls.code})`);
          console.log(`     - 학생 수: ${cls.studentCount}, 의견 수: ${cls.opinionCount}`);
          console.log(`     - 생성일: ${new Date(cls.createdAt).toLocaleDateString()}`);
        });
      }
      
      return result.data;
    } else {
      console.error('❌ 데이터 조회 실패:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ API 호출 오류:', error.message);
    return null;
  }
}

async function linkFirebaseAccount(sourceEmail, firebaseUid) {
  console.log(`\n🔗 ${sourceEmail} 계정과 Firebase UID 연결 중...`);
  
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'link_firebase_account',
        sourceEmail: sourceEmail,
        targetFirebaseUid: firebaseUid
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Firebase 계정 연결 성공:');
      console.log('👤 교사 ID:', result.data.teacherId);
      console.log('📧 이메일:', result.data.email);
      console.log('🔑 Firebase UID:', result.data.firebaseUid);
      console.log('👨‍🏫 이름:', result.data.name);
      return result.data;
    } else {
      console.error('❌ Firebase 계정 연결 실패:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ API 호출 오류:', error.message);
    return null;
  }
}

async function createDemoAccount(demoEmail) {
  console.log(`\n👨‍💼 ${demoEmail} 데모 계정 생성 중...`);
  
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'create_demo_account',
        targetEmail: demoEmail
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 데모 계정 생성/확인 성공:');
      console.log('👤 교사 ID:', result.data.teacherId);
      console.log('📧 이메일:', result.data.email);
      console.log('🔑 Firebase UID:', result.data.firebaseUid);
      console.log('👨‍🏫 이름:', result.data.name);
      return result.data;
    } else {
      console.error('❌ 데모 계정 생성 실패:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ API 호출 오료:', error.message);
    return null;
  }
}

async function copySampleData(sourceEmail, targetEmail) {
  console.log(`\n📋 ${sourceEmail}의 데이터를 ${targetEmail}으로 복사 중...`);
  
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'copy_sample_data',
        sourceEmail: sourceEmail,
        targetEmail: targetEmail
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 샘플 데이터 복사 성공:');
      console.log('📚 복사된 클래스 수:', result.data.copiedCounts.classes);
      console.log('👥 복사된 학생 수:', result.data.copiedCounts.students);
      console.log('💬 복사된 의견 수:', result.data.copiedCounts.opinions);
      
      console.log('\n📋 복사된 클래스 상세:');
      result.data.details.classes.forEach((cls, index) => {
        console.log(`  ${index + 1}. ${cls.name} (코드: ${cls.code})`);
      });
      
      return result.data;
    } else {
      console.error('❌ 샘플 데이터 복사 실패:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ API 호출 오류:', error.message);
    return null;
  }
}

async function verifyMigration(sourceEmail, targetEmail) {
  console.log(`\n✅ 마이그레이션 검증 중...`);
  
  // 소스 계정 데이터 확인
  const sourceData = await queryCurrentData(sourceEmail);
  if (!sourceData) {
    console.error('❌ 소스 계정 데이터 확인 실패');
    return false;
  }
  
  // 타겟 계정 데이터 확인
  const targetData = await queryCurrentData(targetEmail);
  if (!targetData) {
    console.error('❌ 타겟 계정 데이터 확인 실패');
    return false;
  }
  
  console.log('\n🎯 마이그레이션 결과 요약:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 소스 계정: ${sourceEmail}`);
  console.log(`   - Firebase UID: ${sourceData.teacher.firebaseUid}`);
  console.log(`   - 클래스 수: ${sourceData.statistics.totalClasses}`);
  console.log(`   - 학생 수: ${sourceData.statistics.totalStudents}`);
  console.log(`   - 의견 수: ${sourceData.statistics.totalOpinions}`);
  
  console.log(`\n📧 타겟 계정: ${targetEmail}`);
  console.log(`   - Firebase UID: ${targetData.teacher.firebaseUid}`);
  console.log(`   - 클래스 수: ${targetData.statistics.totalClasses}`);
  console.log(`   - 학생 수: ${targetData.statistics.totalStudents}`);
  console.log(`   - 의견 수: ${targetData.statistics.totalOpinions}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return true;
}

// 메인 마이그레이션 실행 함수
async function executeDataMigration() {
  console.log('🚀 LovableDebate 데이터 마이그레이션 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const SOURCE_EMAIL = 'mjt@naver.com';
  const TARGET_FIREBASE_UID = 'MSMk1a3iHBfbLzLwwnwpFnwJjS63';
  const DEMO_EMAIL = 'judge@questiontalk.demo';
  
  try {
    // Step 1: 현재 mjt@naver.com 데이터 조회
    console.log('\n📋 Step 1: 현재 데이터 상태 확인');
    const initialData = await queryCurrentData(SOURCE_EMAIL);
    if (!initialData) {
      console.error('❌ 초기 데이터 조회에 실패했습니다. 마이그레이션을 중단합니다.');
      return;
    }
    
    // Step 2: Firebase UID와 mjt@naver.com 계정 연결
    console.log('\n🔗 Step 2: Firebase UID 연결');
    const linkedAccount = await linkFirebaseAccount(SOURCE_EMAIL, TARGET_FIREBASE_UID);
    if (!linkedAccount) {
      console.error('❌ Firebase 계정 연결에 실패했습니다. 마이그레이션을 중단합니다.');
      return;
    }
    
    // Step 3: judge@questiontalk.demo 데모 계정 생성
    console.log('\n👨‍💼 Step 3: 데모 계정 생성');
    const demoAccount = await createDemoAccount(DEMO_EMAIL);
    if (!demoAccount) {
      console.error('❌ 데모 계정 생성에 실패했습니다. 마이그레이션을 중단합니다.');
      return;
    }
    
    // Step 4: 실제 데이터 샘플을 데모 계정으로 복사
    console.log('\n📋 Step 4: 샘플 데이터 복사');
    const copiedData = await copySampleData(SOURCE_EMAIL, DEMO_EMAIL);
    if (!copiedData) {
      console.error('❌ 샘플 데이터 복사에 실패했습니다.');
      return;
    }
    
    // Step 5: 마이그레이션 검증
    console.log('\n✅ Step 5: 마이그레이션 검증');
    const verified = await verifyMigration(SOURCE_EMAIL, DEMO_EMAIL);
    
    if (verified) {
      console.log('\n🎉 마이그레이션 완료!');
      console.log('✅ 모든 작업이 성공적으로 완료되었습니다.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log('\n📋 다음 단계:');
      console.log('1. 웹사이트에서 jpmjkim23@gmail.com로 로그인 테스트');
      console.log('2. judge@questiontalk.demo 계정으로 데모 데이터 확인');
      console.log('3. 토론 기능들이 정상 작동하는지 검증');
    } else {
      console.error('❌ 마이그레이션 검증에 실패했습니다.');
    }
    
  } catch (error) {
    console.error('❌ 마이그레이션 중 예상치 못한 오류 발생:', error);
  }
}

// CLI에서 직접 실행할 때
if (require.main === module) {
  executeDataMigration().catch(console.error);
}

// 개별 함수들을 export
module.exports = {
  queryCurrentData,
  linkFirebaseAccount,
  createDemoAccount,
  copySampleData,
  verifyMigration,
  executeDataMigration
};