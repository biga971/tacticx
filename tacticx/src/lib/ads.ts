import { Platform } from 'react-native'
import mobileAds, {
  AdEventType,
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads'

let initialized = false

/**
 * Initialise the Google Mobile Ads SDK once at startup.
 * No-op when the native module is unavailable (e.g. Expo Go) — banners then
 * silently render nothing instead of crashing.
 */
export async function initAds(): Promise<void> {
  if (initialized) return
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.T,
      tagForChildDirectedTreatment: false,
    })
    await mobileAds().initialize()
    initialized = true
  } catch {
    // Native module not linked (Expo Go / web). Ads disabled.
  }
}

// Real unit IDs come from env (set per build). Falls back to Google's official
// test units in dev or when no prod ID is configured — never ship test IDs.
const PROD_BANNER = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER,
})

export const BANNER_UNIT_ID = __DEV__ || !PROD_BANNER ? TestIds.BANNER : PROD_BANNER

const PROD_REWARDED = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED,
})

export const REWARDED_UNIT_ID = __DEV__ || !PROD_REWARDED ? TestIds.REWARDED : PROD_REWARDED

/**
 * Load and present a fullscreen rewarded ad, resolving once it closes (whether
 * or not the reward was earned). Resolves immediately if the native module is
 * unavailable (Expo Go / web) so the gated action always proceeds. A safety
 * timeout guarantees the promise never blocks the flow forever.
 */
export function showRewardedAd(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false
    const unsubs: Array<() => void> = []
    const done = () => {
      if (settled) return
      settled = true
      unsubs.forEach((u) => u())
      resolve()
    }

    try {
      const ad = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
      })
      unsubs.push(
        ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
          ad.show().catch(done)
        })
      )
      unsubs.push(ad.addAdEventListener(AdEventType.CLOSED, done))
      unsubs.push(ad.addAdEventListener(AdEventType.ERROR, done))
      ad.load()
      setTimeout(done, 12000)
    } catch {
      done()
    }
  })
}
