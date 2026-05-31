import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'

/** zustand persist adapter backed by expo-secure-store. */
const secureStorage: StateStorage = {
  getItem: (name) => SecureStore.getItemAsync(name),
  setItem: (name, value) => SecureStore.setItemAsync(name, value),
  removeItem: (name) => SecureStore.deleteItemAsync(name),
}

interface AuthState {
  token: string | null
  userId: string | null
  /** True when the session is an anonymous guest (no real account yet). */
  isGuest: boolean
  hydrated: boolean
  setAuth: (token: string, userId: string, isGuest?: boolean) => void
  clearAuth: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      isGuest: false,
      hydrated: false,
      setAuth: (token, userId, isGuest = false) => set({ token, userId, isGuest }),
      clearAuth: () => set({ token: null, userId: null, isGuest: false }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'tacticx-auth',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
)

/** Non-reactive token read for the API client. */
export const getAuthToken = () => useAuthStore.getState().token
