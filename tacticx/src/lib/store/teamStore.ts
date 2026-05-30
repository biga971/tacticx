import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface TeamSlot {
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

export interface Team {
  id: string // local id (server id once synced)
  serverId?: number | null
  name: string
  format: 'vgc' | '3v3'
  style?: string | null
  description?: string | null
  regulation?: string | null
  isPublic?: boolean
  slots: (TeamSlot | null)[]
}

interface TeamState {
  teams: Team[]
  activeTeamId: string | null
  addTeam: (team: Team) => void
  updateTeam: (id: string, patch: Partial<Team>) => void
  deleteTeam: (id: string) => void
  setActiveTeam: (id: string | null) => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      teams: [],
      activeTeamId: null,
      addTeam: (team) => set((s) => ({ teams: [...s.teams, team], activeTeamId: team.id })),
      updateTeam: (id, patch) =>
        set((s) => ({
          teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTeam: (id) =>
        set((s) => ({
          teams: s.teams.filter((t) => t.id !== id),
          activeTeamId: s.activeTeamId === id ? null : s.activeTeamId,
        })),
      setActiveTeam: (id) => set({ activeTeamId: id }),
    }),
    {
      name: 'tacticx-teams',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
