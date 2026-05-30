import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Level = 'casual' | 'competitive' | 'tryhard'
export type ProfileFormat = 'vgc' | '3v3' | 'both'
export type Style = 'offense' | 'control' | 'balance'
export type Objective = 'learn' | 'rankup' | 'tournament'

interface ProfileState {
  level: Level | null
  format: ProfileFormat | null
  style: Style | null
  objective: Objective | null
  hasCompletedOnboarding: boolean
  isPremium: boolean
  setProfile: (p: Partial<Pick<ProfileState, 'level' | 'format' | 'style' | 'objective'>>) => void
  completeOnboarding: () => void
  setPremium: (isPremium: boolean) => void
  reset: () => void
}

const initial = {
  level: null,
  format: null,
  style: null,
  objective: null,
  hasCompletedOnboarding: false,
  isPremium: false,
} as const

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...initial,
      setProfile: (p) => set((s) => ({ ...s, ...p })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setPremium: (isPremium) => set({ isPremium }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'tacticx-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
