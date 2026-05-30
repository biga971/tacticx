import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TeamSlot from '#models/team_slot'

export type TeamFormat = 'vgc' | '3v3'

export default class Team extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare format: TeamFormat

  @column()
  declare style: string | null

  @column()
  declare isPublic: boolean

  @column()
  declare likesCount: number

  @column()
  declare description: string | null

  @column()
  declare regulation: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TeamSlot)
  declare slots: HasMany<typeof TeamSlot>
}
