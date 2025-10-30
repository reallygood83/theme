import { NextRequest, NextResponse } from 'next/server'

// Firebase 마이그레이션 완료: 이 엔드포인트는 더 이상 사용되지 않습니다.
// 모든 데이터는 Firebase Realtime Database로 이동되었습니다.
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'API가 Firebase로 마이그레이션되었습니다. /api/firebase/opinions 사용하세요.' 
    },
    { status: 410 }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'API가 Firebase로 마이그레이션되었습니다.' 
    },
    { status: 410 }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'API가 Firebase로 마이그레이션되었습니다.' 
    },
    { status: 410 }
  )
}