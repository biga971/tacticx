import { randomUUID } from 'node:crypto'
import { beforeCreate } from '@adonisjs/lucid/orm'
import { PokemonRosterSchema } from '#database/schema'

/** Exhaustive Champions roster, incl. Mega Evolutions as separate entries. */
export default class PokemonRoster extends PokemonRosterSchema {
  static table = 'pokemon_roster'

  @beforeCreate()
  static assignUuid(row: PokemonRoster) {
    if (!row.id) row.id = randomUUID()
  }
}
