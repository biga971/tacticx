import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

/**
 * Guards internal sync routes (called by n8n). Verifies the shared
 * `ADMIN_SYNC_TOKEN` via `Authorization: Bearer <token>`. No JWT needed.
 */
export default class InternalTokenMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const token = env.get('ADMIN_SYNC_TOKEN')
    const authHeader = ctx.request.header('authorization')

    if (!token || authHeader !== `Bearer ${token}`) {
      return ctx.response.unauthorized({ message: 'Invalid internal sync token' })
    }
    return next()
  }
}
