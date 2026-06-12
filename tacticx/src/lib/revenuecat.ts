import { Platform } from 'react-native'
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases'
import { useAuthStore } from '@/lib/store/authStore'
import { useProfileStore } from '@/lib/store/profileStore'

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY

let configured = false
let listenerAttached = false

/** Active when any entitlement is granted (only `premium` exists in RC). */
function hasActiveEntitlement(info: CustomerInfo): boolean {
  return Object.keys(info.entitlements.active).length > 0
}

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

/**
 * Pull the current entitlement from RevenueCat into the profile store, then
 * keep it in sync via a listener (renewals, expirations, cross-device buys).
 * Call once after init and again after a login so VIP never goes stale.
 */
export async function syncEntitlement() {
  if (!configured) return

  if (!listenerAttached) {
    Purchases.addCustomerInfoUpdateListener((info) => {
      useProfileStore.getState().setPremium(hasActiveEntitlement(info))
    })
    listenerAttached = true
  }

  try {
    const info = await Purchases.getCustomerInfo()
    useProfileStore.getState().setPremium(hasActiveEntitlement(info))
  } catch {
    // Offline / native unavailable — keep the persisted value untouched.
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
  return hasActiveEntitlement(customerInfo)
}

export async function restorePurchases(): Promise<boolean> {
  if (!configured) return false
  const info = await Purchases.restorePurchases()
  return hasActiveEntitlement(info)
}
