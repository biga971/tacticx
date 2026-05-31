import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  declare provider: string | null
  declare providerId: string | null
  declare isActivated: boolean

  // Explicit column: the generated schema in the built image predates the
  // is_guest migration, so register it here to guarantee Lucid maps it.
  @column()
  declare isGuest: boolean

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
