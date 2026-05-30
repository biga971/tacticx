import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { ThemeProvider, type Theme } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/api/queryClient'
import { ToastProvider } from '@/components/ui/toast'
import { initRevenueCat } from '@/lib/revenuecat'
import { useAppFonts } from '@/lib/useAppFonts'
import { colors, fontWeight } from '@/lib/theme'

SplashScreen.preventAutoHideAsync().catch(() => {})

/** Dark-only navigation theme mapped onto our tokens. */
const navTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.accent,
    background: colors.bg,
    card: colors.surface,
    text: colors.fg1,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: fontWeight.regular },
    medium: { fontFamily: 'System', fontWeight: fontWeight.medium },
    bold: { fontFamily: 'System', fontWeight: fontWeight.semibold },
    heavy: { fontFamily: 'System', fontWeight: fontWeight.bold },
  } as Theme['fonts'],
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts()

  useEffect(() => {
    initRevenueCat()
  }, [])

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navTheme}>
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
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
