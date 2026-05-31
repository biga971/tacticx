import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing, shadows } from '@/lib/theme'

/** icon name per route, set via options.tabBarIcon-less mapping. */
export type TabIconMap = Record<string, keyof typeof Ionicons.glyphMap>

const SPRING = { damping: 16, stiffness: 180, mass: 0.6 }

/**
 * Bottom tab bar with a fluid morphing pill that springs under the active tab.
 * Pass to expo-router <Tabs tabBar={(p) => <MorphingTabbar {...p} icons={...} />}.
 */
export function MorphingTabbar({
  state,
  descriptors,
  navigation,
  icons,
}: BottomTabBarProps & { icons: TabIconMap }) {
  const insets = useSafeAreaInsets()
  const [barWidth, setBarWidth] = useState(0)
  const count = state.routes.length
  const segWidth = barWidth > 0 ? barWidth / count : 0
  const tx = useSharedValue(0)

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    setBarWidth(w)
    tx.value = (w / count) * state.index
  }

  useEffect(() => {
    if (segWidth > 0) tx.value = withSpring(segWidth * state.index, SPRING)
  }, [state.index, segWidth, tx])

  const pill = useAnimatedStyle(() => ({
    width: Math.max(0, segWidth - spacing.md),
    transform: [{ translateX: tx.value + spacing.md / 2 }],
  }))

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom || spacing.md }]}>
      <View style={styles.bar} onLayout={onLayout}>
        {segWidth > 0 && <Animated.View style={[styles.pill, pill]} />}
        {state.routes.map((route, i) => {
          const { options } = descriptors[route.key]
          const label = (options.title ?? route.name) as string
          const focused = state.index === i
          const icon = icons[route.name] ?? 'ellipse-outline'

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) {
              Haptics.selectionAsync()
              navigation.navigate(route.name)
            }
          }

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
            >
              <Ionicons name={icon} size={22} color={focused ? colors.accent : colors.fg3} />
              <Text
                variant="eyebrow"
                numberOfLines={1}
                style={{ color: focused ? colors.accent : colors.fg3 }}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

// re-export bound spring helper for potential reuse
export const tabbarSpring = (v: number, sv: { value: number }) => {
  'worklet'
  sv.value = withSpring(v, SPRING)
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    ...shadows.md,
  },
  pill: {
    position: 'absolute',
    top: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
})
