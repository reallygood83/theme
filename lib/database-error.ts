export interface DatabaseFailure {
  status: number
  error: string
}

export function describeDatabaseError(error: unknown, fallback: string): DatabaseFailure {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
  const message = error instanceof Error ? error.message : ''
  if (
    code.includes('PERMISSION_DENIED')
    || message.includes('PERMISSION_DENIED')
    || message.includes('permission_denied')
  ) {
    return {
      status: 403,
      error: '데이터베이스 저장 권한이 없습니다. 세션 코드가 맞는지 확인하고, 계속되면 선생님께 알려주세요.',
    }
  }
  return { status: 500, error: fallback }
}
