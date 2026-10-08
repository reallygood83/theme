import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('question analysis has enough time for three sequential AI calls without extending other APIs', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.equal(config.functions['app/api/ai/analyze-questions/route.ts']?.maxDuration, 120)
  assert.equal(config.functions['app/api/**/*.ts'].maxDuration, 30)
})
