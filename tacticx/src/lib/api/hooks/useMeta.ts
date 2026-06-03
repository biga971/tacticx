import { useQuery } from '@tanstack/react-query'
import { apiFetch, qs } from '@/lib/api/client'
import type { ApiMetaResponse, ApiMetaDetailResponse } from '@/lib/api/types'
import type { Format } from '@/lib/store/formatStore'

export const metaKeys = {
  all: ['meta'] as const,
  list: (format: string, sort: string) => ['meta', format, sort] as const,
  detail: (format: string, name: string) => ['meta', 'detail', format, name] as const,
}

/** Meta usage/winrate rankings from meta_cache, enriched with Pokémon data. */
export function useMeta(format: Format, sort: 'usage' | 'winrate') {
  return useQuery({
    queryKey: metaKeys.list(format, sort),
    queryFn: () => apiFetch<ApiMetaResponse>(`/meta${qs({ format, sort })}`),
  })
}

/** Single Pokémon competitive meta detail (moves/items/abilities/teammates/spreads). */
export function useMetaDetail(format: Format, name: string | null) {
  return useQuery({
    queryKey: metaKeys.detail(format, name ?? ''),
    queryFn: () =>
      apiFetch<ApiMetaDetailResponse>(`/meta/${encodeURIComponent(name!)}${qs({ format })}`),
    enabled: !!name,
  })
}
