import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing, shadows } from '@/lib/theme'

type ToastType = 'success' | 'error' | 'info'

interface ToastData {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICON: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle-outline',
  error: 'alert-circle-outline',
  info: 'information-circle-outline',
}
const TINT: Record<ToastType, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const [toast, setToast] = useState<ToastData | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string, type: ToastType = 'info') => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ id: Date.now(), type, message })
    Haptics.notificationAsync(
      type === 'error'
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Success
    )
    timer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          entering={SlideInUp.springify().damping(18)}
          exiting={SlideOutUp}
          style={[styles.toast, { top: insets.top + spacing.sm }]}
          pointerEvents="none"
        >
          <Ionicons name={ICON[toast.type]} size={20} color={TINT[toast.type]} />
          <Text variant="caption" color="fg1" style={styles.msg}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    ...shadows.lg,
    zIndex: 1000,
  },
  msg: { flex: 1 },
})
