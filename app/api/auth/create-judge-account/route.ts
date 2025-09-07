import { NextRequest, NextResponse } from 'next/server'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    // 심사위원 계정 정보
    const judgeEmail = 'judge@questiontalk.demo'
    const judgePassword = 'JudgeDemo2025!'

    // 심사위원 계정 생성
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      judgeEmail,
      judgePassword
    )

    return NextResponse.json({
      success: true,
      message: '심사위원 계정이 성공적으로 생성되었습니다.',
      uid: userCredential.user.uid,
      email: userCredential.user.email
    })

  } catch (error: any) {
    console.error('심사위원 계정 생성 오류:', error)

    // 계정이 이미 존재하는 경우
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({
        success: false,
        message: '심사위원 계정이 이미 존재합니다.',
        error: error.code
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: '심사위원 계정 생성에 실패했습니다.',
      error: error.message
    }, { status: 500 })
  }
}