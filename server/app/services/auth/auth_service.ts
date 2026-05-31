import { randomUUID } from 'node:crypto'
import env from '#start/env'
import User from '#models/user'
import { ActivationService } from '#services/activation/activation_service'

class AuthService {
  async register(payload: { email: string; password: string; fullName?: string }) {
    const user = await User.create(payload)

    await ActivationService.sendActivationEmail(user, env.get('BASE_URL'))
    return user
  }

  async login(email: string, password: string) {
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: env.get('JWT_EXPIRY') as string,
    })

    return { token, user }
  }

  /**
   * Creates a throwaway anonymous user and issues a long-lived access token.
   * Lets the mobile app reach protected read endpoints without forcing signup.
   * The placeholder email/password keep the auth-finder schema satisfied; they
   * are never used to log in (guests authenticate by token only).
   */
  async createGuest() {
    const user = await User.create({
      email: `guest_${randomUUID()}@guest.tacticx.local`,
      password: randomUUID() + randomUUID(),
      isGuest: true,
      isActivated: false,
    })
    // No expiresIn: the guest token is the only identity until upgrade.
    const token = await User.accessTokens.create(user, ['*'])

    return { token, user }
  }

  /**
   * Promotes the current guest user to a full account in place, preserving its
   * id and all owned data (teams, etc.). Called with a valid guest token.
   */
  async upgradeGuest(
    user: User,
    payload: { email: string; password: string; fullName?: string }
  ) {
    user.merge({ ...payload, isGuest: false })
    await user.save()

    await ActivationService.sendActivationEmail(user, env.get('BASE_URL'))
    return user
  }
}

export default new AuthService()
