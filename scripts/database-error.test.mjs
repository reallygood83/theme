import assert from 'node:assert/strict'
import test from 'node:test'
import { describeDatabaseError } from '../lib/database-error.ts'

test('turns Firebase permission denials into a visible save error', () => {
  const error = new Error('PERMISSION_DENIED: Permission denied')
  error.code = 'PERMISSION_DENIED'
  const result = describeDatabaseError(error, '질문 분석에 실패했습니다.')
  assert.equal(result.status, 403)
  assert.match(result.error, /권한/)
})

test('keeps unknown database failures on the caller fallback', () => {
  const result = describeDatabaseError(new Error('network down'), '질문 분석에 실패했습니다.')
  assert.deepEqual(result, { status: 500, error: '질문 분석에 실패했습니다.' })
})
