import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type ProfileLevel = 'casual' | 'competitive' | 'tryhard'
export type ProfileFormat = 'vgc' | '3v3' | 'both'
export type ProfileStyle = 'offense' | 'control' | 'balance'
export type ProfileObjective = 'learn' | 'rankup' | 'tournament'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare level: ProfileLevel

  @column()
  declare format: ProfileFormat

  @column()
  declare style: ProfileStyle

  @column()
  declare objective: ProfileObjective

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
