import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { useToast } from '@/components/ui/toast'
import { AuthShell, AuthDivider, LegalMicro } from '@/components/shared/AuthShell'
import { AuthProviders } from '@/components/shared/AuthProviders'
import { useLogin } from '@/lib/api/hooks/useAuth'
import { spacing } from '@/lib/theme'

export default function SignInScreen() {
  const router = useRouter()
  const toast = useToast()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))

  const submit = () => {
    setError(null)
    if (!email.trim() || !password) {
      setError('Email et mot de passe requis.')
      return
    }
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          toast.show('Connecté', 'success')
          dismiss()
        },
        onError: () => setError('Email ou mot de passe incorrect.'),
      }
    )
  }

  return (
    <AuthShell variant="close" onDismiss={dismiss}>
      <View style={styles.head}>
        <Text variant="eyebrow" color="fg3">
          Bon retour
        </Text>
        <Text variant="h2">Connexion</Text>
        <Text variant="body" color="fg2">
          Connecte-toi pour retrouver tes équipes, tes stats et la communauté.
        </Text>
      </View>

      <AuthProviders onDone={dismiss} />

      <AuthDivider label="ou" />

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
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
        error={error ?? undefined}
      />

      <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgot}>
        <Text variant="caption" color="accent" weight="medium">
          Mot de passe oublié ?
        </Text>
      </Pressable>

      <Button label="Se connecter" fullWidth size="lg" loading={login.isPending} onPress={submit} />

      <View style={styles.foot}>
        <Text variant="body" color="fg2" center>
          Pas encore de compte ?{' '}
          <Text variant="body" color="accent" weight="semibold" onPress={() => router.replace('/(auth)/sign-up')}>
            Créer un compte
          </Text>
        </Text>
      </View>
      <LegalMicro />
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  head: { gap: spacing.sm, marginBottom: spacing.lg },
  forgot: { alignSelf: 'flex-end', marginTop: -spacing.xs, marginBottom: spacing.base },
  foot: { marginTop: spacing.lg },
})
