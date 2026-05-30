import { useEffect, useState } from 'react'
import {
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import { Text, type TextProps } from '@/components/ui/text'

export interface RollingCounterProps extends Omit<TextProps, 'children'> {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
}

/** Number that animates (rolls) from its previous value to the next. */
export function RollingCounter({
  value,
  duration = 500,
  decimals = 0,
  suffix = '',
  ...textProps
}: RollingCounterProps) {
  const sv = useSharedValue(value)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    sv.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) })
  }, [value, duration, sv])

  useAnimatedReaction(
    () => sv.value,
    (current) => {
      runOnJS(setDisplay)(current)
    }
  )

  return (
    <Text mono {...textProps}>
      {display.toFixed(decimals)}
      {suffix}
    </Text>
  )
}
