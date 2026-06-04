import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/authStore'
import type { ApiProfile } from '@/lib/api/types'

interface AuthResponse {
  token: { type: string; token: string }
  id: number
  email: string
  fullName: string | null
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input, public: true }),
    onSuccess: (data) => setAuth(data.token.token, String(data.id), false),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; fullName: string }) =>
      apiFetch<unknown>('/auth/register', { method: 'POST', body: input, public: true }),
  })
}

/**
 * Promotes the current guest session into a full account in place, keeping the
 * same user id and all data created as a guest. Reuses the existing guest token.
 */
export function useUpgradeAccount() {
  const qc = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)
  return useMutation({
    mutationFn: (input: { email: string; password: string; fullName: string }) =>
      apiFetch<{ id: number }>('/auth/upgrade', { method: 'POST', body: input }),
    onSuccess: (data) => {
      if (token) setAuth(token, String(data.id), false)
      qc.invalidateQueries()
    },
  })
}

/** Requests a password-reset email. Never reveals whether the email exists. */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: { email: string }) =>
      apiFetch<{ message: string }>('/user/forgot-password', {
        method: 'POST',
        body: input,
        public: true,
      }),
  })
}

interface SocialInput {
  /** Apple identityToken or Google idToken (JWT). */
  token: string
  /** Display name, only available from Apple on first sign-in. */
  fullName?: string
}

/**
 * Exchanges a native SSO token (Apple/Google) for a Tacticx access token.
 * The server verifies the JWT against the provider JWKS, then finds or creates
 * the matching account.
 */
export function useSocialSignIn(provider: 'apple' | 'google') {
  const qc = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (input: SocialInput) =>
      apiFetch<AuthResponse>(`/auth/${provider}`, { method: 'POST', body: input, public: true }),
    onSuccess: (data) => {
      setAuth(data.token.token, String(data.id), false)
      qc.invalidateQueries()
    },
  })
}

export function useProfile() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch<ApiProfile | null>('/profile'),
    enabled: !!token,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Pick<ApiProfile, 'level' | 'format' | 'style' | 'objective'>) =>
      apiFetch<ApiProfile>('/profile', { method: 'PUT', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}
