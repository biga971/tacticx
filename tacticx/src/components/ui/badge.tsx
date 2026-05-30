import { StyleSheet, View, type ViewStyle } from 'react-native'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing, fontSize } from '@/lib/theme'

export type BadgeSize = 'xs' | 'sm' | 'md'

export interface BadgeProps {
  label: string
  /** background color (defaults to a neutral surface) */
  bg?: string
  /** text color */
  fg?: string
  size?: BadgeSize
  uppercase?: boolean
  style?: ViewStyle
}

const PADDING: Record<BadgeSize, { h: number; v: number; fs: number }> = {
  xs: { h: spacing.sm, v: 2, fs: fontSize.xs },
  sm: { h: spacing.sm, v: spacing.xs, fs: fontSize.xs },
  md: { h: spacing.md, v: spacing.xs + 1, fs: fontSize.sm },
}

/** Pill label for status / type / tier indicators. */
export function Badge({ label, bg, fg, size = 'sm', uppercase, style }: BadgeProps) {
  const p = PADDING[size]
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg ?? colors.surfaceHigh, paddingHorizontal: p.h, paddingVertical: p.v },
        style,
      ]}
    >
      <Text
        weight="semibold"
        style={{
          color: fg ?? colors.fg2,
          fontSize: p.fs,
          textTransform: uppercase ? 'uppercase' : 'none',
        }}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
  },
})
