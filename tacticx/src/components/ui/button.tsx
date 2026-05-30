import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing, TOUCH_TARGET } from '@/lib/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  label: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  icon?: keyof typeof Ionicons.glyphMap
  iconRight?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  haptic?: boolean
  style?: ViewStyle
}

const BG: Record<Variant, string> = {
  primary: colors.accent,
  secondary: colors.surfaceHigh,
  ghost: 'transparent',
  danger: colors.danger,
}
const FG: Record<Variant, string> = {
  primary: colors.fgInverse,
  secondary: colors.fg1,
  ghost: colors.fg2,
  danger: colors.fgInverse,
}
const HEIGHT: Record<Size, number> = { sm: 38, md: TOUCH_TARGET, lg: 52 }

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth,
  haptic = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading
  const fg = FG[variant]

  const handle = () => {
    if (isDisabled) return
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.()
  }

  return (
    <Pressable
      onPress={handle}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: BG[variant],
          height: HEIGHT[size],
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: colors.border,
        },
        fullWidth && styles.full,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon && !iconRight && <Ionicons name={icon} size={18} color={fg} />}
          <Text weight="semibold" style={{ color: fg }}>
            {label}
          </Text>
          {icon && iconRight && <Ionicons name={icon} size={18} color={fg} />}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  full: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
})
