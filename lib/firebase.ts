import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Firebase 환경 변수 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
      ? `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com` 
      : undefined)
};

// Firebase 앱 초기화 (중복 초기화 방지)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase가 서버 사이드 렌더링 환경에서 안전하게 초기화되도록 조건부 초기화
let database;
let firestore;

// 브라우저 환경이거나 Firebase 구성이 완전한 경우에만 초기화
if (typeof window !== 'undefined' || 
    (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.databaseURL)) {
  // Realtime Database 인스턴스
  database = getDatabase(app);
  
  // Firestore 인스턴스
  firestore = getFirestore(app);
}

export { database, firestore };
export default app;