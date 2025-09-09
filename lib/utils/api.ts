import { NextResponse } from 'next/server';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

export function createErrorResponse(error: string, status: number = 400): NextResponse<APIResponse> {
  return NextResponse.json({
    success: false,
    error
  }, { status });
}

// Firebase 마이그레이션 완료: withMongoDB 함수 제거됨
export async function withFirebase(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error) {
    console.error('Firebase API Error:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

export function generateReferenceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}