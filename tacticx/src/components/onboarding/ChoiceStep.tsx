import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/text'
import { Progress } from '@/components/ui/progress'
import { colors, radii, spacing, TOUCH_TARGET } from '@/lib/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
}

export interface ChoiceStepProps<T extends string> {
  step: number // 1-based
  totalSteps: number
  eyebrow: string
  title: string
  options: ChoiceOption<T>[]
  value: T | null
  onSelect: (value: T) => void
}

/** Reusable onboarding step: progress + 3 choice cards. */
export function ChoiceStep<T extends string>({
  step,
  totalSteps,
  eyebrow,
  title,
  options,
  value,
  onSelect,
}: ChoiceStepProps<T>) {
  const insets = useSafeAreaInsets()

  const select = (v: T) => {
    Haptics.selectionAsync()
    onSelect(v)
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.header}>
        <Progress value={step} segments={totalSteps} />
        <Text variant="eyebrow" color="accent" style={styles.eyebrow}>
          {eyebrow}
        </Text>
        <Text variant="h1">{title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {options.map((opt, i) => {
          const active = opt.value === value
          return (
            <AnimatedPressable
              key={opt.value}
              entering={FadeInDown.delay(i * 70).springify()}
              onPress={() => select(opt.value)}
              style={[styles.card, active && styles.cardActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Ionicons
                  name={opt.icon}
                  size={24}
                  color={active ? colors.accent : colors.fg2}
                />
              </View>
              <View style={styles.cardText}>
                <Text variant="title" color={active ? 'fg1' : 'fg1'}>
                  {opt.label}
                </Text>
                <Text variant="caption" color="fg3">
                  {opt.description}
                </Text>
              </View>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
            </AnimatedPressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.base },
  header: { gap: spacing.md, marginBottom: spacing.xl },
  eyebrow: { marginTop: spacing.sm },
  list: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    minHeight: TOUCH_TARGET + spacing.base,
  },
  cardActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.surface },
  cardText: { flex: 1, gap: 2 },
})
