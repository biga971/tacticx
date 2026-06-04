import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

/** Auth flow (sign-in / sign-up / reset). Presented as a modal from the root. */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    />
  )
}
