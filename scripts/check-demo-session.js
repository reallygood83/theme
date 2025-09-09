/**
 * DEMOQ5FQ648 조인코드 세션 존재 확인 스크립트
 */

// Firebase 초기화
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, child } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyCAG6mE6Xn0WzYW5P5nPEkBP5UMYEt1HxQ",
  authDomain: "question-talk-ebd38.firebaseapp.com",
  databaseURL: "https://question-talk-ebd38-default-rtdb.firebaseio.com",
  projectId: "question-talk-ebd38",
  storageBucket: "question-talk-ebd38.firebasestorage.app",
  messagingSenderId: "468532635080",
  appId: "1:468532635080:web:0e58e4a9df27e87b6b2ec8"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function checkDemoSession() {
  try {
    console.log('🔍 Firebase 세션 데이터 검색 중...');
    
    // 전체 세션 목록 조회
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'sessions'));
    
    if (snapshot.exists()) {
      const sessions = snapshot.val();
      console.log('\n📋 모든 세션 목록:');
      
      let demoSessionFound = false;
      let mainSessionFound = false;
      
      Object.entries(sessions).forEach(([sessionId, sessionData]) => {
        const { accessCode, title, teacherId } = sessionData;
        console.log(`- ${sessionId}: ${accessCode} | ${title} | teacherId: ${teacherId}`);
        
        if (accessCode === 'DEMOQ5FQ648') {
          demoSessionFound = true;
          console.log('\n🎯 DEMO 세션 발견!');
          console.log('세션 상세:');
          console.log(JSON.stringify(sessionData, null, 2));
        }
        
        if (accessCode === 'MAINQS0YXP') {
          mainSessionFound = true;
          console.log('\n🎯 MAIN 세션 발견!');
          console.log('세션 상세:');
          console.log(JSON.stringify(sessionData, null, 2));
        }
      });
      
      console.log('\n📊 검색 결과:');
      console.log(`✅ DEMO 세션 (DEMOQ5FQ648): ${demoSessionFound ? '존재함' : '❌ 존재하지 않음'}`);
      console.log(`✅ MAIN 세션 (MAINQS0YXP): ${mainSessionFound ? '존재함' : '❌ 존재하지 않음'}`);
      
      if (!demoSessionFound) {
        console.log('\n🚨 DEMO 세션이 Firebase에 존재하지 않습니다!');
        console.log('데이터 마이그레이션이 MongoDB에만 저장되고 Firebase에는 반영되지 않았을 수 있습니다.');
      }
      
    } else {
      console.log('❌ Firebase에 세션 데이터가 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ Firebase 조회 오류:', error);
  }
}

// 스크립트 실행
checkDemoSession().catch(console.error);