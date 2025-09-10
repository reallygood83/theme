import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin 앱 초기화 (service account 없이도 작동하도록 수정)
let adminApp: any = null;
let adminDB: any = null;
let adminAuth: any = null;

function initializeFirebaseAdmin() {
  // 이미 초기화되었으면 반환
  if (adminApp) return adminApp;

  try {
    // Service account가 설정된 경우
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount: ServiceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      adminApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
      console.log('✅ Firebase Admin (Service Account) 초기화 성공');
    } 
    // Development/Emulator 모드: service account 없이 초기화
    else {
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
      console.log('✅ Firebase Admin (Default) 초기화 성공');
    }

    adminDB = getDatabase(adminApp);
    adminAuth = getAuth(adminApp);
    
  } catch (error) {
    console.error('❌ Firebase Admin 초기화 실패:', error);
    adminApp = null;
    adminDB = null;
    adminAuth = null;
  }

  return adminApp;
}

// 안전한 데이터베이스 접근 함수
export const getAdminDatabase = () => {
  if (!adminDB) {
    console.warn('⚠️ Admin Database 재초기화 시도...');
    initializeFirebaseAdmin();
  }
  return adminDB;
};

// 안전한 Auth 접근 함수  
export const getAdminAuth = () => {
  if (!adminAuth) {
    console.warn('⚠️ Admin Auth 재초기화 시도...');
    initializeFirebaseAdmin();
  }
  return adminAuth;
};

// 초기 초기화
initializeFirebaseAdmin();

export { adminDB, adminAuth };
export default adminApp;