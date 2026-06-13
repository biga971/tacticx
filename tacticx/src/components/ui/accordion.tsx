import { useState, type ReactNode } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing } from '@/lib/theme'

export interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  haptic?: boolean
}

/**
 * Single collapsible section with smooth expand/collapse.
 *
 * Uses Reanimated layout animations (Fabric/New-Architecture native) rather than
 * the legacy `LayoutAnimation` API, which janks/freezes on the New Architecture
 * when a large subtree (e.g. several Sliders) mounts at once.
 */
export function Accordion({ title, children, defaultOpen = false, icon, haptic = true }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const toggle = () => {
    if (haptic) Haptics.selectionAsync()
    setOpen((o) => !o)
  }

  return (
    <Animated.View style={styles.wrap} layout={LinearTransition.duration(180)}>
      <Pressable onPress={toggle} style={styles.header} accessibilityRole="button">
        {icon ? <Ionicons name={icon} size={18} color={colors.fg2} /> : null}
        <Text variant="title" style={{ flex: 1 }}>
          {title}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.fg3} />
      </Pressable>
      {open && (
        <Animated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(100)}
          style={styles.body}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
  },
  body: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },
})
