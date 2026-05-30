import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ApiSubscriptionStatus } from '@/lib/api/types'
import { useAuthStore } from '@/lib/store/authStore'

export const subscriptionKeys = {
  status: ['subscription', 'status'] as const,
}

export function useSubscriptionStatus() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: subscriptionKeys.status,
    queryFn: () => apiFetch<ApiSubscriptionStatus>('/subscription/status'),
    enabled: !!token,
  })
}
