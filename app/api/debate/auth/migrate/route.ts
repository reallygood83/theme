import { NextRequest, NextResponse } from 'next/server'

// Firebase 마이그레이션 완료: 데이터 마이그레이션 API는 더 이상 필요하지 않습니다.
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Firebase 마이그레이션이 완료되었습니다. 이 API는 더 이상 필요하지 않습니다.' 
    },
    { status: 410 }
  )
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Firebase 마이그레이션이 완료되었습니다. 이 API는 더 이상 필요하지 않습니다.' 
    },
    { status: 410 }
  )
}