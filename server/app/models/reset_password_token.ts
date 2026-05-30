import { ResetPasswordTokenSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ResetPasswordToken extends ResetPasswordTokenSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
