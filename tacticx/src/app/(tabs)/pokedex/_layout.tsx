import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

export default function PokedexStack() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
    >
      <Stack.Screen name="index" options={{ title: 'Pokédex' }} />
      <Stack.Screen name="[id]" options={{ title: 'Détail' }} />
    </Stack>
  )
}
