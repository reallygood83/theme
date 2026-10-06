import assert from 'node:assert/strict'
import test from 'node:test'
import {
  sessionMatchesCode,
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

test('accepts only the session code or access code stored on the session', () => {
  const session = { sessionCode: 'AB12CD', accessCode: 'ZX98YU' }

  assert.equal(sessionMatchesCode(session, 'AB12CD'), true)
  assert.equal(sessionMatchesCode(session, 'ZX98YU'), true)
  assert.equal(sessionMatchesCode(session, 'WRONG'), false)
  assert.equal(sessionMatchesCode(null, 'AB12CD'), false)
})
