import { Platform } from 'react-native'
import mobileAds, { MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads'

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
