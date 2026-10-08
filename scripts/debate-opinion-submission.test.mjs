import assert from 'node:assert/strict'
import test from 'node:test'
import {
  sessionMatchesCode,
  storeDebateOpinion,
  validateDebateOpinionSubmission,
} from '../lib/debate-opinion-submission.ts'

const validSubmission = {
  sessionId: 'session_123',
  sessionCode: 'AB12CD',
  studentName: ' 학생 ',
  studentGroup: ' 3모둠 ',
  selectedAgenda: ' 논제 ',
  position: 'agree',
  opinionText: ' 근거와 의견 ',
}

test('validates and trims a student opinion submission', () => {
  const result = validateDebateOpinionSubmission(validSubmission)

  assert.deepEqual(result, {
    success: true,
    data: {
      sessionId: 'session_123',
      sessionCode: 'AB12CD',
      studentName: '학생',
      studentGroup: '3모둠',
      selectedAgenda: '논제',
      position: 'agree',
      opinionText: '근거와 의견',
    },
  })
})

test('rejects invalid positions, empty fields, oversized content, and Firebase path keys', () => {
  assert.equal(validateDebateOpinionSubmission({ ...validSubmission, position: 'neutral' }).success, false)
  assert.equal(validateDebateOpinionSubmission({ ...validSubmission, opinionText: '   ' }).success, false)
  assert.equal(validateDebateOpinionSubmission({ ...validSubmission, opinionText: 'x'.repeat(5001) }).success, false)
  assert.equal(validateDebateOpinionSubmission({ ...validSubmission, sessionId: 'session/other' }).success, false)
})

test('stores an opinion when the session access code matches and reports permission failures', async () => {
  const writes = []
  const submission = validateDebateOpinionSubmission(validSubmission)
  assert.equal(submission.success, true)
  const result = await storeDebateOpinion({
    async readSession() {
      return { accessCode: 'AB12CD' }
    },
    async writeOpinion(sessionId, opinion) {
      writes.push({ sessionId, opinion })
      return 'opinion-1'
    },
  }, submission.data, 1_700_000_000_000)

  assert.deepEqual(result, { ok: true, opinionId: 'opinion-1' })
  assert.equal(writes[0].sessionId, 'session_123')
  assert.equal(writes[0].opinion.sessionCode, 'AB12CD')
  assert.equal(writes[0].opinion.opinionText, '근거와 의견')
  assert.equal(writes[0].opinion.createdAt, 1_700_000_000_000)

  const mismatch = await storeDebateOpinion({
    async readSession() {
      return { accessCode: 'OTHER' }
    },
    async writeOpinion() {
      throw new Error('must not write')
    },
  }, submission.data)
  assert.deepEqual(mismatch, { ok: false, status: 404, error: '세션 코드가 올바르지 않습니다.' })

  const denied = await storeDebateOpinion({
    async readSession() {
      const error = new Error('PERMISSION_DENIED: Permission denied')
      error.code = 'PERMISSION_DENIED'
      throw error
    },
    async writeOpinion() {
      return 'unused'
    },
  }, submission.data)
  assert.equal(denied.ok, false)
  assert.equal(denied.status, 403)
  assert.match(denied.error, /권한/)
})

test('accepts only the session code or access code stored on the session', () => {
  const session = { sessionCode: 'AB12CD', accessCode: 'ZX98YU' }

  assert.equal(sessionMatchesCode(session, 'AB12CD'), true)
  assert.equal(sessionMatchesCode(session, 'ZX98YU'), true)
  assert.equal(sessionMatchesCode(session, 'WRONG'), false)
  assert.equal(sessionMatchesCode(null, 'AB12CD'), false)
})
