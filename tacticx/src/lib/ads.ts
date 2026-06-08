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
 * No-op when the native module is unavailable (e.g. Expo Go / web).
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
const MAX_TRIES = 3

// Minimum delay between two *displayed* rewarded ads, to avoid overwhelming the
// user. A no-fill / error does not start the cooldown (no ad was shown).
const REWARD_COOLDOWN_MS = 5 * 60 * 1000
let lastRewardShownAt = 0

export async function showRewardedAd(): Promise<void> {
  // Within cooldown → skip silently, let the gated action proceed.
  if (Date.now() - lastRewardShownAt < REWARD_COOLDOWN_MS) return
  await initAds()

  return new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    let tries = 0
    const attempt = () => {
      tries += 1
      const unsubs: Array<() => void> = []
      const cleanup = () => unsubs.forEach((u) => u())

      try {
        const ad = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, {
          requestNonPersonalizedAdsOnly: true,
        })
        unsubs.push(
          ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            ad.show().catch(() => {
              cleanup()
              finish()
            })
          })
        )
        unsubs.push(ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {}))
        unsubs.push(
          ad.addAdEventListener(AdEventType.CLOSED, () => {
            lastRewardShownAt = Date.now() // ad was actually displayed
            cleanup()
            finish()
          })
        )
        unsubs.push(
          ad.addAdEventListener(AdEventType.ERROR, (e: unknown) => {
            cleanup()
            const msg = String((e as Error)?.message ?? e)
            // AdMob frequently returns no-fill on the first request; retry a few times.
            if (msg.includes('no-fill') && tries < MAX_TRIES) {
              setTimeout(attempt, 600)
            } else {
              finish()
            }
          })
        )
        ad.load()
      } catch {
        cleanup()
        finish()
      }
    }

    attempt()
    // Absolute safety: never block the gated action longer than this.
    setTimeout(finish, 15000)
  })
}
