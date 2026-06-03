import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

export default function MetaStack() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
    >
      <Stack.Screen name="index" options={{ title: 'Méta' }} />
      <Stack.Screen name="[name]" options={{ title: 'Détail méta' }} />
    </Stack>
  )
}
