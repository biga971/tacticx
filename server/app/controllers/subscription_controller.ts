import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'

export default class SubscriptionController {
  /**
   * GET /subscription/status — current premium state.
   */
  async status({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const sub = await Subscription.query()
      .where('user_id', user.id)
      .orderBy('updated_at', 'desc')
      .first()

    const isPremium = sub?.status === 'active'
    return response.ok({
      isPremium,
      subscription: sub ? sub.serialize() : null,
    })
  }
}
