import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { randomUUID } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'
import User from '#models/user'
import env from '#start/env'
import { AuthProviders } from '#enums/auth-providers.enum'
import { isUniqueProvider } from '#guards/auth_provider_guard'

const APPLE_ISS = 'https://appleid.apple.com'
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))

const GOOGLE_ISS = ['https://accounts.google.com', 'accounts.google.com']
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

interface VerifiedIdentity {
  sub: string
  email: string | null
  name: string | null
}

class NativeSsoService {
  /** Verifies an Apple identityToken (JWT) against Apple's JWKS. */
  private async verifyApple(identityToken: string): Promise<VerifiedIdentity> {
    const audience = env.get('APPLE_CLIENT_ID') || undefined
    const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: APPLE_ISS,
      audience,
    })
    return this.toIdentity(payload)
  }

  /** Verifies a Google idToken (JWT) against Google's JWKS. */
  private async verifyGoogle(idToken: string): Promise<VerifiedIdentity> {
    const ids = (env.get('GOOGLE_CLIENT_IDS') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: GOOGLE_ISS,
      audience: ids.length ? ids : undefined,
    })
    return this.toIdentity(payload)
  }

  private toIdentity(payload: JWTPayload): VerifiedIdentity {
    return {
      sub: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email : null,
      name: typeof payload.name === 'string' ? payload.name : null,
    }
  }

  /**
   * Verifies a native SSO id-token, then finds or creates the matching account
   * and issues a Tacticx access token. Returns a string on a known failure.
   *
   * @param provider apple | google
   * @param token    provider id-token (JWT)
   * @param fullName optional display name (Apple only sends it on first sign-in)
   */
  async signIn(
    provider: AuthProviders.apple | AuthProviders.google,
    token: string,
    fullName?: string
  ): Promise<{ token: string; user: User } | string> {
    let identity: VerifiedIdentity
    try {
      identity =
        provider === AuthProviders.apple
          ? await this.verifyApple(token)
          : await this.verifyGoogle(token)
      logger.info(
        { provider, sub: identity.sub, email: identity.email, name: identity.name },
        '[SSO] 2/5 token verified'
      )
    } catch (error) {
      logger.error({ err: error, provider }, '[SSO] 2/5 token verification FAILED')
      return 'Invalid or expired token'
    }

    // Prefer matching the stable provider id; fall back to email.
    let user = await User.query()
      .where('provider', provider)
      .where('provider_id', identity.sub)
      .first()
    logger.info({ provider, sub: identity.sub, found: !!user, userId: user?.id }, '[SSO] 3/5 user lookup')

    if (!user) {
      const email = identity.email ?? `${provider}_${identity.sub}@sso.tacticx.local`
      const ok = await isUniqueProvider(email, provider)
      if (!ok) {
        logger.warn({ provider, email }, '[SSO] 3/5 email already used by other provider')
        return 'Already exists on other provider'
      }

      try {
        user = await User.firstOrCreate(
          { email },
          {
            email,
            fullName: fullName ?? identity.name ?? null,
            password: randomUUID() + randomUUID(),
            provider,
            providerId: identity.sub,
            isGuest: false,
            isActivated: true,
          }
        )
        logger.info({ provider, userId: user.id, email }, '[SSO] 3/5 user created/fetched')
      } catch (error) {
        logger.error({ err: error, provider, email }, '[SSO] 3/5 firstOrCreate FAILED')
        throw error
      }
    }

    try {
      const accessToken = await User.accessTokens.create(user, ['*'], {
        expiresIn: env.get('JWT_EXPIRY') as string,
      })
      logger.info({ provider, userId: user.id }, '[SSO] 4/5 access token minted')
      return { token: accessToken.toString(), user }
    } catch (error) {
      logger.error({ err: error, provider, userId: user.id }, '[SSO] 4/5 access token mint FAILED')
      throw error
    }
  }
}

export default new NativeSsoService()
