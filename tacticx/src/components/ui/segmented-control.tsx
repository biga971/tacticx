import { useState } from 'react'
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing, TOUCH_TARGET } from '@/lib/theme'

export interface SegmentOption<T extends string> {
  label: string
  value: T
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  haptic?: boolean
}

/** iOS-style animated segmented control. Sliding thumb on the UI thread. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  haptic = true,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0)
  const segWidth = trackWidth > 0 ? trackWidth / options.length : 0
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  )
  const tx = useSharedValue(0)

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - PAD * 2
    setTrackWidth(w)
    tx.value = (w / options.length) * index
  }

  const thumbStyle = useAnimatedStyle(() => ({
    width: segWidth,
    transform: [{ translateX: tx.value }],
  }))

  const select = (opt: SegmentOption<T>, i: number) => {
    if (opt.value === value) return
    if (haptic) Haptics.selectionAsync()
    tx.value = withTiming(segWidth * i, { duration: 220, easing: Easing.out(Easing.cubic) })
    onChange(opt.value)
  }

  return (
    <View style={styles.track} onLayout={onLayout}>
      {segWidth > 0 && <Animated.View style={[styles.thumb, thumbStyle]} />}
      {options.map((opt, i) => {
        const active = opt.value === value
        return (
          <Pressable
            key={opt.value}
            style={styles.segment}
            onPress={() => select(opt, i)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text variant="caption" weight="semibold" color={active ? 'fg1' : 'fg3'}>
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const PAD = 3

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    padding: PAD,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    bottom: PAD,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  segment: {
    flex: 1,
    minHeight: TOUCH_TARGET - spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
})
