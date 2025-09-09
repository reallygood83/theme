import { NextRequest, NextResponse } from 'next/server'

// Firebase 마이그레이션 완료: 이 API는 더 이상 사용되지 않습니다.
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'API가 Firebase로 마이그레이션되었습니다. 교사 인증은 Firebase Auth를 사용합니다.' 
    },
    { status: 410 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'API가 Firebase로 마이그레이션되었습니다. 교사 인증은 Firebase Auth를 사용합니다.' 
    },
    { status: 410 }
  )
}