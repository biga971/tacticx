import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Text } from '@/components/ui/text'
import { colors, spacing } from '@/lib/theme'

export interface TabItem<T extends string> {
  label: string
  value: T
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  scrollable?: boolean
}

/** Underline tabs with an animated indicator. */
export function Tabs<T extends string>({ items, value, onChange, scrollable }: TabsProps<T>) {
  const [widths, setWidths] = useState<number[]>([])
  const [offsets, setOffsets] = useState<number[]>([])
  const indW = useSharedValue(0)
  const indX = useSharedValue(0)

  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value)
  )

  const onItemLayout = (i: number) => (e: LayoutChangeEvent) => {
    const { width, x } = e.nativeEvent.layout
    setWidths((prev) => {
      const next = [...prev]
      next[i] = width
      return next
    })
    setOffsets((prev) => {
      const next = [...prev]
      next[i] = x
      return next
    })
    if (i === index) {
      indW.value = width
      indX.value = x
    }
  }

  const select = (v: T, i: number) => {
    onChange(v)
    if (widths[i] != null && offsets[i] != null) {
      indW.value = withTiming(widths[i], { duration: 200, easing: Easing.out(Easing.cubic) })
      indX.value = withTiming(offsets[i], { duration: 200, easing: Easing.out(Easing.cubic) })
    }
  }

  const indicator = useAnimatedStyle(() => ({ width: indW.value, transform: [{ translateX: indX.value }] }))

  const Container = scrollable ? ScrollView : View
  const containerProps = scrollable
    ? { horizontal: true, showsHorizontalScrollIndicator: false }
    : {}

  return (
    <View>
      <Container {...containerProps} style={styles.row} contentContainerStyle={scrollable ? styles.scrollContent : undefined}>
        {items.map((item, i) => {
          const active = item.value === value
          return (
            <Pressable key={item.value} onLayout={onItemLayout(i)} onPress={() => select(item.value, i)} style={styles.tab}>
              <Text variant="caption" weight="semibold" color={active ? 'fg1' : 'fg3'}>
                {item.label}
              </Text>
            </Pressable>
          )
        })}
        <Animated.View style={[styles.indicator, indicator]} />
      </Container>
      <View style={styles.baseline} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  scrollContent: { gap: spacing.lg },
  tab: { paddingVertical: spacing.sm, marginRight: spacing.lg },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  baseline: { height: 1, backgroundColor: colors.divider },
})
