import { ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { useProfileStore } from '@/lib/store/profileStore'
import { useUpdateProfile } from '@/lib/api/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'
import { colors, radii, spacing } from '@/lib/theme'

const LABELS: Record<string, string> = {
  casual: 'Casual',
  competitive: 'Compétitif',
  tryhard: 'Tryhard',
  vgc: 'VGC (Doubles)',
  '3v3': 'Singles 3v3',
  both: 'Les deux',
  offense: 'Offensif',
  control: 'Contrôle',
  balance: 'Équilibré',
  learn: 'Apprendre',
  rankup: 'Monter en rang',
  tournament: 'Tournois',
}

export default function ResultScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const profile = useProfileStore()
  const token = useAuthStore((s) => s.token)
  const updateProfile = useUpdateProfile()

  const rows = [
    { icon: 'ribbon-outline' as const, label: 'Niveau', value: profile.level },
    { icon: 'people-outline' as const, label: 'Format', value: profile.format },
    { icon: 'flash-outline' as const, label: 'Style', value: profile.style },
    { icon: 'flag-outline' as const, label: 'Objectif', value: profile.objective },
  ]

  const start = () => {
    profile.completeOnboarding()
    if (token && profile.level && profile.format && profile.style && profile.objective) {
      updateProfile.mutate({
        level: profile.level,
        format: profile.format,
        style: profile.style,
        objective: profile.objective,
      })
    }
    router.replace('/(tabs)/meta')
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.header}>
        <Text variant="eyebrow" color="accent">
          Profil prêt
        </Text>
        <Text variant="h1">Ton profil Tacticx</Text>
        <Text variant="body" color="fg3">
          On adapte la méta et les recommandations à tes choix.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {rows.map((r, i) => (
          <Animated.View
            key={r.label}
            entering={FadeInDown.delay(i * 80).springify()}
            style={styles.row}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={r.icon} size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="fg3">
                {r.label}
              </Text>
              <Text variant="title">{r.value ? LABELS[r.value] ?? r.value : '—'}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.base }]}>
        <Button label="Commencer" icon="arrow-forward" iconRight fullWidth size="lg" onPress={start} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.base },
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingTop: spacing.md },
})
