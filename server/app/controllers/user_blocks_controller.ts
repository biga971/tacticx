import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserBlock from '#models/user_block'

export default class UserBlocksController {
  /**
   * POST /users/:userId/block — block another user. Their comments stop showing
   * for the blocker. Idempotent: re-blocking succeeds without error.
   */
  async store({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const targetId = Number(params.userId)
    if (!Number.isInteger(targetId) || targetId === user.id) {
      return response.badRequest({ message: 'Invalid user to block' })
    }

    const target = await User.find(targetId)
    if (!target) return response.notFound({ message: 'User not found' })

    await UserBlock.updateOrCreate(
      { blockerId: user.id, blockedId: targetId },
      { blockerId: user.id, blockedId: targetId }
    )

    return response.ok({ blocked: true })
  }

  /**
   * DELETE /users/:userId/block — remove a block. Succeeds whether or not the
   * block existed.
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const targetId = Number(params.userId)

    await UserBlock.query()
      .where('blocker_id', user.id)
      .where('blocked_id', targetId)
      .delete()

    return response.ok({ unblocked: true })
  }
}
