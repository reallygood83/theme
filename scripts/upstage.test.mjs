import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clusterQuestions,
  extractKeyTerms,
  generateUpstageContent,
  getUpstageModel,
  recommendAgendas,
} from '../lib/upstage.ts'

const endpoint = 'https://api.upstage.ai/v1/chat/completions'

test('uses documented Solar chat completions contract for Pro4 and Mini4', async (t) => {
  const originalKey = process.env.UPSTAGE_API_KEY
  const originalModel = process.env.UPSTAGE_MODEL
  const originalFetch = globalThis.fetch
  t.after(() => {
    if (originalKey === undefined) delete process.env.UPSTAGE_API_KEY
    else process.env.UPSTAGE_API_KEY = originalKey
    if (originalModel === undefined) delete process.env.UPSTAGE_MODEL
    else process.env.UPSTAGE_MODEL = originalModel
    globalThis.fetch = originalFetch
  })

  process.env.UPSTAGE_API_KEY = 'test-placeholder-key'
  delete process.env.UPSTAGE_MODEL
  assert.equal(getUpstageModel(), 'solar-pro4')

  for (const model of ['solar-pro4', 'solar-mini4']) {
    process.env.UPSTAGE_MODEL = model
    let captured
    globalThis.fetch = async (url, init) => {
      captured = { url: String(url), init }
      return new Response(JSON.stringify({ choices: [{ message: { content: '토론 논제 결과' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    assert.equal(await generateUpstageContent('학생 질문 분석'), '토론 논제 결과')
    assert.equal(captured.url, endpoint)
    assert.equal(captured.init.method, 'POST')
    assert.equal(captured.init.headers.Authorization, 'Bearer test-placeholder-key')
    assert.equal(captured.init.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(captured.init.body), {
      model,
      messages: [{ role: 'user', content: '학생 질문 분석' }],
    })
  }

  let tokenLimitedRequest
  globalThis.fetch = async (url, init) => {
    tokenLimitedRequest = { url: String(url), init }
    return new Response(JSON.stringify({ choices: [{ message: { content: 'scenario' } }] }), { status: 200 })
  }
  await generateUpstageContent('긴 시나리오 생성', 4000)
  assert.equal(tokenLimitedRequest.url, endpoint)
  assert.equal(JSON.parse(tokenLimitedRequest.init.body).max_tokens, 4000)
})

test('rejects missing key and unsupported model before making a request', async (t) => {
  const originalKey = process.env.UPSTAGE_API_KEY
  const originalModel = process.env.UPSTAGE_MODEL
  const originalFetch = globalThis.fetch
  t.after(() => {
    if (originalKey === undefined) delete process.env.UPSTAGE_API_KEY
    else process.env.UPSTAGE_API_KEY = originalKey
    if (originalModel === undefined) delete process.env.UPSTAGE_MODEL
    else process.env.UPSTAGE_MODEL = originalModel
    globalThis.fetch = originalFetch
  })

  let fetchCalled = false
  globalThis.fetch = async () => {
    fetchCalled = true
    throw new Error('fetch must not run for invalid configuration')
  }

  delete process.env.UPSTAGE_API_KEY
  await assert.rejects(generateUpstageContent('prompt'), /UPSTAGE_API_KEY/)
  process.env.UPSTAGE_API_KEY = 'test-placeholder-key'
  process.env.UPSTAGE_MODEL = 'unsupported-model'
  await assert.rejects(generateUpstageContent('prompt'), /solar-pro4 또는 solar-mini4/)
  assert.equal(fetchCalled, false)
})

test('rejects upstream errors and responses without generated text', async (t) => {
  const originalKey = process.env.UPSTAGE_API_KEY
  const originalModel = process.env.UPSTAGE_MODEL
  const originalFetch = globalThis.fetch
  t.after(() => {
    if (originalKey === undefined) delete process.env.UPSTAGE_API_KEY
    else process.env.UPSTAGE_API_KEY = originalKey
    if (originalModel === undefined) delete process.env.UPSTAGE_MODEL
    else process.env.UPSTAGE_MODEL = originalModel
    globalThis.fetch = originalFetch
  })

  process.env.UPSTAGE_API_KEY = 'test-placeholder-key'
  process.env.UPSTAGE_MODEL = 'solar-pro4'
  globalThis.fetch = async () => new Response('provider error', { status: 503 })
  await assert.rejects(generateUpstageContent('prompt'), /503/)

  globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: {} }] }), { status: 200 })
  await assert.rejects(generateUpstageContent('prompt'), /생성된 내용/)

  globalThis.fetch = async () => new Response('null', { status: 200 })
  await assert.rejects(generateUpstageContent('prompt'), /생성된 내용/)
})

test('validates structured AI results before returning them to routes', async (t) => {
  const originalKey = process.env.UPSTAGE_API_KEY
  const originalModel = process.env.UPSTAGE_MODEL
  const originalFetch = globalThis.fetch
  t.after(() => {
    if (originalKey === undefined) delete process.env.UPSTAGE_API_KEY
    else process.env.UPSTAGE_API_KEY = originalKey
    if (originalModel === undefined) delete process.env.UPSTAGE_MODEL
    else process.env.UPSTAGE_MODEL = originalModel
    globalThis.fetch = originalFetch
  })

  process.env.UPSTAGE_API_KEY = 'test-placeholder-key'
  process.env.UPSTAGE_MODEL = 'solar-pro4'
  let content = ''
  globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })

  content = JSON.stringify({ clusters: [{
    clusterId: '1',
    clusterTitle: '급식',
    clusterSummary: '급식 선택에 관한 질문',
    questions: ['메뉴를 고를 수 있나요?'],
    combinationGuide: '함께 논의할 수 있습니다.',
  }] })
  assert.equal((await clusterQuestions(['메뉴를 고를 수 있나요?'])).clusters.length, 1)
  content = JSON.stringify({ clusters: [{ clusterId: 1 }] })
  await assert.rejects(clusterQuestions(['질문']), /질문 분류 응답/)

  content = JSON.stringify({ agendas: [{ agendaId: '1', agendaTitle: '논제', reason: '이유', type: '찬반형' }] })
  assert.equal((await recommendAgendas([], [])).agendas.length, 1)
  content = JSON.stringify({ agendas: [{ agendaId: '1', agendaTitle: '논제', reason: '이유', type: '기타' }] })
  await assert.rejects(recommendAgendas([], []), /논제 추천 응답/)

  content = JSON.stringify({ terms: [{ term: '영양', description: '설명' }] })
  assert.equal((await extractKeyTerms('학교 급식')).terms.length, 1)
  content = JSON.stringify({ terms: [{ term: 1, description: false }] })
  await assert.rejects(extractKeyTerms('학교 급식'), /핵심 용어 응답/)
})
