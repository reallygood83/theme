const UPSTAGE_CHAT_COMPLETIONS_URL = 'https://api.upstage.ai/v1/chat/completions'

export type UpstageModel = 'solar-pro4' | 'solar-mini4'

type UpstageResponseFormat = {
  type: 'json_schema'
  json_schema: {
    name: string
    strict: true
    schema: Record<string, unknown>
  }
}

export class UpstageError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'UpstageError'
    this.statusCode = statusCode
  }
}

export function getUpstageModel(): UpstageModel {
  const model = process.env.UPSTAGE_MODEL?.trim() || 'solar-pro4'
  if (model !== 'solar-pro4' && model !== 'solar-mini4') {
    throw new UpstageError('UPSTAGE_MODEL은 solar-pro4 또는 solar-mini4여야 합니다.', 500)
  }
  return model
}

export async function generateUpstageContent(
  prompt: string,
  maxTokens?: number,
  responseFormat?: UpstageResponseFormat
): Promise<string> {
  const apiKey = process.env.UPSTAGE_API_KEY?.trim()
  if (!apiKey) {
    throw new UpstageError('Upstage API 키가 설정되지 않았습니다. Vercel의 UPSTAGE_API_KEY를 확인해주세요.', 503)
  }

  const model = getUpstageModel()
  let response: Response
  try {
    response = await fetch(UPSTAGE_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        ...(maxTokens === undefined ? {} : { max_tokens: maxTokens }),
        ...(responseFormat === undefined ? {} : { response_format: responseFormat }),
      }),
    })
  } catch {
    throw new UpstageError('Upstage API에 연결할 수 없습니다.', 503)
  }

  if (!response.ok) {
    const detail = await readUpstageErrorDetail(response)
    const suffix = detail ? ` ${detail}` : ''
    if (response.status === 401 || response.status === 403) {
      throw new UpstageError(`Upstage 인증에 실패했습니다. Vercel의 UPSTAGE_API_KEY를 확인해주세요.${suffix}`, 503)
    }
    if (response.status === 429 || response.status >= 500) {
      throw new UpstageError(`Upstage API를 일시적으로 사용할 수 없습니다 (HTTP ${response.status}).${suffix}`, 503)
    }
    throw new UpstageError(`Upstage API 요청에 실패했습니다 (HTTP ${response.status}).${suffix}`, 502)
  }

  let result: {
    choices?: Array<{
      finish_reason?: string | null
      message?: { content?: unknown }
    }>
  } | null
  try {
    result = await response.json()
  } catch {
    throw new UpstageError('Upstage API가 올바르지 않은 응답을 반환했습니다.', 502)
  }

  const choice = result?.choices?.[0]
  const content = readMessageContent(choice?.message?.content).trim()
  // Official chat completions: finish_reason "length" means the JSON/text was cut off.
  if (choice?.finish_reason === 'length') {
    throw new UpstageError('Upstage 응답이 길이 제한으로 잘려 분석을 완료하지 못했습니다. 다시 시도해주세요.', 502)
  }
  if (!content) {
    throw new UpstageError('Upstage API 응답에 생성된 내용이 없습니다.', 502)
  }
  return content
}

async function readUpstageErrorDetail(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (!body || typeof body !== 'object') return ''
    const error = (body as { error?: unknown }).error
    const message = typeof error === 'string'
      ? error
      : error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : ''
    const trimmed = message.trim()
    return trimmed ? trimmed.slice(0, 300) : ''
  } catch {
    return ''
  }
}

function readMessageContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map((part) => {
    if (typeof part === 'string') return part
    if (part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string') {
      return (part as { text: string }).text
    }
    return ''
  }).join('')
}

