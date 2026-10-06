import assert from 'node:assert/strict'
import test from 'node:test'
import { parseJsonResponse } from '../lib/api-response.ts'

test('parses successful JSON responses', async () => {
  const response = new Response(JSON.stringify({ success: true }), { status: 200 })

  assert.deepEqual(await parseJsonResponse(response), { success: true })
})

test('reports non-JSON server failures without exposing their body', async () => {
  const response = new Response('An error occurred', { status: 504 })

  await assert.rejects(parseJsonResponse(response), (error) => {
    assert.match(error.message, /HTTP 504/)
    assert.doesNotMatch(error.message, /An error occurred/)
    assert.doesNotMatch(error.message, /Unexpected token/)
    return true
  })
})

test('reports malformed JSON with the response status', async () => {
  const response = new Response('{invalid json', { status: 502 })

  await assert.rejects(parseJsonResponse(response), /HTTP 502/)
})
