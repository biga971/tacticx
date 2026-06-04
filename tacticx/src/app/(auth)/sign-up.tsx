import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { useToast } from '@/components/ui/toast'
import { AuthShell, AuthDivider } from '@/components/shared/AuthShell'
import { AuthProviders } from '@/components/shared/AuthProviders'
import { useUpgradeAccount, useRegister } from '@/lib/api/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'
import { ApiError } from '@/lib/api/client'
import { colors, radii, spacing } from '@/lib/theme'

export default function SignUpScreen() {
  const router = useRouter()
  const toast = useToast()
  const isGuest = useAuthStore((s) => s.isGuest)
  const token = useAuthStore((s) => s.token)
  const upgrade = useUpgradeAccount()
  const register = useRegister()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pending = upgrade.isPending || register.isPending
  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))

  const submit = () => {
    setError(null)
    if (fullName.trim().length < 3) return setError('Le pseudo doit faire au moins 3 caractères.')
    if (!email.trim()) return setError('Email requis.')
    if (password.length < 8) return setError('8 caractères minimum pour le mot de passe.')
    if (!accepted) return setError("Tu dois accepter les conditions d'utilisation.")

    const payload = { fullName: fullName.trim(), email: email.trim(), password }
    const onError = (e: unknown) =>
      setError(e instanceof ApiError ? e.message : "Impossible de créer le compte.")
    const onSuccess = () => {
      toast.show('Compte créé', 'success')
      dismiss()
    }

    // Promote the existing guest in place so its data is kept; otherwise register fresh.
    if (token && isGuest) upgrade.mutate(payload, { onSuccess, onError })
    else register.mutate(payload, { onSuccess, onError })
  }

  return (
    <AuthShell variant="back" onDismiss={dismiss}>
      <View style={styles.head}>
        <Text variant="eyebrow" color="fg3">
          Gratuit
        </Text>
        <Text variant="h2">Créer un compte</Text>
        <Text variant="body" color="fg2">
          Choisis ton pseudo — il sera visible quand tu publies dans la communauté.
        </Text>
      </View>

      <AuthProviders onDone={dismiss} />

      <AuthDivider label="ou avec ton email" />

      <TextField
        label="Pseudo"
        placeholder="Ton nom dans la communauté"
        autoCapitalize="none"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextField
        label="Email"
        placeholder="ton@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Mot de passe"
        placeholder="••••••••"
        secure
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        help="8 caractères minimum."
        error={error ?? undefined}
      />

      <Pressable style={styles.check} onPress={() => setAccepted((v) => !v)}>
        <View style={[styles.box, accepted && styles.boxOn]}>
          {accepted && <Ionicons name="checkmark" size={13} color={colors.fgInverse} />}
        </View>
        <Text variant="caption" color="fg2" style={{ flex: 1 }}>
          J'accepte les conditions d'utilisation et la politique de confidentialité.
        </Text>
      </Pressable>

      <Button
        label="Créer mon compte"
        fullWidth
        size="lg"
        disabled={!accepted}
        loading={pending}
        onPress={submit}
      />

      <View style={styles.foot}>
        <Text variant="body" color="fg2" center>
          Déjà un compte ?{' '}
          <Text variant="body" color="accent" weight="semibold" onPress={() => router.replace('/(auth)/sign-in')}>
            Se connecter
          </Text>
        </Text>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  head: { gap: spacing.sm, marginBottom: spacing.lg },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginVertical: spacing.md },
  box: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  foot: { marginTop: spacing.lg },
})
