import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDatabase } from '@/lib/firebase-admin'

export async function DELETE(request: Request) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7) // 'Bearer ' 제거
    
    // Firebase Admin SDK로 토큰 검증
    let decodedToken
    try {
      console.log('🔍 토큰 검증 시작...');
      console.log('토큰 길이:', token.length);
      console.log('토큰 시작 부분:', token.substring(0, 50) + '...');
      
      const adminAuth = getAdminAuth()
      console.log('Admin Auth 상태:', adminAuth ? '초기화됨' : '초기화 안됨');
      
      if (!adminAuth) {
        throw new Error('Firebase Admin Auth가 초기화되지 않았습니다.')
      }
      
      decodedToken = await adminAuth.verifyIdToken(token)
      console.log('✅ 토큰 검증 성공:', { uid: decodedToken.uid, email: decodedToken.email });
    } catch (authError: any) {
      console.error('❌ 토큰 검증 실패 상세:', {
        error: authError,
        message: authError?.message,
        code: authError?.code,
        stack: authError?.stack
      });
      
      // 더 구체적인 에러 메시지 제공
      let errorMessage = '유효하지 않은 인증 토큰입니다.';
      if (authError?.code === 'auth/id-token-expired') {
        errorMessage = '인증 토큰이 만료되었습니다. 다시 로그인해주세요.';
      } else if (authError?.code === 'auth/argument-error') {
        errorMessage = '잘못된 토큰 형식입니다.';
      } else if (authError?.message?.includes('Firebase Admin')) {
        errorMessage = 'Firebase 인증 서비스 오류입니다.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: authError?.message || '알 수 없는 오류',
          code: authError?.code || 'unknown'
        },
        { status: 401 }
      )
    }
    
    const userId = decodedToken.uid
    
    // 교사 권한 확인
    const adminDB = getAdminDatabase()
    if (!adminDB) {
      return NextResponse.json(
        { error: 'Firebase Admin Database가 초기화되지 않았습니다.' },
        { status: 500 }
      )
    }
    
    const teacherRef = adminDB.ref(`teachers/${userId}`)
    const teacherSnapshot = await teacherRef.once('value')
    
    if (!teacherSnapshot.exists()) {
      return NextResponse.json(
        { error: '교사 권한이 필요합니다.' },
        { status: 403 }
      )
    }
    
    const { sessionId } = await request.json()
    
    // 필수 필드 검증
    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID는 필수입니다.' }, 
        { status: 400 }
      )
    }
    
    // Admin SDK 데이터베이스 사용
    const db = adminDB;
    
    // 세션 삭제
    const sessionRef = db.ref(`sessions/${sessionId}`)
    
    console.log('세션 삭제 시도:', sessionId)
    console.log('삭제할 세션 경로:', `sessions/${sessionId}`)
    
    // 먼저 세션이 존재하는지 확인
    const snapshot = await sessionRef.once('value')
    console.log('삭제 전 세션 존재 여부:', snapshot.exists())
    
    if (!snapshot.exists()) {
      console.log('삭제하려는 세션이 존재하지 않음:', sessionId)
      return NextResponse.json({ 
        error: '삭제하려는 세션을 찾을 수 없습니다.' 
      }, { status: 404 })
    }
    
    console.log('삭제 전 세션 데이터:', snapshot.val())
    
    // Admin SDK를 사용한 삭제
    try {
      await sessionRef.remove()
      console.log('Admin SDK remove() 메서드로 삭제 완료')
    } catch (removeError) {
      console.error('remove() 삭제 실패, set(null) 시도:', removeError)
      // 방법 2: set(null) 사용 (대안)
      await sessionRef.set(null)
      console.log('Admin SDK set(null) 메서드로 삭제 완료')
    }
    
    // 삭제 후 다시 확인
    const afterSnapshot = await sessionRef.once('value')
    console.log('삭제 후 세션 존재 여부:', afterSnapshot.exists())
    
    if (afterSnapshot.exists()) {
      console.error('삭제 후에도 세션이 여전히 존재함')
      return NextResponse.json({ 
        error: '세션 삭제가 완료되지 않았습니다.' 
      }, { status: 500 })
    }
    
    console.log('Firebase에서 세션 삭제 완료 확인:', sessionId)
    
    // 추가 확인: 전체 세션 목록에서 해당 세션이 없는지 재확인
    const allSessionsRef = db.ref('sessions')
    const allSessionsSnapshot = await allSessionsRef.once('value')
    
    if (allSessionsSnapshot.exists()) {
      const allSessions = allSessionsSnapshot.val()
      if (allSessions[sessionId]) {
        console.error('전체 세션 목록에서 여전히 세션이 발견됨:', sessionId)
        return NextResponse.json({ 
          error: '세션 삭제 확인에 실패했습니다.' 
        }, { status: 500 })
      }
    }
    
    console.log('세션 삭제 완료 및 확인 완료:', sessionId)
    
    return NextResponse.json({ 
      success: true,
      message: '세션이 성공적으로 삭제되었습니다.',
      deletedSessionId: sessionId
    })
  } catch (error) {
    console.error('세션 삭제 오류:', error)
    
    // 에러 타입에 따른 구체적인 메시지 제공
    let errorMessage = '세션 삭제에 실패했습니다.'
    let statusCode = 500
    
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message)
      console.error('에러 스택:', error.stack)
      
      // Firebase 관련 에러 처리
      if (error.message.includes('permission') || error.message.includes('auth')) {
        errorMessage = '세션 삭제 권한이 없습니다.'
        statusCode = 403
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage = '네트워크 연결 오류로 삭제에 실패했습니다.'
        statusCode = 503
      } else if (error.message.includes('not found')) {
        errorMessage = '삭제하려는 세션을 찾을 수 없습니다.'
        statusCode = 404
      } else {
        errorMessage = `세션 삭제 중 오류가 발생했습니다: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      }, 
      { status: statusCode }
    )
  }
}