import { useEffect } from 'react'
import { StyleSheet, View, type ViewStyle, type DimensionValue } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { colors, radii } from '@/lib/theme'

export interface ShimmerProps {
  width?: DimensionValue
  height?: number
  radius?: number
  style?: ViewStyle
}

/** Skeleton placeholder with a sweeping highlight. Use for all loading states. */
export function Shimmer({ width = '100%', height = 16, radius = radii.sm, style }: ShimmerProps) {
  const p = useSharedValue(0)
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, false)
  }, [p])

  const sweep = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.5, 1], [0.35, 0.7, 0.35]),
    transform: [{ translateX: interpolate(p.value, [0, 1], [-60, 60]) }],
  }))

  return (
    <View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.surfaceHigh },
        styles.base,
        style,
      ]}
    >
      <Animated.View style={[styles.highlight, { backgroundColor: colors.surfaceSunken }, sweep]} />
    </View>
  )
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  highlight: { ...StyleSheet.absoluteFillObject, width: 60 },
})
