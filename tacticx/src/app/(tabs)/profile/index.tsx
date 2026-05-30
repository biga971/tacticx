import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { RollingCounter } from '@/components/ui/rolling-counter'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { PaywallSheet } from '@/components/paywall/PaywallSheet'
import { useFormatStore, type Format } from '@/lib/store/formatStore'
import { useProfileStore } from '@/lib/store/profileStore'
import { restorePurchases } from '@/lib/revenuecat'
import { useToast } from '@/components/ui/toast'
import { colors, radii, spacing } from '@/lib/theme'

const LABELS: Record<string, string> = {
  casual: 'Casual',
  competitive: 'Compétitif',
  tryhard: 'Tryhard',
  vgc: 'VGC',
  '3v3': 'Singles',
  both: 'Les deux',
  offense: 'Offensif',
  control: 'Contrôle',
  balance: 'Équilibré',
  learn: 'Apprendre',
  rankup: 'Monter en rang',
  tournament: 'Tournois',
}

export default function ProfileScreen() {
  const { format, setFormat } = useFormatStore()
  const profile = useProfileStore()
  const toast = useToast()
  const [paywall, setPaywall] = useState(false)

  const rows = [
    { icon: 'ribbon-outline' as const, label: 'Niveau', value: profile.level },
    { icon: 'people-outline' as const, label: 'Format', value: profile.format },
    { icon: 'flash-outline' as const, label: 'Style', value: profile.style },
    { icon: 'flag-outline' as const, label: 'Objectif', value: profile.objective },
  ]

  const restore = async () => {
    const ok = await restorePurchases()
    if (ok) {
      profile.setPremium(true)
      toast.show('Achats restaurés', 'success')
    } else {
      toast.show('Aucun achat à restaurer', 'info')
    }
  }

  return (
    <Screen padded>
      <ScreenHeader title="Profil" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing['3xl'] }}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text variant="h2" color="accent">
              {(profile.level ?? 'TX').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="h3">Dresseur Tacticx</Text>
            {profile.isPremium ? (
              <Badge label="PREMIUM" bg={colors.accentSoft} fg={colors.accent} size="sm" />
            ) : (
              <Text variant="caption" color="fg3">
                Compte gratuit
              </Text>
            )}
          </View>
        </View>

        <SegmentedControl<Format>
          value={format}
          onChange={setFormat}
          options={[
            { label: 'VGC', value: 'vgc' },
            { label: 'Singles', value: '3v3' },
          ]}
        />

        <View style={styles.statsCard}>
          <Stat label="Victoires" value={0} tone={colors.success} />
          <Stat label="Défaites" value={0} tone={colors.danger} />
          <Stat label="Winrate" value={0} suffix="%" tone={colors.accent} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="eyebrow" color="fg3">
            Rang
          </Text>
          <View style={styles.rankCard}>
            <View style={styles.rankHead}>
              <Text variant="title">Débutant</Text>
              <Text variant="caption" color="fg3" mono>
                0 / 100
              </Text>
            </View>
            <Progress value={0} height={8} />
          </View>
        </View>

        <PremiumLock featureName="l'historique de rang" featureIcon="trending-up-outline">
          <View style={styles.sparkCard}>
            <Text variant="eyebrow" color="fg3">
              Progression
            </Text>
            <View style={styles.sparkline}>
              {[10, 14, 12, 20, 18, 26, 22].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h }]} />
              ))}
            </View>
          </View>
        </PremiumLock>

        <View style={{ gap: spacing.sm }}>
          <Text variant="eyebrow" color="fg3">
            Préférences
          </Text>
          {rows.map((r) => (
            <View key={r.label} style={styles.prefRow}>
              <Ionicons name={r.icon} size={18} color={colors.fg2} />
              <Text variant="body" color="fg2" style={{ flex: 1 }}>
                {r.label}
              </Text>
              <Text variant="title">{r.value ? LABELS[r.value] ?? r.value : '—'}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="eyebrow" color="fg3">
            Abonnement
          </Text>
          {profile.isPremium ? (
            <View style={styles.subCard}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text variant="body" color="fg2" style={{ flex: 1 }}>
                Tacticx Premium actif
              </Text>
            </View>
          ) : (
            <Button label="Passer à Premium" icon="star-outline" fullWidth onPress={() => setPaywall(true)} />
          )}
          <Button label="Restaurer les achats" variant="ghost" fullWidth onPress={restore} />
        </View>

        <View style={styles.legal}>
          <Text variant="caption" color="fgFaint" center>
            Pokémon © Nintendo/Creatures Inc./GAME FREAK inc.
          </Text>
          <Text variant="caption" color="fgFaint" center>
            Tacticx n'est pas affilié à Nintendo ou The Pokémon Company.
          </Text>
        </View>
      </ScrollView>

      <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} />
    </Screen>
  )
}

function Stat({ label, value, suffix, tone }: { label: string; value: number; suffix?: string; tone: string }) {
  return (
    <View style={styles.stat}>
      <RollingCounter value={value} suffix={suffix} variant="h2" style={{ color: tone }} />
      <Text variant="caption" color="fg3">
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.base,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  rankCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  rankHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sparkCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  sparkline: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 32 },
  bar: { flex: 1, backgroundColor: colors.accent, borderRadius: 2 },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.base,
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
  },
  legal: { gap: spacing.xs, marginTop: spacing.lg },
})
