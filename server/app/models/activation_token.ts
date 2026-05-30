import { ActivationTokenSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ActivationToken extends ActivationTokenSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
