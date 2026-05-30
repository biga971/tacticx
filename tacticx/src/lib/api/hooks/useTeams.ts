import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch, qs } from '@/lib/api/client'
import type { ApiTeam } from '@/lib/api/types'

export const teamKeys = {
  all: ['teams'] as const,
  list: (format?: string) => ['teams', 'list', format ?? 'all'] as const,
  detail: (id: number) => ['teams', 'detail', id] as const,
}

export interface TeamSlotInput {
  slotIndex: number
  pokemonId: number
  nickname?: string | null
  nature: string
  ability: string
  item?: string | null
  move1?: string | null
  move2?: string | null
  move3?: string | null
  move4?: string | null
  spHp: number
  spAtk: number
  spDef: number
  spSpa: number
  spSpd: number
  spSpe: number
}

export interface TeamInput {
  name: string
  format: 'vgc' | '3v3'
  style?: string | null
  description?: string | null
  regulation?: string | null
  slots: TeamSlotInput[]
}

export function useTeams(format?: 'vgc' | '3v3') {
  return useQuery({
    queryKey: teamKeys.list(format),
    queryFn: () => apiFetch<ApiTeam[]>(`/teams${qs({ format })}`),
  })
}

export function useTeam(id: number | null) {
  return useQuery({
    queryKey: teamKeys.detail(id ?? -1),
    queryFn: () => apiFetch<ApiTeam>(`/teams/${id}`),
    enabled: id != null && id > 0,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TeamInput) => apiFetch<ApiTeam>('/teams', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  })
}

export function useUpdateTeam(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<TeamInput>) =>
      apiFetch<ApiTeam>(`/teams/${id}`, { method: 'PUT', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.all })
      qc.invalidateQueries({ queryKey: teamKeys.detail(id) })
    },
  })
}

export function useDeleteTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/teams/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  })
}

export function usePublishTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch<ApiTeam>(`/teams/${id}/publish`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
  })
}
