import { Platform } from 'react-native'
import Purchases, { type PurchasesPackage } from 'react-native-purchases'
import { useAuthStore } from '@/lib/store/authStore'

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY

let configured = false

/** Configure RevenueCat once at startup. No-op if no key set (dev / Expo Go). */
export function initRevenueCat() {
  if (configured) return
  const apiKey = Platform.select({ ios: IOS_KEY, android: ANDROID_KEY })
  if (!apiKey) return

  try {
    const userId = useAuthStore.getState().userId ?? undefined
    Purchases.configure({ apiKey, appUserID: userId })
    configured = true
  } catch {
    // Native module unavailable (e.g. Expo Go) — paywall will show a notice.
  }
}

/** Identify the RevenueCat user with our backend user id (after login). */
export async function identifyRevenueCat(userId: string) {
  if (!configured) return
  try {
    await Purchases.logIn(userId)
  } catch {
    /* noop */
  }
}

export async function getOfferingPackages(): Promise<PurchasesPackage[]> {
  if (!configured) return []
  const offerings = await Purchases.getOfferings()
  return offerings.current?.availablePackages ?? []
}

/** Returns true when an entitlement is active after purchase. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg)
  return Object.keys(customerInfo.entitlements.active).length > 0
}

export async function restorePurchases(): Promise<boolean> {
  if (!configured) return false
  const info = await Purchases.restorePurchases()
  return Object.keys(info.entitlements.active).length > 0
}
