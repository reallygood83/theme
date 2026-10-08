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

  globalThis.fetch = async () => new Response(JSON.stringify({
    error: { message: 'response_format.json_schema is invalid' },
  }), { status: 400 })
  await assert.rejects(generateUpstageContent('prompt'), /json_schema is invalid/)

  globalThis.fetch = async () => new Response(JSON.stringify({
    choices: [{ finish_reason: 'length', message: { content: '{"clusters":' } }],
  }), { status: 200 })
  await assert.rejects(generateUpstageContent('prompt'), /잘려/)

  globalThis.fetch = async () => new Response(JSON.stringify({
    choices: [{ finish_reason: 'stop', message: { content: [{ type: 'text', text: '배열 본문' }] } }],
  }), { status: 200 })
  assert.equal(await generateUpstageContent('prompt'), '배열 본문')

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

test('requests strict JSON schemas for every structured Solar task', async (t) => {
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
  const cases = [
    {
      name: 'question_clusters',
      rootField: 'clusters',
      fields: ['clusterId', 'clusterTitle', 'clusterSummary', 'questions', 'combinationGuide'],
      run: () => clusterQuestions(['급식 메뉴는 어떻게 정할까?']),
      output: { clusters: [{
        clusterId: '1',
        clusterTitle: '급식 선택',
        clusterSummary: '급식 메뉴 결정에 관한 질문',
        questions: ['급식 메뉴는 어떻게 정할까?'],
        combinationGuide: '함께 논의할 수 있습니다.',
      }] },
    },
    {
      name: 'debate_agendas',
      rootField: 'agendas',
      fields: ['agendaId', 'agendaTitle', 'reason', 'type'],
      run: () => recommendAgendas([], []),
      output: { agendas: [{ agendaId: '1', agendaTitle: '논제', reason: '이유', type: '찬반형' }] },
    },
    {
      name: 'key_terms',
      rootField: 'terms',
      fields: ['term', 'description'],
      run: () => extractKeyTerms('학교 급식'),
      output: { terms: [{ term: '영양', description: '설명' }] },
    },
  ]

  for (const model of ['solar-pro4', 'solar-mini4']) {
    process.env.UPSTAGE_MODEL = model
    for (const task of cases) {
      let capturedRequest
      globalThis.fetch = async (_url, init) => {
        capturedRequest = JSON.parse(init.body)
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(task.output) } }],
        }), { status: 200 })
      }

      await task.run()
      assert.equal(capturedRequest.model, model)
      assert.equal(capturedRequest.response_format.type, 'json_schema')

      const { name, strict, schema } = capturedRequest.response_format.json_schema
      assert.equal(name, task.name)
      assert.equal(strict, true)
      assert.equal(schema.type, 'object')
      assert.equal(schema.additionalProperties, false)
      assert.deepEqual(schema.required, [task.rootField])
      assert.equal(schema.properties[task.rootField].items.additionalProperties, false)
      assert.deepEqual(schema.properties[task.rootField].items.required, task.fields)
    }
  }
})
