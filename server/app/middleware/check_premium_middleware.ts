import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Subscription from '#models/subscription'

/**
 * Premium gate. Allows the request only when the authenticated user has an
 * active subscription. Apply after the auth middleware.
 */
export default class CheckPremiumMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.getUserOrFail()

    const sub = await Subscription.query()
      .where('user_id', user.id)
      .where('status', 'active')
      .first()

    if (!sub) {
      return ctx.response.forbidden({
        message: 'This feature requires an active premium subscription',
        code: 'PREMIUM_REQUIRED',
      })
    }

    return next()
  }
}
