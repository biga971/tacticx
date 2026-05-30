import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { useProfileStore } from '@/lib/store/profileStore'
import { Shimmer } from '@/components/ui/shimmer'
import { colors, spacing } from '@/lib/theme'

/** Entry redirect: onboarding when not completed, otherwise the tabs. */
export default function Index() {
  const hasCompleted = useProfileStore((s) => s.hasCompletedOnboarding)
  const [hydrated, setHydrated] = useState(useProfileStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useProfileStore.persist.onFinishHydration(() => setHydrated(true))
    if (useProfileStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <Shimmer width={120} height={120} radius={60} />
      </View>
    )
  }

  return <Redirect href={hasCompleted ? '/(tabs)/meta' : '/(onboarding)/niveau'} />
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
})
