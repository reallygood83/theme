import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, database } from './firebase';
import { ref, set, get } from 'firebase/database';

// 사용자 회원가입
export async function registerUser(
  email: string, 
  password: string, 
  name: string
): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase 인증이 초기화되지 않았습니다.');
  }
  
  try {
    // 이메일과 비밀번호로 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 사용자 기본 정보 저장
    if (database) {
      await set(ref(database, `users/${userCredential.user.uid}`), {
        displayName: name,
        email: email,
        role: 'teacher', // 기본적으로 교사 역할 부여
        createdAt: Date.now()
      });
    }
    
    return userCredential;
  } catch (error: any) {
    console.error('회원가입 오류:', error);
    
    // 오류 메시지 번역 및 포맷팅
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('이미 사용 중인 이메일 주소입니다.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('유효하지 않은 이메일 형식입니다.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('비밀번호가 너무 약합니다. 최소 6자 이상 입력해주세요.');
    } else {
      throw new Error('회원가입 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  }
}

// 사용자 로그인
export async function loginUser(
  email: string, 
  password: string
): Promise<UserCredential> {
  if (!auth) {
    throw new Error('Firebase 인증이 초기화되지 않았습니다.');
  }
  
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('로그인 오류:', error);
    
    // 오류 메시지 번역 및 포맷팅
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('유효하지 않은 이메일 형식입니다.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error('로그인 중 문제가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  }
}

// 사용자 로그아웃
export async function logoutUser(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase 인증이 초기화되지 않았습니다.');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw new Error('로그아웃 중 문제가 발생했습니다.');
  }
}

// 비밀번호 재설정 이메일 전송
export async function resetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase 인증이 초기화되지 않았습니다.');
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('비밀번호 재설정 오류:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('해당 이메일을 가진 사용자를 찾을 수 없습니다.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('유효하지 않은 이메일 형식입니다.');
    } else {
      throw new Error('비밀번호 재설정 이메일 전송 중 문제가 발생했습니다.');
    }
  }
}

// 인증 상태 변경 시 호출될 콜백 등록
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    console.error('Firebase 인증이 초기화되지 않았습니다.');
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
}

// 현재 로그인한 사용자 정보 가져오기
export async function getCurrentUserProfile() {
  if (!auth || !auth.currentUser || !database) {
    return null;
  }
  
  try {
    const userId = auth.currentUser.uid;
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return {
        uid: userId,
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    return null;
  }
}