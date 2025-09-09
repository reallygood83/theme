/**
 * Firebase에 DEMO 세션 생성 스크립트
 */

// Firebase 초기화
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push } = require('firebase/database');

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

async function createDemoSession() {
  try {
    console.log('🚀 Firebase 데모 세션 생성 중...');
    
    // 데모 세션 데이터
    const demoSessionData = {
      accessCode: 'DEMOQ5FQ648',
      title: '[데모] 6학년 2반 - 주급체계 토론',
      teacherId: 'pPg2WhNmpddAhh3RnO0AvVgA8wk1', // judge@questiontalk.demo Firebase UID
      createdAt: Date.now(),
      updatedAt: Date.now(),
      keywords: ['주급체계', '호봉제', '직무급제'],
      materialText: '주급체계에 대한 토론 자료입니다. 호봉제와 직무급제 중 어떤 것이 더 공정한지 토론해보겠습니다.',
      materials: [
        {
          type: 'text',
          title: '주급체계 비교 자료',
          content: '호봉제: 근무연수에 따라 급여가 결정되는 제도\n직무급제: 맡은 업무와 성과에 따라 급여가 결정되는 제도'
        },
        {
          type: 'link',
          title: '공정한 임금제도란?',
          url: 'https://example.com/fair-wage-system'
        }
      ],
      questions: {},
      studentAgendas: {}
    };
    
    // 샘플 질문들 추가 (개인정보 마스킹된 버전)
    const sampleQuestions = [
      {
        studentName: '방지*',
        groupName: '1모둠',
        question: '호봉제가 더 공정한 것 같아요. 왜냐하면 오래 일한 사람이 더 많이 받아야 하니까요.',
        timestamp: Date.now() - 3600000 // 1시간 전
      },
      {
        studentName: '오예*',
        groupName: '2모둠',
        question: '직무급제가 더 좋을 것 같아요. 일을 더 잘하는 사람이 더 많이 받는게 맞다고 생각해요.',
        timestamp: Date.now() - 3000000 // 50분 전
      },
      {
        studentName: '방지*',
        groupName: '1모둠',
        question: '그런데 직무급제는 불공정할 수도 있어요. 누가 더 잘했는지 판단하기 어려우니까요.',
        timestamp: Date.now() - 2400000 // 40분 전
      },
      {
        studentName: '강지*',
        groupName: '3모둠',
        question: '둘 다 장단점이 있는 것 같아요. 호봉제는 안정적이지만 동기부여가 부족할 수 있고, 직무급제는 동기부여는 되지만 스트레스가 클 수 있어요.',
        timestamp: Date.now() - 1800000 // 30분 전
      },
      {
        studentName: '최서*',
        groupName: '4모둠',
        question: '호봉제에서도 성과급을 조금 더하면 어떨까요? 기본은 호봉제로 하고 특별한 성과가 있을 때만 추가로 주는 거예요.',
        timestamp: Date.now() - 1200000 // 20분 전
      }
    ];
    
    // 질문들을 Firebase 형식으로 추가
    sampleQuestions.forEach((q, index) => {
      const questionKey = `demo_question_${index + 1}`;
      demoSessionData.questions[questionKey] = {
        studentName: q.studentName,
        groupName: q.groupName,
        question: q.question,
        timestamp: q.timestamp,
        isDemo: true
      };
    });
    
    // AI 분석 결과 추가
    demoSessionData.aiAnalysisResult = {
      clusteredQuestions: [
        {
          theme: '호봉제 찬성',
          questions: ['호봉제가 더 공정한 것 같아요...', '호봉제에서도 성과급을 조금 더하면...'],
          count: 2
        },
        {
          theme: '직무급제 찬성',
          questions: ['직무급제가 더 좋을 것 같아요...'],
          count: 1
        },
        {
          theme: '절충안 제시',
          questions: ['둘 다 장단점이 있는 것 같아요...'],
          count: 1
        }
      ],
      extractedTerms: ['호봉제', '직무급제', '성과급', '공정성', '동기부여'],
      recommendedAgendas: [
        {
          title: '호봉제 vs 직무급제, 어떤 것이 더 공정한가?',
          description: '근무연수 기반 호봉제와 성과 기반 직무급제의 공정성을 비교 토론',
          pros: ['안정성', '예측가능성', '연륜 존중'],
          cons: ['동기부여 부족', '성과 무시', '획일성']
        },
        {
          title: '이상적인 임금제도는 무엇인가?',
          description: '호봉제와 직무급제의 장점을 결합한 새로운 임금제도 제안',
          pros: ['공정성', '동기부여', '안정성'],
          cons: ['복잡성', '관리의 어려움']
        }
      ]
    };
    
    // Firebase에 새 세션으로 저장
    const sessionsRef = ref(database, 'sessions');
    const newSessionRef = push(sessionsRef);
    
    await set(newSessionRef, demoSessionData);
    
    const sessionId = newSessionRef.key;
    console.log('✅ 데모 세션 생성 완료!');
    console.log(`📍 세션 ID: ${sessionId}`);
    console.log(`🔑 조인코드: ${demoSessionData.accessCode}`);
    console.log(`👨‍🏫 교사 UID: ${demoSessionData.teacherId}`);
    console.log(`📝 제목: ${demoSessionData.title}`);
    console.log(`❓ 질문 개수: ${Object.keys(demoSessionData.questions).length}개`);
    
    console.log('\n🎯 테스트 방법:');
    console.log('1. https://question-talk.vercel.app 접속');
    console.log('2. "학생으로 참여하기" 클릭');
    console.log('3. 조인코드 "DEMOQ5FQ648" 입력');
    console.log('4. 이름: "테스트학생", 모둠: "테스트모둠" 입력');
    console.log('5. 데모 세션 정상 접근 확인');
    
  } catch (error) {
    console.error('❌ Firebase 세션 생성 오류:', error);
  }
}

// 스크립트 실행
createDemoSession().catch(console.error);