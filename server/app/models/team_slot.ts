import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Team from '#models/team'
import PokemonData from '#models/pokemon_data'

export default class TeamSlot extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teamId: number

  @column()
  declare slotIndex: number

  @column()
  declare pokemonId: number

  @column()
  declare nickname: string | null

  @column()
  declare nature: string

  @column()
  declare ability: string

  @column()
  declare item: string | null

  @column()
  declare move1: string | null

  @column()
  declare move2: string | null

  @column()
  declare move3: string | null

  @column()
  declare move4: string | null

  @column()
  declare spHp: number

  @column()
  declare spAtk: number

  @column()
  declare spDef: number

  @column()
  declare spSpa: number

  @column()
  declare spSpd: number

  @column()
  declare spSpe: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>

  @belongsTo(() => PokemonData, { foreignKey: 'pokemonId' })
  declare pokemon: BelongsTo<typeof PokemonData>
}
