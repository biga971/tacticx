import { useRef } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii, spacing, fontSize, TOUCH_TARGET } from '@/lib/theme'

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  autoFocus?: boolean
}

/** Themed search input with clear button. */
export function SearchBar({ value, onChangeText, placeholder = 'Rechercher…', autoFocus }: SearchBarProps) {
  const ref = useRef<TextInput>(null)
  return (
    <View style={styles.wrap}>
      <Ionicons name="search-outline" size={18} color={colors.fg3} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.fg3}
        style={styles.input}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.fg3} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: TOUCH_TARGET,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.fg1,
    fontSize: fontSize.base,
    paddingVertical: 0,
  },
})
