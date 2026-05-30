import { useState } from 'react'
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { colors, radii, TOUCH_TARGET } from '@/lib/theme'

export interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  color?: string
  disabled?: boolean
}

const THUMB = 22

/** Gesture-driven stepped slider with haptic snapping. Touch target ≥ 44pt. */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 32,
  step = 1,
  color = colors.accent,
  disabled,
}: SliderProps) {
  const [width, setWidth] = useState(0)
  const usable = Math.max(0, width - THUMB)
  const ratio = max > min ? (value - min) / (max - min) : 0
  const pos = useSharedValue(ratio * usable)

  // keep position in sync when value changes externally
  pos.value = ratio * usable

  const emit = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next))
    if (clamped !== value) {
      Haptics.selectionAsync()
      onChange(clamped)
    }
  }

  const setFromX = (x: number) => {
    'worklet'
    const clampedX = Math.max(0, Math.min(usable, x))
    const raw = min + (clampedX / (usable || 1)) * (max - min)
    const snapped = Math.round(raw / step) * step
    runOnJS(emit)(snapped)
  }

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin((e) => setFromX(e.x - THUMB / 2))
    .onChange((e) => setFromX(e.x - THUMB / 2))

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value }] }))
  const fillStyle = useAnimatedStyle(() => ({ width: pos.value + THUMB / 2 }))

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.hit} onLayout={onLayout}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
        </View>
        <Animated.View style={[styles.thumb, { borderColor: color }, thumbStyle]} />
      </View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  hit: { height: TOUCH_TARGET, justifyContent: 'center' },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSunken,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: radii.pill },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.fg1,
    borderWidth: 2,
  },
})
