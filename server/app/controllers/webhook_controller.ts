import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import { DateTime } from 'luxon'
import Subscription from '#models/subscription'

type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'EXPIRATION'
  | string

/**
 * Maps a RevenueCat product/period to our plan enum.
 */
function resolvePlan(periodType?: string, productId?: string): 'monthly' | 'annual' {
  const haystack = `${periodType ?? ''} ${productId ?? ''}`.toLowerCase()
  if (haystack.includes('annual') || haystack.includes('year')) return 'annual'
  return 'monthly'
}

export default class WebhookController {
  /**
   * POST /webhooks/revenuecat — subscription lifecycle from RevenueCat.
   * Auth: header `Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>`.
   */
  async revenuecat({ request, response }: HttpContext) {
    const secret = env.get('REVENUECAT_WEBHOOK_SECRET')
    const authHeader = request.header('authorization')
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return response.unauthorized({ message: 'Invalid webhook signature' })
    }

    const event = request.input('event')
    if (!event) return response.badRequest({ message: 'Missing event' })

    const type: RevenueCatEventType = event.type
    const appUserId: string | undefined = event.app_user_id
    if (!appUserId) return response.badRequest({ message: 'Missing app_user_id' })

    // app_user_id is configured on the client as our internal user id.
    const userId = Number(appUserId)
    if (Number.isNaN(userId)) {
      // Unknown identifier — acknowledge so RevenueCat stops retrying.
      return response.ok({ received: true, skipped: 'non-numeric app_user_id' })
    }

    const plan = resolvePlan(event.period_type, event.product_id)
    const expiresAt = event.expiration_at_ms
      ? DateTime.fromMillis(Number(event.expiration_at_ms))
      : null

    let status: 'active' | 'expired' | 'cancelled'
    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
        status = 'active'
        break
      case 'CANCELLATION':
        status = 'cancelled'
        break
      case 'EXPIRATION':
        status = 'expired'
        break
      default:
        return response.ok({ received: true, ignored: type })
    }

    await Subscription.updateOrCreate(
      { userId },
      {
        userId,
        revenuecatUserId: appUserId,
        plan,
        status,
        expiresAt,
      }
    )

    return response.ok({ received: true })
  }
}
