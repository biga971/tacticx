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

const PERKS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'cloud-upload-outline', label: 'Publie tes équipes dans la communauté' },
  { icon: 'chatbubbles-outline', label: 'Commente et échange avec les joueurs' },
  { icon: 'trending-up-outline', label: 'Historique méta et stats avancées' },
  { icon: 'infinite-outline', label: 'Objectifs et analyses illimités' },
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
        plan === 'annual'
          ? p.packageType === 'ANNUAL'
          : p.packageType === 'MONTHLY'
      )
      if (!pkg) {
        toast.show('Abonnements indisponibles (clés RevenueCat manquantes)', 'error')
        return
      }
      const ok = await purchasePackage(pkg)
      if (ok) {
        setPremium(true)
        toast.show('Bienvenue dans Premium !', 'success')
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
          <Ionicons name={featureIcon ?? 'star-outline'} size={28} color={colors.accent} />
        </View>
        <Text variant="h2" center>
          {featureName ? `Débloque ${featureName}` : 'Passe à Tacticx Premium'}
        </Text>
        <Text variant="body" color="fg3" center>
          Tout l'arsenal compétitif, sans limite.
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
        {plan === 'annual' && <Badge label="-37%" bg={colors.successSoft} fg={colors.success} />}
      </View>

      <Button
        label="Commencer"
        size="lg"
        fullWidth
        loading={loading}
        onPress={buy}
        style={{ marginTop: spacing.base }}
      />
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
