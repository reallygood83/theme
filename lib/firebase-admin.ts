import { initializeApp, getApps, cert, ServiceAccount, getApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin 앱 초기화 (중복 방지)
let adminApp: any = null;
let adminDB: any = null;
let adminAuth: any = null;

function initializeFirebaseAdmin() {
  try {
    // 이미 앱이 초기화되어 있는지 확인
    const existingApps = getApps();
    
    if (existingApps.length > 0) {
      console.log('✅ 기존 Firebase Admin 앱 사용');
      adminApp = existingApps[0];
    } else {
      // 새로운 앱 초기화
      if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.trim() !== '') {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        // private_key 유효성 검증
        if (!privateKey || privateKey.trim() === '' || !privateKey.includes('BEGIN PRIVATE KEY')) {
          console.warn('⚠️ FIREBASE_PRIVATE_KEY가 유효하지 않습니다. 기본 자격 증명을 사용합니다.');
          throw new Error('Invalid private key');
        }
        
        const serviceAccount: ServiceAccount = {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: privateKey,
        };

        adminApp = initializeApp({
          credential: cert(serviceAccount),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
        console.log('✅ Firebase Admin (Service Account) 초기화 성공');
      } else {
        // Development 모드: 기본 자격 증명 사용
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
        console.log('✅ Firebase Admin (Default) 초기화 성공');
      }
    }

    // 데이터베이스와 Auth 초기화
    if (!adminDB) {
      adminDB = getDatabase(adminApp);
    }
    if (!adminAuth) {
      adminAuth = getAuth(adminApp);
    }
    
  } catch (error) {
    console.error('❌ Firebase Admin 초기화 실패:', error);
    
    // 이미 초기화된 앱이 있는 경우 그것을 사용
    try {
      adminApp = getApp();
      adminDB = getDatabase(adminApp);
      adminAuth = getAuth(adminApp);
      console.log('✅ 기존 Firebase Admin 앱으로 복구 성공');
    } catch (fallbackError) {
      console.error('❌ Firebase Admin 복구 실패:', fallbackError);
      adminApp = null;
      adminDB = null;
      adminAuth = null;
    }
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

export { adminDB, adminAuth };
export default adminApp;