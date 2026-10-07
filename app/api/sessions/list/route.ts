import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDatabase } from '@/lib/firebase-admin'
import { canListSessionsForTeacher, type SessionListIdentity } from '@/lib/session-list-access'

// API route는 동적으로 처리 필요
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  const token = authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1]
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let auth
  try {
    auth = getAdminAuth()
  } catch {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
  }
  if (!auth) {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
  }

  let identity: SessionListIdentity
  try {
    identity = await auth.verifyIdToken(token)
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && String(error.code).startsWith('auth/')) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }
    console.error('세션 목록 인증 확인 실패')
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 503 }
    )
  }

  const teacherId = new URL(request.url).searchParams.get('teacherId')
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId is required' }, { status: 400 })
  }
  if (!canListSessionsForTeacher(identity, teacherId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const database = getAdminDatabase()
  if (!database) {
    return NextResponse.json({ error: 'Session service unavailable' }, { status: 503 })
  }

  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    const query = database.ref('sessions')
      .orderByChild('teacherId')
      .equalTo(teacherId)
      .limitToLast(100)
      .once('value')
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Sessions list API timeout')), 30000)
    })
    const snapshot = await Promise.race([query, timeoutPromise])
    const sessionsData = snapshot.val() as Record<string, { createdAt?: unknown }> | null
    const sessions = Object.entries(sessionsData || {}).map(([sessionId, data]) => ({
      sessionId,
      ...data,
    }))
    sessions.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
    return NextResponse.json({ sessions })
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'Sessions list API timeout'
    console.error(timedOut ? '세션 목록 조회 시간 초과' : '세션 목록 조회 실패')
    return NextResponse.json(
      { error: timedOut ? 'Request timeout' : 'Failed to fetch sessions' },
      { status: timedOut ? 503 : 500 }
    )
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
