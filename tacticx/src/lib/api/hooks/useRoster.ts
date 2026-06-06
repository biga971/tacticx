import { useEffect, useMemo } from 'react'
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

/**
 * Eagerly loads the ENTIRE roster (every page, 100/page) into one flat array.
 * Used by the speed-comparison view, which needs all mons at once to rank them.
 * `loading` stays true until the last page lands.
 */
export function useRosterAll(enabled = true) {
  const query = useInfiniteQuery({
    enabled,
    queryKey: ['roster', 'all'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiFetch<Paginated<ApiRosterPokemon>>(`/roster${qs({ page: pageParam, limit: 100 })}`),
    getNextPageParam: (last) =>
      last.meta.currentPage < last.meta.lastPage ? last.meta.currentPage + 1 : undefined,
  })

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query

  useEffect(() => {
    if (enabled && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [enabled, hasNextPage, isFetchingNextPage, fetchNextPage])

  const all = useMemo(() => query.data?.pages.flatMap((p) => p.data) ?? [], [query.data])

  return { all, loading: query.isLoading || hasNextPage, isError: query.isError }
}
