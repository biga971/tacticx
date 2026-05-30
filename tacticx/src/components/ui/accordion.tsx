import { useState, type ReactNode } from 'react'
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing } from '@/lib/theme'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  haptic?: boolean
}

/** Single collapsible section with smooth expand/collapse. */
export function Accordion({ title, children, defaultOpen = false, icon, haptic = true }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    if (haptic) Haptics.selectionAsync()
    setOpen((o) => !o)
  }

  return (
    <View style={styles.wrap}>
      <Pressable onPress={toggle} style={styles.header} accessibilityRole="button">
        {icon ? <Ionicons name={icon} size={18} color={colors.fg2} /> : null}
        <Text variant="title" style={{ flex: 1 }}>
          {title}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.fg3} />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
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
