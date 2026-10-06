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
