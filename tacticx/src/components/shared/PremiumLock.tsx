import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { PaywallSheet } from '@/components/paywall/PaywallSheet'
import { useProfileStore } from '@/lib/store/profileStore'
import { colors, radii, spacing } from '@/lib/theme'

export interface PremiumLockProps {
  children: ReactNode
  featureName?: string
  featureIcon?: keyof typeof Ionicons.glyphMap
  /** intensity of the blur over locked content */
  intensity?: number
}

/**
 * Premium gate: content stays visible but blurred with a lock when not premium.
 * Tap opens the contextual paywall. Never hides the underlying feature.
 */
export function PremiumLock({ children, featureName, featureIcon, intensity = 24 }: PremiumLockProps) {
  const isPremium = useProfileStore((s) => s.isPremium)
  const [paywall, setPaywall] = useState(false)

  if (isPremium) return <>{children}</>

  return (
    <View style={styles.wrap}>
      <View style={styles.content} pointerEvents="none">
        {children}
      </View>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <Pressable style={styles.overlay} onPress={() => setPaywall(true)}>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.fg1} />
        </View>
        <Text variant="caption" weight="semibold" color="fg1">
          Premium
        </Text>
      </Pressable>

      <PaywallSheet
        visible={paywall}
        onClose={() => setPaywall(false)}
        featureName={featureName}
        featureIcon={featureIcon}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', borderRadius: radii.lg, overflow: 'hidden' },
  content: { opacity: 0.6 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  lockBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
