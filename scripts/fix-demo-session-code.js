const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update, query, orderByChild } = require('firebase/database');

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

async function fixDemoSessionCode() {
  try {
    console.log('🔍 데모 세션 찾는 중...');
    
    // 모든 세션 조회
    const sessionsRef = ref(database, 'sessions');
    const sessionsSnapshot = await get(sessionsRef);
    
    if (!sessionsSnapshot.exists()) {
      console.log('❌ 세션을 찾을 수 없습니다.');
      return;
    }
    
    const sessions = sessionsSnapshot.val();
    let demoSessionId = null;
    let demoSession = null;
    
    // 데모 세션 찾기 (제목에 "데모" 포함 또는 11자리 코드)
    for (const [sessionId, session] of Object.entries(sessions)) {
      if (session.sessionCode === 'DEMOQ5FQ648' || 
          (session.title && session.title.includes('데모')) ||
          (session.sessionCode && session.sessionCode.length === 11)) {
        demoSessionId = sessionId;
        demoSession = session;
        console.log('🎯 데모 세션 발견:', {
          sessionId,
          title: session.title,
          currentCode: session.sessionCode || 'undefined',
          teacherId: session.teacherId
        });
        break;
      }
    }
    
    if (!demoSessionId || !demoSession) {
      console.log('❌ 데모 세션을 찾을 수 없습니다.');
      return;
    }
    
    // 새로운 6자리 코드 생성
    const newSessionCode = 'DEMO01';
    
    console.log('🔧 세션 코드 수정 중...');
    console.log(`기존 코드: ${demoSession.sessionCode || 'undefined'} (${demoSession.sessionCode ? demoSession.sessionCode.length : 0}자리)`);
    console.log(`새로운 코드: ${newSessionCode} (${newSessionCode.length}자리)`);
    
    // 세션 코드 업데이트
    const sessionUpdateRef = ref(database, `sessions/${demoSessionId}`);
    await update(sessionUpdateRef, {
      sessionCode: newSessionCode,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ 데모 세션 코드 수정 완료!');
    console.log('📋 수정 결과:', {
      sessionId: demoSessionId,
      title: demoSession.title,
      oldCode: demoSession.sessionCode || 'undefined',
      newCode: newSessionCode,
      teacherId: demoSession.teacherId
    });
    
    // 수정 후 확인
    const updatedSessionSnapshot = await get(sessionUpdateRef);
    const updatedSession = updatedSessionSnapshot.val();
    
    console.log('🔍 수정 후 확인:', {
      sessionCode: updatedSession.sessionCode,
      title: updatedSession.title,
      updatedAt: updatedSession.updatedAt
    });
    
  } catch (error) {
    console.error('❌ 데모 세션 코드 수정 중 오류 발생:', error);
  }
}

// 스크립트 실행
fixDemoSessionCode();