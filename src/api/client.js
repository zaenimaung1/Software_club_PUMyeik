/** Base URL: prefer explicit env, otherwise use local API in development. */
export function apiBase() {
  const configured = import.meta.env.VITE_API_URL
  if (configured) return configured
  return import.meta.env.DEV ? 'http://127.0.0.1:5050' : ''
}

/**
 * @param {string} path - e.g. `/api/blogs`
 * @param {RequestInit & { token?: string | null, body?: object }} options
 */
export async function api(path, options = {}) {
  const { token, body, headers: hdrs, ...rest } = options
  const headers = { 'Content-Type': 'application/json', ...hdrs }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const url = `${apiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : rest.body,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    if (res.status === 502 || res.status === 503) {
      throw new Error(
        'API server is not reachable (bad gateway). Start it with: npm run dev:api or run both with: npm run dev:all'
      )
    }
    const msg =
      typeof data === 'object' && data && data.message
        ? data.message
        : typeof data === 'string'
          ? data
          : res.statusText
    throw new Error(msg || `Request failed (${res.status})`)
  }
  return data
}
