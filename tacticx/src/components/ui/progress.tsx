import { useEffect } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { colors, radii } from '@/lib/theme'

export interface ProgressProps {
  /** 0..1 fill ratio (ignored when `segments` is set). */
  value: number
  /** Render N discrete segments; `value` then = number of filled segments. */
  segments?: number
  color?: string
  trackColor?: string
  height?: number
  style?: ViewStyle
}

/** Linear progress bar. Supports a single animated fill or discrete segments. */
export function Progress({
  value,
  segments,
  color = colors.accent,
  trackColor = colors.surfaceSunken,
  height = 6,
  style,
}: ProgressProps) {
  if (segments && segments > 0) {
    return (
      <View style={[styles.segRow, style]}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.seg,
              { height, borderRadius: radii.pill, backgroundColor: i < value ? color : trackColor },
            ]}
          />
        ))}
      </View>
    )
  }

  return <Bar value={value} color={color} trackColor={trackColor} height={height} style={style} />
}

function Bar({
  value,
  color,
  trackColor,
  height,
  style,
}: Required<Pick<ProgressProps, 'value' | 'color' | 'trackColor' | 'height'>> & {
  style?: ViewStyle
}) {
  const w = useSharedValue(0)
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, value)), {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  }, [value, w])

  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }))

  return (
    <View
      style={[{ height, borderRadius: radii.pill, backgroundColor: trackColor }, styles.track, style]}
    >
      <Animated.View style={[{ height, borderRadius: radii.pill, backgroundColor: color }, fill]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
  segRow: { flexDirection: 'row', gap: 4, width: '100%' },
  seg: { flex: 1 },
})
