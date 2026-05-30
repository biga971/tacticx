import { type ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { colors, spacing } from '@/lib/theme'

export interface ScreenProps {
  children: ReactNode
  edges?: Edge[]
  padded?: boolean
  style?: ViewStyle
}

/** Root screen wrapper: dark bg + safe-area insets. */
export function Screen({ children, edges = ['top'], padded, style }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.root, padded && styles.padded, style]}>
      {children}
    </SafeAreaView>
  )
}

export interface ScreenHeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text variant="h2">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="fg3">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  padded: { paddingHorizontal: spacing.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
})
