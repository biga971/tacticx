import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ApiItem } from '@/lib/api/types'

export const itemKeys = {
  all: ['items'] as const,
}

/** Full competitive item list (cached long — rarely changes). */
export function useItems() {
  return useQuery({
    queryKey: itemKeys.all,
    queryFn: () => apiFetch<ApiItem[]>('/items'),
    staleTime: 1000 * 60 * 60, // 1h
  })
}
