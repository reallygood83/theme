export const JUDGE_DEMO_EMAIL = 'judge@questiontalk.demo'
export const JUDGE_DEMO_TEACHER_ID = 'MSMk1a3iHBfbLzLwwnwpFnwJjS63'

export interface SessionListIdentity {
  uid: string
  email?: string | null
}

export function getSessionListTeacherId(identity: SessionListIdentity): string {
  return identity.email === JUDGE_DEMO_EMAIL ? JUDGE_DEMO_TEACHER_ID : identity.uid
}

export function canListSessionsForTeacher(identity: SessionListIdentity, teacherId: string): boolean {
  return Boolean(identity.uid) && teacherId === getSessionListTeacherId(identity)
}
