import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/**
 * Read-only buffer model. Data comes from PokemonSeeder.
 * The app never queries PokeAPI at runtime — everything is pre-seeded here.
 */
export default class PokemonData extends BaseModel {
  static table = 'pokemon_data'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nameFr: string

  @column()
  declare nameEn: string

  @column()
  declare type1: string

  @column()
  declare type2: string | null

  @column()
  declare baseHp: number

  @column()
  declare baseAtk: number

  @column()
  declare baseDef: number

  @column()
  declare baseSpa: number

  @column()
  declare baseSpd: number

  @column()
  declare baseSpe: number

  @column({
    prepare: (value: string[]) => JSON.stringify(value ?? []),
    consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : (value ?? [])),
  })
  declare abilities: string[]

  @column({
    prepare: (value: number[]) => JSON.stringify(value ?? []),
    consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : (value ?? [])),
  })
  declare moves: number[]

  @column()
  declare spriteUrl: string

  @column()
  declare isMega: boolean

  @column()
  declare megaOf: number | null

  @column()
  declare inRegMa: boolean

  @column()
  declare regulationNotes: string | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
