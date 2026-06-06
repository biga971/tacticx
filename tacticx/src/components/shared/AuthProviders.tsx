import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as AppleAuthentication from 'expo-apple-authentication'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/toast'
import { useSocialSignIn } from '@/lib/api/hooks/useAuth'
import { colors, radii, spacing } from '@/lib/theme'

WebBrowser.maybeCompleteAuthSession()

const GOOGLE_IOS = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
const GOOGLE_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
const GOOGLE_WEB = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

// Google is only usable once the platform-specific client id exists, otherwise
// `useIdTokenAuthRequest` throws. Gate the hook behind this per platform.
const GOOGLE_CONFIGURED =
  Platform.OS === 'ios' ? !!GOOGLE_IOS : Platform.OS === 'android' ? !!GOOGLE_ANDROID : !!GOOGLE_WEB

/** Apple + Google native SSO buttons. Calls onDone() after a successful sign-in. */
export function AuthProviders({ onDone }: { onDone?: () => void }) {
  const toast = useToast()
  const apple = useSocialSignIn('apple')
  const [appleAvailable, setAppleAvailable] = useState(false)

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {})
  }, [])

  const onApple = async () => {
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!cred.identityToken) {
        toast.show('Connexion Apple échouée', 'error')
        return
      }
      const fullName = [cred.fullName?.givenName, cred.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim()
      apple.mutate(
        { token: cred.identityToken, fullName: fullName || undefined },
        {
          onSuccess: () => onDone?.(),
          onError: () => toast.show('Connexion Apple échouée', 'error'),
        }
      )
    } catch (e: unknown) {
      // User-cancelled is not an error worth surfacing.
      if ((e as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') {
        toast.show('Connexion Apple échouée', 'error')
      }
    }
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {appleAvailable && Platform.OS === 'ios' && (
        <Pressable style={[styles.btn, styles.apple]} onPress={onApple} disabled={apple.isPending}>
          {apple.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="logo-apple" size={19} color="#000" />
              <Text weight="semibold" style={{ color: '#000' }}>
                Continuer avec Apple
              </Text>
            </>
          )}
        </Pressable>
      )}

      {GOOGLE_CONFIGURED ? (
        <GoogleButton onDone={onDone} />
      ) : (
        <Pressable
          style={[styles.btn, styles.google]}
          onPress={() => toast.show('Google bientôt disponible', 'info')}
        >
          <Ionicons name="logo-google" size={18} color={colors.fg1} />
          <Text weight="semibold" style={{ color: colors.fg1 }}>
            Continuer avec Google
          </Text>
        </Pressable>
      )}
    </View>
  )
}

/** Google SSO button. Only mounted when a platform client id is configured. */
function GoogleButton({ onDone }: { onDone?: () => void }) {
  const toast = useToast()
  const google = useSocialSignIn('google')
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS,
    androidClientId: GOOGLE_ANDROID,
    webClientId: GOOGLE_WEB,
  })

  useEffect(() => {
    if (response?.type !== 'success') return
    const idToken = response.params?.id_token
    if (!idToken) return
    google.mutate(
      { token: idToken },
      {
        onSuccess: () => onDone?.(),
        onError: () => toast.show('Connexion Google échouée', 'error'),
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response])

  return (
    <Pressable style={[styles.btn, styles.google]} onPress={() => promptAsync()} disabled={google.isPending}>
      {google.isPending ? (
        <ActivityIndicator color={colors.fg1} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color={colors.fg1} />
          <Text weight="semibold" style={{ color: colors.fg1 }}>
            Continuer avec Google
          </Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  apple: { backgroundColor: '#FFFFFF' },
  google: { backgroundColor: colors.surfaceHigh, borderColor: colors.border },
})
