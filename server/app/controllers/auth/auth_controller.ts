import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator, updateMeValidator } from '#validators/auth'
import AuthService from '#services/auth/auth_service'
import NativeSsoService from '#services/auth/native_sso_service'
import { AuthProviders } from '#enums/auth-providers.enum'

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

  /** Updates the authenticated user's display name. Body: { fullName }. */
  async updateMe({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const { fullName } = await request.validateUsing(updateMeValidator)
    user.fullName = fullName
    await user.save()
    return response.ok(user.serialize())
  }

  /** Native Apple Sign-In. Body: { token: identityToken, fullName? }. Public. */
  async apple({ request, response }: HttpContext) {
    return this.social(AuthProviders.apple, request, response)
  }

  /** Native Google Sign-In. Body: { token: idToken }. Public. */
  async google({ request, response }: HttpContext) {
    return this.social(AuthProviders.google, request, response)
  }

  private async social(
    provider: AuthProviders.apple | AuthProviders.google,
    request: HttpContext['request'],
    response: HttpContext['response']
  ) {
    const token = request.input('token')
    const fullName = request.input('fullName')
    if (typeof token !== 'string' || !token) {
      return response.badRequest({ message: 'Missing token' })
    }
    const result = await NativeSsoService.signIn(provider, token, fullName)
    if (typeof result === 'string') {
      return response.unauthorized({ message: result })
    }
    return response.ok({
      token: { type: 'bearer', token: result.token },
      ...result.user.serialize(),
    })
  }
}
