import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseDatabase } from '@/lib/firebase'
import { ref, get, set, update } from 'firebase/database'

// Firebase 기반 교사 관리 API
export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, name, provider } = await request.json()
    
    if (!firebaseUid || !email) {
      return NextResponse.json(
        { success: false, error: 'Firebase UID와 이메일이 필요합니다.' },
        { status: 400 }
      )
    }

    const database = getFirebaseDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Firebase 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }

    // 교사 정보 저장/업데이트
    const teacherData = {
      firebaseUid,
      email,
      name: name || email.split('@')[0],
      provider: provider || 'google',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    const teacherRef = ref(database, `teachers/${firebaseUid}`)
    const existingTeacher = await get(teacherRef)
    
    if (existingTeacher.exists()) {
      // 기존 교사의 마지막 로그인 시간만 업데이트
      await update(teacherRef, {
        lastLoginAt: new Date().toISOString(),
        email: email,  // 이메일도 업데이트 (변경될 수 있음)
        name: name || existingTeacher.val().name
      })
    } else {
      // 새로운 교사 생성
      await set(teacherRef, teacherData)
    }

    console.log(`교사 정보 저장/업데이트: ${email} (${firebaseUid})`)

    return NextResponse.json({
      success: true,
      teacher: {
        firebaseUid,
        email,
        name: teacherData.name,
        provider: teacherData.provider
      },
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

    const database = getFirebaseDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Firebase 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }

    const teacherRef = ref(database, `teachers/${firebaseUid}`)
    const teacherSnapshot = await get(teacherRef)
    
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

    const database = getFirebaseDatabase()
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Firebase 데이터베이스 연결 실패' },
        { status: 500 }
      )
    }

    const teacherRef = ref(database, `teachers/${firebaseUid}`)
    const teacherSnapshot = await get(teacherRef)
    
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

    await update(teacherRef, updateData)

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