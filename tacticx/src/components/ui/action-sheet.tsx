import { Modal, Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing } from '@/lib/theme'

export interface ActionSheetOption {
  label: string
  icon?: keyof typeof Ionicons.glyphMap
  /** Render in the danger color for destructive actions. */
  destructive?: boolean
  onPress: () => void
}

export interface ActionSheetProps {
  visible: boolean
  title?: string
  message?: string
  options: ActionSheetOption[]
  cancelLabel?: string
  onClose: () => void
}

/** Bottom sheet of tappable options over a scrim — dark mode. */
export function ActionSheet({
  visible,
  title,
  message,
  options,
  cancelLabel = 'Annuler',
  onClose,
}: ActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(150)} style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View entering={FadeInDown.duration(200)} style={styles.sheet}>
          {title || message ? (
            <View style={styles.head}>
              {title ? (
                <Text variant="title" center>
                  {title}
                </Text>
              ) : null}
              {message ? (
                <Text variant="caption" color="fg3" center>
                  {message}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.group}>
            {options.map((opt, i) => (
              <Pressable
                key={opt.label}
                onPress={opt.onPress}
                style={[styles.row, i < options.length - 1 && styles.rowBorder]}
              >
                {opt.icon ? (
                  <Ionicons
                    name={opt.icon}
                    size={19}
                    color={opt.destructive ? colors.danger : colors.fg1}
                  />
                ) : null}
                <Text
                  variant="body"
                  weight="medium"
                  style={{ color: opt.destructive ? colors.danger : colors.fg1 }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onClose} style={[styles.group, styles.cancel]}>
            <Text variant="body" weight="semibold" color="fg2" center style={{ width: '100%' }}>
              {cancelLabel}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
  },
  sheet: { gap: spacing.sm },
  head: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  group: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  cancel: { paddingVertical: spacing.base, paddingHorizontal: spacing.lg },
})
