import type { HttpContext } from '@adonisjs/core/http'
import Profile from '#models/profile'
import { upsertProfileValidator } from '#validators/profile'

export default class ProfileController {
  /**
   * GET /profile — current user's profile (null if onboarding not done).
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const profile = await Profile.findBy('user_id', user.id)
    return response.ok(profile)
  }

  /**
   * PUT /profile — create or update the current user's profile.
   */
  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(upsertProfileValidator)

    const profile = await Profile.updateOrCreate({ userId: user.id }, { userId: user.id, ...payload })

    return response.ok(profile)
  }
}
