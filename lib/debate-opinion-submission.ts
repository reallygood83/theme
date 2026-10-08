export interface DebateOpinionSubmission {
  sessionId: string
  sessionCode: string
  studentName: string
  studentGroup: string
  selectedAgenda: string
  position: 'agree' | 'disagree'
  opinionText: string
}

type ValidationResult =
  | { success: true; data: DebateOpinionSubmission }
  | { success: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readRequiredString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null
}

export function validateDebateOpinionSubmission(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { success: false, error: '요청 형식이 올바르지 않습니다.' }
  }

  const sessionId = readRequiredString(value.sessionId, 128)
  const sessionCode = readRequiredString(value.sessionCode, 64)
  const studentName = readRequiredString(value.studentName, 80)
  const studentGroup = readRequiredString(value.studentGroup, 80)
  const selectedAgenda = readRequiredString(value.selectedAgenda, 300)
  const opinionText = readRequiredString(value.opinionText, 5000)
  const position = value.position

  if (!sessionId || !sessionCode || !studentName || !studentGroup || !selectedAgenda || !opinionText) {
    return { success: false, error: '필수 입력이 누락되었거나 허용된 길이를 초과했습니다.' }
  }

  if (/[\u0000-\u001f\u007f.#$\[\]\/]/.test(sessionId)) {
    return { success: false, error: '세션 정보가 올바르지 않습니다.' }
  }

  if (position !== 'agree' && position !== 'disagree') {
    return { success: false, error: '찬성 또는 반대 입장을 선택해주세요.' }
  }

  return {
    success: true,
    data: { sessionId, sessionCode, studentName, studentGroup, selectedAgenda, position, opinionText },
  }
}

export function sessionMatchesCode(session: unknown, sessionCode: string): boolean {
  return isRecord(session)
    && (session.sessionCode === sessionCode || session.accessCode === sessionCode)
}

export interface OpinionWriter {
  readSession(sessionId: string): Promise<unknown>
  writeOpinion(sessionId: string, opinion: DebateOpinionRecord): Promise<string>
}

export interface DebateOpinionRecord extends DebateOpinionSubmission {
  createdAt: number
  timestamp: string
}

export type OpinionStoreResult =
  | { ok: true; opinionId: string }
  | { ok: false; status: number; error: string }

export async function storeDebateOpinion(
  writer: OpinionWriter,
  submission: DebateOpinionSubmission,
  now = Date.now()
): Promise<OpinionStoreResult> {
  let session: unknown
  try {
    session = await writer.readSession(submission.sessionId)
  } catch (error) {
    return databaseFailure(error)
  }

  if (!sessionMatchesCode(session, submission.sessionCode)) {
    return { ok: false, status: 404, error: '세션 코드가 올바르지 않습니다.' }
  }

  const opinion: DebateOpinionRecord = {
    ...submission,
    createdAt: now,
    timestamp: new Date(now).toISOString(),
  }

  try {
    const opinionId = await writer.writeOpinion(submission.sessionId, opinion)
    if (!opinionId) {
      return { ok: false, status: 500, error: '토론 의견 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' }
    }
    return { ok: true, opinionId }
  } catch (error) {
    return databaseFailure(error)
  }
}

function databaseFailure(error: unknown): OpinionStoreResult {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
  const message = error instanceof Error ? error.message : ''
  if (code.includes('PERMISSION_DENIED') || message.includes('PERMISSION_DENIED') || message.includes('permission_denied')) {
    return {
      ok: false,
      status: 403,
      error: '토론 의견을 저장할 권한이 없습니다. 세션 코드가 맞는지 확인하고, 계속되면 선생님께 알려주세요.',
    }
  }
  return { ok: false, status: 500, error: '토론 의견 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' }
}
