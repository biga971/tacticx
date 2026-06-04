import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ui/text-field'
import { useToast } from '@/components/ui/toast'
import { AuthShell } from '@/components/shared/AuthShell'
import { useForgotPassword } from '@/lib/api/hooks/useAuth'
import { spacing } from '@/lib/theme'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const toast = useToast()
  const forgot = useForgotPassword()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/(auth)/sign-in'))

  const submit = () => {
    setError(null)
    if (!email.trim()) return setError('Email requis.')
    forgot.mutate(
      { email: email.trim() },
      {
        // No reveal whether the email exists — same toast either way.
        onSuccess: () => {
          toast.show('Email envoyé', 'success')
          dismiss()
        },
        onError: () => {
          toast.show('Email envoyé', 'success')
          dismiss()
        },
      }
    )
  }

  return (
    <AuthShell variant="back" onDismiss={dismiss}>
      <View style={styles.head}>
        <Text variant="eyebrow" color="fg3">
          Réinitialisation
        </Text>
        <Text variant="h2">Mot de passe oublié</Text>
        <Text variant="body" color="fg2">
          Entre ton email. On t'envoie un lien pour définir un nouveau mot de passe.
        </Text>
      </View>

      <TextField
        label="Email"
        placeholder="ton@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={error ?? undefined}
      />

      <Button label="Envoyer le lien" fullWidth size="lg" loading={forgot.isPending} onPress={submit} />
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  head: { gap: spacing.sm, marginBottom: spacing.lg },
})
