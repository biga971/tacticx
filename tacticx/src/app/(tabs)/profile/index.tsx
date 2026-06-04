import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { RollingCounter } from '@/components/ui/rolling-counter'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PaywallSheet } from '@/components/paywall/PaywallSheet'
import { useFormatStore, type Format } from '@/lib/store/formatStore'
import { useProfileStore } from '@/lib/store/profileStore'
import { useAuthStore } from '@/lib/store/authStore'
import { ensureGuestSession } from '@/lib/store/ensureSession'
import { restorePurchases } from '@/lib/revenuecat'
import { useToast } from '@/components/ui/toast'
import { queryClient } from '@/lib/api/queryClient'
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
  // A guest has no real account yet (anonymous token or none at all).
  const isGuest = useAuthStore((s) => s.isGuest)
  const token = useAuthStore((s) => s.token)
  const guest = isGuest || !token

  return (
    <Screen padded>
      <ScreenHeader title="Profil" />
      {guest ? <GuestProfile /> : <AccountProfile />}
    </Screen>
  )
}

/* ───────────────────────── Guest (State A) ───────────────────────── */

const BENEFITS = [
  { icon: 'cloud-upload-outline' as const, label: 'Publier tes équipes', desc: 'Partage tes compos dans la communauté' },
  { icon: 'heart-outline' as const, label: 'Liker et commenter', desc: 'Interagis avec les équipes des autres joueurs' },
  { icon: 'cloud-outline' as const, label: 'Synchroniser tes données', desc: 'Équipes et objectifs sur tous tes appareils' },
  { icon: 'trending-up-outline' as const, label: 'Suivre ton rang', desc: 'Stats de saison et évolution dans le temps' },
]

