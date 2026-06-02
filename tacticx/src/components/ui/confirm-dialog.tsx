import { Modal, Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { colors, radii, spacing } from '@/lib/theme'

export interface ConfirmDialogProps {
  visible: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Use the danger style for the confirm button (destructive actions). */
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Blocking confirmation modal — centered card over a scrim. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(150)} style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View entering={FadeInDown.duration(180)} style={styles.card}>
          <Text variant="title" center>
            {title}
          </Text>
          {message ? (
            <Text variant="caption" color="fg3" center>
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button label={cancelLabel} variant="secondary" fullWidth onPress={onCancel} />
            </View>
            <View style={styles.action}>
              <Button
                label={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                fullWidth
                loading={loading}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
})
