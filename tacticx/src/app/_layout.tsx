import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/api/queryClient'
import { ToastProvider } from '@/components/ui/toast'
import { initRevenueCat } from '@/lib/revenuecat'
import { useAppFonts } from '@/lib/useAppFonts'
import { useAuthStore } from '@/lib/store/authStore'
import { ensureGuestSession } from '@/lib/store/ensureSession'
import { colors } from '@/lib/theme'

SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const fontsLoaded = useAppFonts()
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    initRevenueCat()
  }, [])

  // Once secure-store has rehydrated, ensure a session exists (mint a guest
  // token on first launch so the app works without an account).
  useEffect(() => {
    if (hydrated && !token) ensureGuestSession().catch(() => {})
  }, [hydrated, token])

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
