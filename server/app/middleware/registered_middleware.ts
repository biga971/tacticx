import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Requires a fully registered (non-guest) account. Apply after the auth
 * middleware: guests authenticate fine by token, but actions that need a real
 * identity (liking, commenting, profile, subscription) are gated here.
 */
export default class RegisteredMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.getUserOrFail()

    if (user.isGuest) {
      return ctx.response.forbidden({
        message: 'This action requires a registered account',
        code: 'ACCOUNT_REQUIRED',
      })
    }

    return next()
  }
}
