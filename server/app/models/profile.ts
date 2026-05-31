import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ProfileSchema } from '#database/schema'
import User from '#models/user'

export type ProfileLevel = 'casual' | 'competitive' | 'tryhard'
export type ProfileFormat = 'vgc' | '3v3' | 'both'
export type ProfileStyle = 'offense' | 'control' | 'balance'
export type ProfileObjective = 'learn' | 'rankup' | 'tournament'

export default class Profile extends ProfileSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
