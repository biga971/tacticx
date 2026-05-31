import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { TeamSlotSchema } from '#database/schema'
import Team from '#models/team'
import PokemonData from '#models/pokemon_data'

export default class TeamSlot extends TeamSlotSchema {
  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>

  @belongsTo(() => PokemonData, { foreignKey: 'pokemonId' })
  declare pokemon: BelongsTo<typeof PokemonData>
}
