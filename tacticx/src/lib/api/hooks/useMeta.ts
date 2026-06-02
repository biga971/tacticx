import { useQuery } from '@tanstack/react-query'
import { apiFetch, qs } from '@/lib/api/client'
import type { ApiMetaResponse } from '@/lib/api/types'
import type { Format } from '@/lib/store/formatStore'

export const metaKeys = {
  all: ['meta'] as const,
  list: (format: string, sort: string) => ['meta', format, sort] as const,
}

/** Meta usage/winrate rankings from meta_cache, enriched with Pokémon data. */
export function useMeta(format: Format, sort: 'usage' | 'winrate') {
  return useQuery({
    queryKey: metaKeys.list(format, sort),
    queryFn: () => apiFetch<ApiMetaResponse>(`/meta${qs({ format, sort })}`),
  })
}
