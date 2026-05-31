import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth'
import AuthService from '#services/auth/auth_service'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await AuthService.register(payload)
    return response.status(201).json(user)
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const { token, user } = await AuthService.login(email, password)
    return response.ok({
      token: token,
      ...user.serialize(),
    })
  }

  /**
   * Mints an anonymous guest session. Public + rate-limited. The app calls this
   * once on first launch and stores the returned token.
   */
  async guest({ response }: HttpContext) {
    const { token, user } = await AuthService.createGuest()
    return response.created({
      token: token,
      ...user.serialize(),
    })
  }

  /**
   * Upgrades the authenticated guest to a full account in place. Requires a
   * valid guest token; rejects users that already have a real account.
   */
  async upgrade({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isGuest) {
      return response.conflict({
        message: 'This account is already registered',
        code: 'ALREADY_REGISTERED',
      })
    }
    const payload = await request.validateUsing(registerValidator)
    const upgraded = await AuthService.upgradeGuest(user, payload)
    return response.ok(upgraded.serialize())
  }
}
