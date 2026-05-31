import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { TeamSchema } from '#database/schema'
import User from '#models/user'
import TeamSlot from '#models/team_slot'

export type TeamFormat = 'vgc' | '3v3'

export default class Team extends TeamSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TeamSlot)
  declare slots: HasMany<typeof TeamSlot>
}
