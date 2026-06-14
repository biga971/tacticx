import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch, qs } from '@/lib/api/client'
import type { ApiTeam, ApiComment, Paginated, CommunityFilters } from '@/lib/api/types'

export const communityKeys = {
  all: ['community'] as const,
  feed: (f: CommunityFilters) => ['community', 'feed', f] as const,
  detail: (id: number) => ['community', 'detail', id] as const,
  comments: (id: number) => ['community', 'comments', id] as const,
}

function feedQs(filters: CommunityFilters, page: number) {
  return qs({
    format: filters.format,
    style: filters.style,
    regulation: filters.regulation,
    pokemonIds: filters.pokemonIds?.length ? filters.pokemonIds.join(',') : undefined,
    sort: filters.sort,
    page,
    limit: filters.limit ?? 20,
  })
}

export function useCommunityFeed(filters: CommunityFilters = {}) {
  return useInfiniteQuery({
    queryKey: communityKeys.feed(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiFetch<Paginated<ApiTeam>>(`/community${feedQs(filters, pageParam)}`),
    getNextPageParam: (last) =>
      last.meta.currentPage < last.meta.lastPage ? last.meta.currentPage + 1 : undefined,
  })
}

export function useCommunityTeam(id: number | null) {
  return useQuery({
    queryKey: communityKeys.detail(id ?? -1),
    queryFn: () => apiFetch<ApiTeam>(`/community/${id}`),
    enabled: id != null && id > 0,
  })
}

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ liked: boolean; likesCount: number }>(`/community/${id}/like`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: communityKeys.detail(id) })
      qc.invalidateQueries({ queryKey: communityKeys.all })
    },
  })
}

export function useComments(teamId: number | null) {
  return useQuery({
    queryKey: communityKeys.comments(teamId ?? -1),
    queryFn: () => apiFetch<Paginated<ApiComment>>(`/community/${teamId}/comments`),
    enabled: teamId != null && teamId > 0,
  })
}

export function useAddComment(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch<ApiComment>(`/community/${teamId}/comments`, { method: 'POST', body: { content } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: communityKeys.comments(teamId) }),
  })
}

export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'other'

/** Flags a comment as inappropriate. Idempotent server-side. */
export function useReportComment() {
  return useMutation({
    mutationFn: (input: { commentId: number; reason: ReportReason }) =>
      apiFetch<{ reported: boolean }>(`/comments/${input.commentId}/report`, {
        method: 'POST',
        body: { reason: input.reason },
      }),
  })
}

/** Blocks a user so their comments stop showing for the current viewer. */
export function useBlockUser(teamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<{ blocked: boolean }>(`/users/${userId}/block`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: communityKeys.comments(teamId) }),
  })
}
