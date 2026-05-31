import { getAuthToken, useAuthStore } from '@/lib/store/authStore'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://tacticx.fr/api/v1'

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Skip Authorization header (e.g. login/register). */
  public?: boolean
}

/**
 * Thin fetch wrapper:
 *  - prefixes the API base URL
 *  - injects the bearer token from authStore
 *  - clears auth on 401
 *  - throws ApiError on non-2xx
 */
export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, public: isPublic, headers, ...rest } = options

  console.log('apiFetch', path, options)
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(headers as Record<string, string>),
  }

  if (!isPublic) {
    const token = getAuthToken()
    console.log('token', token)
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    useAuthStore.getState().clearAuth()
    throw new ApiError('Unauthorized', 401)
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    throw new ApiError(
      (data && (data.message as string)) || `Request failed (${res.status})`,
      res.status,
      data?.code
    )
  }

  return data as T
}

/** Builds a query string from a params object (skips null/undefined). */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
}
