import { useState } from 'react'
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing } from '@/lib/theme'

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string
  /** Helper line under the field; always shown unless `error` overrides it. */
  help?: string
  /** Error message; turns the border danger and replaces the helper. */
  error?: string
  /** Renders a password field with an eye toggle. */
  secure?: boolean
}

/** DS text field: surface-sunken bg, accent focus halo, danger error, eye toggle. */
export function TextField({ label, help, error, secure, ...props }: TextFieldProps) {
  const [focused, setFocused] = useState(false)
  const [reveal, setReveal] = useState(false)

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="caption" weight="semibold" color={error ? 'danger' : 'fg2'} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.input,
          focused && styles.focus,
          error && styles.error,
        ]}
      >
        <TextInput
          style={styles.field}
          placeholderTextColor={colors.fg3}
          secureTextEntry={secure && !reveal}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {secure ? (
          <Pressable onPress={() => setReveal((v) => !v)} hitSlop={8} style={styles.eye}>
            <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.fg3} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.helpErr}>
          <Ionicons name="alert-circle-outline" size={12} color={colors.danger} />
          <Text variant="caption" color="danger">
            {error}
          </Text>
        </View>
      ) : help ? (
        <Text variant="caption" color="fg3" style={styles.help}>
          {help}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    height: 46,
    paddingHorizontal: spacing.md,
  },
  focus: { borderColor: colors.accent, backgroundColor: colors.surface },
  error: { borderColor: colors.danger },
  field: { flex: 1, color: colors.fg1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  eye: { paddingLeft: spacing.sm },
  help: { marginTop: spacing.xs },
  helpErr: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
})