const questionClustersSchema: Record<string, unknown> = {
  type: 'object',
  properties: {
    clusters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clusterId: { type: 'string' },
          clusterTitle: { type: 'string' },
          clusterSummary: { type: 'string' },
          questions: { type: 'array', items: { type: 'string' } },
          combinationGuide: { type: 'string' },
        },
        required: ['clusterId', 'clusterTitle', 'clusterSummary', 'questions', 'combinationGuide'],
        additionalProperties: false,
      },
    },
  },
  required: ['clusters'],
  additionalProperties: false,
}

const debateAgendasSchema: Record<string, unknown> = {
  type: 'object',
  properties: {
    agendas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          agendaId: { type: 'string' },
          agendaTitle: { type: 'string' },
          reason: { type: 'string' },
          type: { type: 'string', enum: ['찬반형', '원인탐구형', '문제해결형', '가치판단형'] },
        },
        required: ['agendaId', 'agendaTitle', 'reason', 'type'],
        additionalProperties: false,
      },
    },
  },
  required: ['agendas'],
  additionalProperties: false,
}

const keyTermsSchema: Record<string, unknown> = {
  type: 'object',
  properties: {
    terms: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          term: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['term', 'description'],
        additionalProperties: false,
      },
    },
  },
  required: ['terms'],
  additionalProperties: false,
}

function generateStructuredUpstageContent(prompt: string, name: string, schema: Record<string, unknown>) {
  return generateUpstageContent(prompt, undefined, {
    type: 'json_schema',
    json_schema: { name, strict: true, schema },
  })
}

function parseStructuredResponse<T extends object>(response: string): T {
  const fenced = response.match(/```json\s*([\s\S]*?)\s*```/i)
  const object = response.match(/{[\s\S]*}/)
  const json = fenced?.[1] ?? object?.[0] ?? response

  try {
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Expected a JSON object')
    }
    return parsed as T
  } catch {
    throw new UpstageError('Upstage API가 올바른 JSON 형식의 응답을 반환하지 않았습니다.', 502)
  }
}

interface QuestionCluster {
  clusterId: string
  clusterTitle: string
  clusterSummary: string
  questions: string[]
  combinationGuide: string
}

interface Agenda {
  agendaId: string
  agendaTitle: string
  reason: string
  type: '찬반형' | '원인탐구형' | '문제해결형' | '가치판단형'
}

