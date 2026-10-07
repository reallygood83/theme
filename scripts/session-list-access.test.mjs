import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canListSessionsForTeacher,
  getSessionListTeacherId,
} from '../lib/session-list-access.ts'

test('a teacher can list only sessions linked to their verified uid', () => {
  const identity = { uid: 'teacher-uid-1', email: 'teacher@example.test' }

  assert.equal(getSessionListTeacherId(identity), 'teacher-uid-1')
  assert.equal(canListSessionsForTeacher(identity, 'teacher-uid-1'), true)
  assert.equal(canListSessionsForTeacher(identity, 'teacher-uid-2'), false)
})

test('the judge demo is limited to its explicitly mapped teacher uid', () => {
  const judge = { uid: 'judge-auth-uid', email: 'judge@questiontalk.demo' }
  const demoTeacherUid = 'MSMk1a3iHBfbLzLwwnwpFnwJjS63'

  assert.equal(getSessionListTeacherId(judge), demoTeacherUid)
  assert.equal(canListSessionsForTeacher(judge, demoTeacherUid), true)
  assert.equal(canListSessionsForTeacher(judge, 'another-teacher-uid'), false)
  assert.equal(canListSessionsForTeacher(judge, judge.uid), false)
})
