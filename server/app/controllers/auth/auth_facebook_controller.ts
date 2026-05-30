import type { HttpContext } from '@adonisjs/core/http'
import SocialAuthService from '#services/auth/social_auth_service'

export default class AuthFacebookController {
  async redirect({ ally }: HttpContext) {
    await ally.use('facebook').redirect((request: any) => {
      request.scopes(['public_profile', 'email'])
    })
  }

  async handleCallback({ ally, response }: HttpContext) {
    const facebookUser = ally.use('facebook')
    const result = await SocialAuthService.handleFacebookCallback(facebookUser)
    if (typeof result === 'string') {
      return response.badRequest({ message: result })
    }
    return response.ok({
      token: result.token,
      ...result.user.serialize(),
    })
  }
}
