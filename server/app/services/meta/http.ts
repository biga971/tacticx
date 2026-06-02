const USER_AGENT = 'Tacticx-Sync/1.0 (contact@netzil.fr)'

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Fetch a text/markdown/txt resource with the polite Tacticx User-Agent.
 * Returns null on non-2xx or network error (callers decide how to skip).
 */
export async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/plain, text/markdown, */*' } })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/** Fetch JSON with the polite UA. Returns null on failure. */
export async function fetchJson<T = unknown>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}
