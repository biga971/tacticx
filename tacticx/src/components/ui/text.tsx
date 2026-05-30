import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native'
import { colors, fontSize, fontWeight, fontFamily, letterSpacing } from '@/lib/theme'

type Variant = 'eyebrow' | 'caption' | 'body' | 'bodyMd' | 'title' | 'h3' | 'h2' | 'h1' | 'stat'
type ColorKey = keyof typeof colors
type WeightKey = keyof typeof fontWeight

export interface TextProps extends RNTextProps {
  variant?: Variant
  color?: ColorKey
  weight?: WeightKey
  mono?: boolean
  center?: boolean
}

const VARIANT: Record<Variant, object> = {
  eyebrow: {
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wider,
    textTransform: 'uppercase',
  },
  caption: { fontSize: fontSize.sm },
  body: { fontSize: fontSize.base },
  bodyMd: { fontSize: fontSize.md },
  title: { fontSize: fontSize.lg },
  h3: { fontSize: fontSize.xl, letterSpacing: letterSpacing.tight },
  h2: { fontSize: fontSize['2xl'], letterSpacing: letterSpacing.tight },
  h1: { fontSize: fontSize['3xl'], letterSpacing: letterSpacing.tight },
  stat: { fontSize: fontSize.xl, fontVariant: ['tabular-nums'] },
}

const DEFAULT_COLOR: Record<Variant, ColorKey> = {
  eyebrow: 'fg3',
  caption: 'fg3',
  body: 'fg2',
  bodyMd: 'fg1',
  title: 'fg1',
  h3: 'fg1',
  h2: 'fg1',
  h1: 'fg1',
  stat: 'fg1',
}

const DEFAULT_WEIGHT: Record<Variant, WeightKey> = {
  eyebrow: 'semibold',
  caption: 'regular',
  body: 'regular',
  bodyMd: 'regular',
  title: 'semibold',
  h3: 'semibold',
  h2: 'semibold',
  h1: 'bold',
  stat: 'semibold',
}

/** Themed text. All app text should go through this. Resolves Inter family by weight. */
export function Text({ variant = 'body', color, weight, mono, center, style, ...rest }: TextProps) {
  const effectiveWeight = weight ?? DEFAULT_WEIGHT[variant]
  return (
    <RNText
      style={[
        VARIANT[variant],
        { color: colors[color ?? DEFAULT_COLOR[variant]] },
        mono ? styles.mono : { fontFamily: fontFamily(effectiveWeight), fontWeight: fontWeight[effectiveWeight] },
        center ? styles.center : null,
        style,
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  mono: { fontVariant: ['tabular-nums'], fontWeight: '600' },
  center: { textAlign: 'center' },
})
