import { type ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing } from '@/lib/theme'

export interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  /** Sheet height as a fraction of screen height (0..1). */
  heightRatio?: number
  title?: string
  children: ReactNode
}

/** Draggable bottom sheet over a dimmed backdrop. Drag down or tap backdrop to dismiss. */
export function BottomSheet({
  visible,
  onClose,
  heightRatio = 0.6,
  title,
  children,
}: BottomSheetProps) {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const sheetHeight = height * heightRatio
  const ty = useSharedValue(0)

  const pan = Gesture.Pan()
    .onChange((e) => {
      ty.value = Math.max(0, ty.value + e.changeY)
    })
    .onEnd((e) => {
      if (ty.value > sheetHeight * 0.3 || e.velocityY > 800) {
        ty.value = withTiming(sheetHeight, { duration: 180 }, () => runOnJS(onClose)())
      } else {
        ty.value = withSpring(0, { damping: 18 })
      }
    })

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }))

  const handleClose = () => {
    ty.value = 0
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.fill}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              { height: sheetHeight, paddingBottom: insets.bottom + spacing.base },
              sheetStyle,
            ]}
          >
            <View style={styles.grabber} />
            {title ? (
              <Text variant="h3" style={styles.title}>
                {title}
              </Text>
            ) : null}
            <View style={styles.body}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  title: { marginBottom: spacing.base },
  body: { flex: 1 },
})
