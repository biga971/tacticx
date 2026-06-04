import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/toast'
import { useProfileStore } from '@/lib/store/profileStore'
import { getOfferingPackages, purchasePackage } from '@/lib/revenuecat'
import { colors, radii, spacing } from '@/lib/theme'

export interface PaywallSheetProps {
  visible: boolean
  onClose: () => void
  featureName?: string
  featureIcon?: keyof typeof Ionicons.glyphMap
}

type Plan = 'monthly' | 'annual'

// Display prices — keep in sync with the App Store / Play Store products.
const PRICE: Record<Plan, string> = {
  monthly: '3,99 € / mois',
  annual: '14,99 € / an',
}

const PERKS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'ban-outline', label: 'Aucune publicité — jamais' },
  { icon: 'flash-outline', label: 'App plus rapide, sans interruption' },
  { icon: 'heart-outline', label: 'Soutiens le développement de Tacticx' },
  { icon: 'sparkles-outline', label: 'Avantages VIP à venir' },
]

export function PaywallSheet({ visible, onClose, featureName, featureIcon }: PaywallSheetProps) {
  const [plan, setPlan] = useState<Plan>('annual')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const setPremium = useProfileStore((s) => s.setPremium)

  const buy = async () => {
    setLoading(true)
    try {
      const packages = await getOfferingPackages()
      const pkg = packages.find((p) =>
        plan === 'annual' ? p.packageType === 'ANNUAL' : p.packageType === 'MONTHLY'
      )
      if (!pkg) {
        toast.show('Abonnements indisponibles (clés RevenueCat manquantes)', 'error')
        return
      }
      const ok = await purchasePackage(pkg)
      if (ok) {
        setPremium(true)
        toast.show('Bienvenue dans Tacticx VIP !', 'success')
        onClose()
      }
    } catch {
      toast.show('Achat annulé', 'info')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.85}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name={featureIcon ?? 'diamond-outline'} size={28} color={colors.accent} />
        </View>
        <Text variant="h2" center>
          {featureName ? `Débloque ${featureName}` : 'Passe à Tacticx VIP'}
        </Text>
        <Text variant="body" color="fg3" center>
          Retire la publicité et soutiens l'app.
        </Text>
      </View>

      <View style={styles.perks}>
        {PERKS.map((p) => (
          <View key={p.label} style={styles.perk}>
            <Ionicons name={p.icon} size={18} color={colors.success} />
            <Text variant="caption" color="fg2" style={{ flex: 1 }}>
              {p.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.planRow}>
        <View style={{ flex: 1 }}>
          <SegmentedControl<Plan>
            value={plan}
            onChange={setPlan}
            options={[
              { label: 'Mensuel', value: 'monthly' },
              { label: 'Annuel', value: 'annual' },
            ]}
          />
        </View>
        {plan === 'annual' && <Badge label="-69%" bg={colors.successSoft} fg={colors.success} />}
      </View>

      <Text variant="title" center style={{ marginTop: spacing.base }}>
        {PRICE[plan]}
      </Text>
      {plan === 'annual' ? (
        <Text variant="caption" color="fg3" center>
          soit 1,25 € / mois
        </Text>
      ) : null}

      <Button label="Commencer" size="lg" fullWidth loading={loading} onPress={buy} style={{ marginTop: spacing.md }} />
      <Text variant="caption" color="fgFaint" center style={{ marginTop: spacing.sm }}>
        Sans engagement. Résiliable à tout moment.
      </Text>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  perks: { gap: spacing.md, marginVertical: spacing.lg },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
})
