import { useCallback } from 'react'
import { showRewardedAd } from '@/lib/ads'
import { useProfileStore } from '@/lib/store/profileStore'

/**
 * Returns a gate that shows a fullscreen rewarded ad, then runs `action`.
 * VIP (premium) users skip the ad entirely. The action always runs once the
 * ad closes — even on ad failure — so imports are never blocked.
 */
export function useRewardedGate() {
  const isPremium = useProfileStore((s) => s.isPremium)
  return useCallback(
    async (action: () => void | Promise<void>) => {
      if (!isPremium) await showRewardedAd()
      await action()
    },
    [isPremium]
  )
}