function GuestProfile() {
  const router = useRouter()
  const { format } = useFormatStore()

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
      <View style={styles.hero}>
        <View style={styles.heroWash} />
        <View style={styles.guestAv}>
          <Ionicons name="person-outline" size={28} color={colors.fg3} />
        </View>
        <Text variant="eyebrow" color="accent" center>
          Compte
        </Text>
        <Text variant="h2" center style={{ marginTop: spacing.xs }}>
          Rejoins la communauté
        </Text>
        <Text variant="body" color="fg2" center style={styles.heroSub}>
          Publie tes équipes, compare-les et échange avec les autres joueurs. C'est gratuit.
        </Text>
        <Button label="Créer un compte" fullWidth size="lg" onPress={() => router.push('/(auth)/sign-up')} />
        <Pressable onPress={() => router.push('/(auth)/sign-in')} style={styles.heroSwap}>
          <Text variant="caption" color="fg2" center>
            Tu as déjà un compte ?{' '}
            <Text variant="caption" color="accent" weight="semibold">
              Se connecter
            </Text>
          </Text>
        </Pressable>
      </View>

      <Text variant="eyebrow" color="fg3" style={styles.sectionLabel}>
        Avec un compte
      </Text>
      <View style={styles.card}>
        {BENEFITS.map((b, i) => (
          <View key={b.label} style={[styles.benRow, i < BENEFITS.length - 1 && styles.benBorder]}>
            <View style={styles.benIco}>
              <Ionicons name={b.icon} size={16} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMd" weight="medium">
                {b.label}
              </Text>
              <Text variant="caption" color="fg3">
                {b.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text variant="eyebrow" color="fg3" style={styles.sectionLabel}>
        Ton profil
      </Text>
      <View style={styles.lockedCard}>
        <View style={styles.lockedHead}>
          <Text variant="title">Gold III</Text>
        </View>
        <Progress value={0.62} height={8} />
        <View style={styles.lockedStats}>
          <LockedStat v="142" l="Victoires" />
          <LockedStat v="87" l="Défaites" />
          <LockedStat v="62 %" l="Winrate" />
        </View>
        <BlurView intensity={24} tint="dark" style={styles.lockVeil}>
          <Ionicons name="lock-closed" size={18} color={colors.fg2} />
          <Text variant="caption" color="fg1" weight="semibold">
            Connecte-toi pour voir tes stats
          </Text>
          <Text variant="caption" color="fg3">
            Rang · winrate · Pokémon joués
          </Text>
        </BlurView>
      </View>

      <Text variant="eyebrow" color="fg3" style={styles.sectionLabel}>
        Réglages
      </Text>
      <View style={styles.card}>
        <SettingRow icon="git-branch-outline" label="Format par défaut" value={LABELS[format] ?? format} />
        <SettingRow icon="language-outline" label="Langue" value="Français" />
        <SettingRow icon="moon-outline" label="Apparence" value="Sombre" last />
      </View>

      <View style={styles.card}>
        <SettingRow icon="help-buoy-outline" label="Aide & support" />
        <SettingRow icon="shield-outline" label="Confidentialité" />
        <SettingRow icon="document-text-outline" label="Conditions d'utilisation" last />
      </View>

      <Legal />
    </ScrollView>
  )
}

function LockedStat({ v, l }: { v: string; l: string }) {
  return (
    <View style={styles.lockedStat}>
      <Text variant="title">{v}</Text>
      <Text variant="caption" color="fg3">
        {l}
      </Text>
    </View>
  )
}

function SettingRow({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value?: string
  last?: boolean
}) {
  return (
    <View style={[styles.prow, !last && styles.benBorder]}>
      <View style={styles.prowIco}>
        <Ionicons name={icon} size={15} color={colors.fg2} />
      </View>
      <Text variant="body" color="fg2" style={{ flex: 1 }}>
        {label}
      </Text>
      {value ? (
        <Text variant="caption" color="fg3" weight="medium">
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={colors.fgFaint} />
    </View>
  )
}

/* ──────────────────────── Account (logged in) ──────────────────────── */

function AccountProfile() {
  const { format, setFormat } = useFormatStore()
  const profile = useProfileStore()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const toast = useToast()
  const [paywall, setPaywall] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

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

  const logout = async () => {
    setConfirmLogout(false)
    clearAuth()
    queryClient.clear()
    // Re-mint an anonymous guest so the app keeps working offline of an account.
    await ensureGuestSession().catch(() => {})
    toast.show('Déconnecté', 'info')
  }

  return (
    <>
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
              <Badge label="VIP" bg={colors.accentSoft} fg={colors.accent} size="sm" />
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
                Tacticx VIP actif — sans publicité
              </Text>
            </View>
          ) : (
            <Button label="Passer VIP — sans pub" icon="diamond-outline" fullWidth onPress={() => setPaywall(true)} />
          )}
          <Button label="Restaurer les achats" variant="ghost" fullWidth onPress={restore} />
        </View>

        <Button label="Se déconnecter" variant="ghost" icon="log-out-outline" fullWidth onPress={() => setConfirmLogout(true)} />

        <Legal />
      </ScrollView>

      <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} />
      <ConfirmDialog
        visible={confirmLogout}
        title="Se déconnecter ?"
        message="Tu repasseras en mode invité. Tes données restent liées à ton compte."
        confirmLabel="Se déconnecter"
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
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

function Legal() {
  return (
    <View style={styles.legal}>
      <Text variant="caption" color="fgFaint" center>
        Pokémon © Nintendo/Creatures Inc./GAME FREAK inc.
      </Text>
      <Text variant="caption" color="fgFaint" center>
        Tacticx n'est pas affilié à Nintendo ou The Pokémon Company.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  /* guest */
  hero: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  heroWash: {
    position: 'absolute',
    top: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accentSoft,
    opacity: 0.5,
  },
  guestAv: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  heroSub: { maxWidth: 280, marginVertical: spacing.md },
  heroSwap: { paddingTop: spacing.md },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
  },
  benRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  benBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  benIco: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCard: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.md,
  },
  lockedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lockedStats: { flexDirection: 'row', gap: spacing.sm },
  lockedStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
  },
  lockVeil: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  prow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  prowIco: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* account */
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
