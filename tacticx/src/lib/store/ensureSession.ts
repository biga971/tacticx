import { apiFetch } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/authStore'

interface GuestResponse {
  token: { type: string; token: string }
  id: number
}

let inFlight: Promise<void> | null = null

/**
 * Guarantees the app has a session token. If none exists, mints an anonymous
 * guest session so protected read endpoints work without forcing signup.
 * De-duplicated: concurrent callers share one in-flight request.
 */
export async function ensureGuestSession(): Promise<void> {
  if (useAuthStore.getState().token) return
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const data = await apiFetch<GuestResponse>('/auth/guest', {
        method: 'POST',
        public: true,
      })
      useAuthStore.getState().setAuth(data.token.token, String(data.id), true)
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}
