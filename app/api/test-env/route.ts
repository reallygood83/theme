import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('환경변수 테스트:', envCheck)
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('환경변수 테스트 에러:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}