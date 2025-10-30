const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyD1fJ4q5X68uh9vDksN3gVhMD4B2-lY8SQ",
  authDomain: "question-talk-ebd38.firebaseapp.com",
  projectId: "question-talk-ebd38",
  storageBucket: "question-talk-ebd38.firebasestorage.app",
  messagingSenderId: "1056303611894",
  appId: "1:1056303611894:web:437eabc93b8960bac2d1d7",
  databaseURL: "https://question-talk-ebd38-default-rtdb.firebaseio.com"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function verifyDemoSession() {
  try {
    console.log('🔍 모든 세션 조회 중...');
    
    // 모든 세션 조회
    const sessionsRef = ref(database, 'sessions');
    const sessionsSnapshot = await get(sessionsRef);
    
    if (!sessionsSnapshot.exists()) {
      console.log('❌ 세션 데이터가 없습니다.');
      return;
    }
    
    const sessions = sessionsSnapshot.val();
    console.log(`📊 총 ${Object.keys(sessions).length}개의 세션이 있습니다.`);
    
    // DEMO01 코드로 세션 찾기
    let demoSession = null;
    let demoSessionId = null;
    
    console.log('\n🔍 DEMO01 코드를 가진 세션 찾는 중...');
    for (const [sessionId, session] of Object.entries(sessions)) {
      console.log(`세션 ${sessionId}: ${session.title} - 코드: ${session.sessionCode || 'undefined'}`);
      
      if (session.sessionCode === 'DEMO01') {
        demoSession = session;
        demoSessionId = sessionId;
        console.log(`✅ DEMO01 세션 발견!`);
      }
    }
    
    if (demoSession) {
      console.log('\n📋 DEMO01 세션 상세 정보:');
      console.log({
        id: demoSessionId,
        title: demoSession.title,
        sessionCode: demoSession.sessionCode,
        teacherId: demoSession.teacherId,
        createdAt: demoSession.createdAt,
        updatedAt: demoSession.updatedAt
      });
    } else {
      console.log('❌ DEMO01 코드를 가진 세션을 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 세션 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
verifyDemoSession();