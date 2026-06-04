import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { useProfileStore } from '@/lib/store/profileStore'
import { BANNER_UNIT_ID } from '@/lib/ads'
import { spacing } from '@/lib/theme'

/**
 * Anchored banner ad. Hidden entirely for VIP (premium) users and collapses
 * to nothing if the ad fails to load (e.g. native module missing in Expo Go).
 */
export function AdBanner() {
  const isPremium = useProfileStore((s) => s.isPremium)
  const [failed, setFailed] = useState(false)

  if (isPremium || failed) return null

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingBottom: spacing.sm },
})
