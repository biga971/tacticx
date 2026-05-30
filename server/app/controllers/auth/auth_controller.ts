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
}
