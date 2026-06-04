import { type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing } from '@/lib/theme'

/** "Tacticx" wordmark, accent on the second half. */
export function Wordmark() {
  return (
    <Text variant="title" weight="bold">
      Tac<Text variant="title" weight="bold" color="accent">ticx</Text>
    </Text>
  )
}

/** Hairline divider with centered label ("ou"). */
export function AuthDivider({ label }: { label: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text variant="caption" color="fg3" weight="medium">
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  )
}

/** Required legal microcopy under the auth CTAs. */
export function LegalMicro() {
  return (
    <Text variant="caption" color="fgFaint" center style={styles.legal}>
      En continuant, tu acceptes les conditions d'utilisation et la politique de confidentialité.
    </Text>
  )
}

export interface AuthShellProps {
  /** "close" → X (dismiss to app), "back" → chevron-left. */
  variant?: 'close' | 'back'
  onDismiss: () => void
  children: ReactNode
}

/** Modal auth chrome: top bar with close/back + wordmark, scrollable body. */
export function AuthShell({ variant = 'close', onDismiss, children }: AuthShellProps) {
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Pressable onPress={onDismiss} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name={variant === 'close' ? 'close' : 'chevron-back'} size={18} color={colors.fg2} />
        </Pressable>
        <Wordmark />
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.base },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  legal: { marginTop: spacing.base, maxWidth: 300, alignSelf: 'center' },
})
