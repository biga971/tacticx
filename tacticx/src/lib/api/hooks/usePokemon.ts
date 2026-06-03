import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { apiFetch, qs } from '@/lib/api/client'
import type {
  ApiPokemon,
  ApiPokemonDetail,
  Paginated,
  PokemonFilters,
} from '@/lib/api/types'

export const pokemonKeys = {
  all: ['pokemon'] as const,
  list: (f: PokemonFilters) => ['pokemon', 'list', f] as const,
  detail: (id: number | string) => ['pokemon', 'detail', id] as const,
}

/** Single-page list. Use usePokemonInfinite for the Pokédex FlashList. */
export function usePokemonList(filters: PokemonFilters = {}) {
  return useQuery({
    queryKey: pokemonKeys.list(filters),
    queryFn: () =>
      apiFetch<Paginated<ApiPokemon>>(
        `/pokemon${qs({
          type: filters.type,
          inRegMa: filters.inRegMa,
          search: filters.search,
          page: filters.page ?? 1,
          limit: filters.limit ?? 30,
        })}`
      ),
  })
}

/** Infinite paginated list for long scrollable Pokédex. */
export function usePokemonInfinite(filters: Omit<PokemonFilters, 'page'> = {}, enabled = true) {
  return useInfiniteQuery({
    enabled,
    queryKey: pokemonKeys.list(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiFetch<Paginated<ApiPokemon>>(
        `/pokemon${qs({
          type: filters.type,
          inRegMa: filters.inRegMa,
          search: filters.search,
          page: pageParam,
          limit: filters.limit ?? 30,
        })}`
      ),
    getNextPageParam: (last) =>
      last.meta.currentPage < last.meta.lastPage ? last.meta.currentPage + 1 : undefined,
  })
}

export function usePokemon(id: number | string | null) {
  return useQuery({
    queryKey: pokemonKeys.detail(id ?? -1),
    queryFn: () => apiFetch<ApiPokemonDetail>(`/pokemon/${id}`),
    enabled: id != null && (typeof id === 'string' || id > 0),
  })
}