interface KeyTerm {
  term: string
  description: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isQuestionCluster(value: unknown): value is QuestionCluster {
  return isRecord(value)
    && typeof value.clusterId === 'string'
    && typeof value.clusterTitle === 'string'
    && typeof value.clusterSummary === 'string'
    && isStringArray(value.questions)
    && typeof value.combinationGuide === 'string'
}

function isAgenda(value: unknown): value is Agenda {
  return isRecord(value)
    && typeof value.agendaId === 'string'
    && typeof value.agendaTitle === 'string'
    && typeof value.reason === 'string'
    && (value.type === '찬반형' || value.type === '원인탐구형' || value.type === '문제해결형' || value.type === '가치판단형')
}

function isKeyTerm(value: unknown): value is KeyTerm {
  return isRecord(value) && typeof value.term === 'string' && typeof value.description === 'string'
}

export async function clusterQuestions(questions: string[]) {
  const prompt = `
다음은 학생들이 토론 주제에 대해 작성한 질문 목록입니다.
이 질문들을 내용의 유사성에 따라 3-5개 그룹으로 묶고,
각 그룹의 핵심 내용을 요약한 뒤, '이 그룹의 질문들은 내용이 유사하여 함께 논의하거나 하나의 질문으로 합쳐볼 수 있습니다.'라는 안내를 추가해주세요.

응답은 JSON 형식으로 다음 구조를 따라주세요:
{
  "clusters": [
    {
      "clusterId": "1",
      "clusterTitle": "그룹 요약 제목",
      "clusterSummary": "그룹에 포함된 질문들의 공통 주제 요약",
      "questions": ["질문1", "질문2"],
      "combinationGuide": "이 그룹의 질문들은 내용이 유사하여 함께 논의하거나 하나의 질문으로 합쳐볼 수 있습니다."
    },
  ]
}

질문 목록:
${questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}
`
  const result = parseStructuredResponse<{ clusters: QuestionCluster[] }>(
    await generateStructuredUpstageContent(prompt, 'question_clusters', questionClustersSchema)
  )
  if (!Array.isArray(result.clusters) || result.clusters.length === 0 || !result.clusters.every(isQuestionCluster)) {
    throw new UpstageError('Upstage API의 질문 분류 응답이 올바르지 않습니다.', 502)
  }
  return result
}

export async function recommendAgendas(clusters: QuestionCluster[], keywords: string[] = []) {
  const clusterSummaries = clusters.map((cluster, index) =>
    `그룹 ${index + 1}: ${cluster.clusterTitle} - ${cluster.clusterSummary}`
  ).join('\n')
  const keywordsText = keywords.length > 0 ? `추가 키워드: ${keywords.join(', ')}` : '추가 키워드 없음'
  const prompt = `
다음 학생들의 질문 유형 분석 결과와 핵심 키워드를 참고하여, 초등학생들이 토론하기 좋은 논제 2-3개를 추천해 주세요.
반드시 제시된 질문 유형 분석 내용을 바탕으로 논제를 추천해야 합니다. 학생들의 관심사와 무관한 엉뚱한 주제는 피해주세요.

각 논제를 추천하는 이유를 간략하게 설명하고, 이 논제가 어떤 유형 분석 그룹에서 도출되었는지 명시해 주세요.

논제 작성 가이드라인:
1. 명확하고 간결한 문장으로 작성
2. 찬반 토론이 가능한 주제여야 함
3. 단순한 찬반 대립을 넘어, 다양한 관점이 공존하며 함께 문제를 해결해가는 방향성 지향
4. 학생들이 협력적 문제해결 경험을 할 수 있는 논제 설계
5. 다양한 유형의 논제 포함 (찬반형, 원인탐구형, 문제해결형, 가치판단형)

응답은 JSON 형식으로 다음 구조를 따라주세요:
{
  "agendas": [
    {
      "agendaId": "1",
      "agendaTitle": "토론 논제 문장",
      "reason": "이 논제를 추천하는 이유와 어떤 질문 그룹에서 도출되었는지 (1-2문장)",
      "type": "찬반형"
    },
  ]
}

논제 유형은 찬반형, 원인탐구형, 문제해결형, 가치판단형 중 하나로 작성해주세요.

학생 질문 유형 분석 결과:
${clusterSummaries}
${keywordsText}
`
  const result = parseStructuredResponse<{ agendas: Agenda[] }>(
    await generateStructuredUpstageContent(prompt, 'debate_agendas', debateAgendasSchema)
  )
  if (!Array.isArray(result.agendas) || result.agendas.length === 0 || !result.agendas.every(isAgenda)) {
    throw new UpstageError('Upstage API의 논제 추천 응답이 올바르지 않습니다.', 502)
  }
  return result
}

export async function extractKeyTerms(agenda: string) {
  const prompt = `
다음 토론 논제에서 핵심이 되는 주요 용어 2-3개를 추출해주세요.
이 용어들은 학생들이 토론 전에 의미를 명확히 해야 할 단어들입니다.

응답은 JSON 형식으로 다음 구조를 따라주세요:
{
  "terms": [
    {
      "term": "용어1",
      "description": "이 용어가 논제에서 중요한 이유에 대한 짧은 설명"
    },
  ]
}

논제: "${agenda}"
`
  const result = parseStructuredResponse<{ terms: KeyTerm[] }>(
    await generateStructuredUpstageContent(prompt, 'key_terms', keyTermsSchema)
  )
  if (!Array.isArray(result.terms) || result.terms.length === 0 || !result.terms.every(isKeyTerm)) {
    throw new UpstageError('Upstage API의 핵심 용어 응답이 올바르지 않습니다.', 502)
  }
  return result
}

export function generateContent(prompt: string): Promise<string> {
  return generateUpstageContent(prompt)
}
