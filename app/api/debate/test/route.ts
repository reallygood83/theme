import { NextRequest, NextResponse } from 'next/server'

// Firebase 마이그레이션 완료: MongoDB 연결 테스트 API는 더 이상 필요하지 않습니다.
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: true,
      message: 'Firebase로 마이그레이션 완료. MongoDB 테스트 API는 더 이상 필요하지 않습니다.',
      status: 'Firebase Active',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  )
}