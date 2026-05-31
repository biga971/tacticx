import { PokemonDataSchema } from '#database/schema'

/**
 * Read-only buffer model. Data comes from PokemonSeeder.
 * The app never queries PokeAPI at runtime — everything is pre-seeded here.
 */
export default class PokemonData extends PokemonDataSchema {}
