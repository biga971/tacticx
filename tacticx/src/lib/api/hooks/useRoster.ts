import { useInfiniteQuery } from '@tanstack/react-query'
import { apiFetch, qs } from '@/lib/api/client'
import type { ApiRosterPokemon, Paginated } from '@/lib/api/types'

interface RosterFilters {
  type?: string
  search?: string
  limit?: number
}

/** Infinite Champions roster list (pokemon_roster), shaped like the Pokédex. */
export function useRosterInfinite(filters: RosterFilters = {}, enabled = true) {
  return useInfiniteQuery({
    enabled,
    queryKey: ['roster', filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiFetch<Paginated<ApiRosterPokemon>>(
        `/roster${qs({
          type: filters.type,
          search: filters.search,
          page: pageParam,
          limit: filters.limit ?? 30,
        })}`
      ),
    getNextPageParam: (last) =>
      last.meta.currentPage < last.meta.lastPage ? last.meta.currentPage + 1 : undefined,
  })
}
