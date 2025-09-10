import { NextRequest, NextResponse } from 'next/server'
import { getAdminDatabase } from '@/lib/firebase-admin'

// Firebase 기반 교사 관리 API
export async function POST(request: NextRequest) {
  try {
    console.log('🔥 교사 API POST 시작')
    
    // 요청 타임아웃 설정 (10초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    })
    
    const requestPromise = async () => {
      const { firebaseUid, email, name, provider } = await request.json()
      
      console.log('📝 교사 데이터:', { firebaseUid, email, name, provider })
      
      if (!firebaseUid || !email) {
        console.log('❌ 필수 데이터 누락')
        return NextResponse.json(
          { success: false, error: 'Firebase UID와 이메일이 필요합니다.' },
          { status: 400 }
        )
      }

      console.log('🔍 Firebase Admin 데이터베이스 연결 시도')
      const database = getAdminDatabase()
      if (!database) {
        console.log('❌ Firebase Admin 데이터베이스 연결 실패')
        return NextResponse.json(
          { success: false, error: 'Firebase Admin 데이터베이스 연결 실패' },
          { status: 500 }
        )
      }
      console.log('✅ Firebase Admin 데이터베이스 연결 성공')
      
      return { database, firebaseUid, email, name, provider }
    }
    
    const result = await Promise.race([requestPromise(), timeoutPromise])
    
    if (result instanceof Error) {
      throw result
    }
    
    const { database, firebaseUid, email, name, provider } = result as any

    // 교사 정보 저장/업데이트
    const teacherData = {
      firebaseUid,
      email,
      name: name || email.split('@')[0],
      provider: provider || 'google',
      permissions: {
        canCreateSession: true,
        canManageStudents: true,
        canViewStatistics: true,
        isAdmin: false
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    const teacherRef = database.ref(`teachers/${firebaseUid}`)
    console.log('🔍 기존 교사 정보 확인 중:', `teachers/${firebaseUid}`)
    
    try {
      const existingTeacher = await teacherRef.once('value')
      
      if (existingTeacher.exists()) {
        console.log('✅ 기존 교사 정보 발견, 업데이트 중')
        const existingData = existingTeacher.val()
        // 기존 교사의 마지막 로그인 시간과 permissions 업데이트
        const updateData: any = {
          lastLoginAt: new Date().toISOString(),
          email: email,  // 이메일도 업데이트 (변경될 수 있음)
          name: name || existingData.name
        }
        
        // permissions가 없으면 기본값으로 추가
        if (!existingData.permissions) {
          updateData.permissions = {
            canCreateSession: true,
            canManageStudents: true,
            canViewStatistics: true,
            isAdmin: false
          }
        }
        
        await teacherRef.update(updateData)
        console.log('✅ 기존 교사 정보 업데이트 완료')
      } else {
        console.log('🆕 새로운 교사 정보 생성 중')
        // 새로운 교사 생성
        await teacherRef.set(teacherData)
        console.log('✅ 새로운 교사 정보 생성 완료')
      }

      console.log(`✅ 교사 정보 저장/업데이트 성공: ${email} (${firebaseUid})`)
    } catch (teacherError) {
      console.error('❌ 교사 정보 처리 실패:', teacherError)
      return NextResponse.json(
        { success: false, error: '교사 정보 처리 중 오류가 발생했습니다.', details: teacherError instanceof Error ? teacherError.message : String(teacherError) },
        { status: 500 }
      )
    }

    // 완전한 교사 데이터를 Firebase에서 다시 조회해서 반환
    const finalTeacherSnapshot = await teacherRef.once('value')
    const finalTeacherData = finalTeacherSnapshot.val()
    
    return NextResponse.json({
      success: true,
      teacher: finalTeacherData,
      message: '교사 정보가 성공적으로 저장되었습니다.'
    })
    
  } catch (error) {
    console.error('교사 정보 저장 오류:', error)
    return NextResponse.json(
      { success: false, error: '교사 정보 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const firebaseUid = searchParams.get('firebaseUid')
    
    if (!firebaseUid) {
      return NextResponse.json(
        { success: false, error: 'Firebase UID가 필요합니다.' },
        { status: 400 }
      )
    }

    const database = getAdminDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }

    const teacherRef = database.ref(`teachers/${firebaseUid}`)
    const teacherSnapshot = await teacherRef.once('value')
    
    if (!teacherSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: '교사 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      teacher: teacherSnapshot.val()
    })
    
  } catch (error) {
    console.error('교사 정보 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '교사 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { firebaseUid, name, email } = await request.json()
    
    if (!firebaseUid) {
      return NextResponse.json(
        { success: false, error: 'Firebase UID가 필요합니다.' },
        { status: 400 }
      )
    }

    const database = getAdminDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }

    const teacherRef = database.ref(`teachers/${firebaseUid}`)
    const teacherSnapshot = await teacherRef.once('value')
    
    if (!teacherSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: '교사 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 교사 정보 업데이트
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (name) updateData.name = name
    if (email) updateData.email = email

    await teacherRef.update(updateData)

    return NextResponse.json({
      success: true,
      message: '교사 정보가 성공적으로 업데이트되었습니다.'
    })
    
  } catch (error) {
    console.error('교사 정보 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, error: '교사 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}