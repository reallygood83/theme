export async function parseJsonResponse<T = unknown>(response: Response): Promise<T> {
  const body = await response.text()
  try {
    return JSON.parse(body) as T
  } catch {
    throw new Error(`서버 응답을 JSON으로 읽을 수 없습니다. (HTTP ${response.status})`)
  }
}
