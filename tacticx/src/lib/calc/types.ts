import type { PokemonType } from '@/lib/theme'
import type { StatKey } from '@/lib/data/natures'

export type { StatKey }

export type BaseStats = Record<StatKey, number>

/** A configured Pokémon in a team slot (calc-relevant fields only). */
export interface PokemonSlot {
  pokemonId: number
  types: PokemonType[]
  base: BaseStats
  /** Speed-power points (Champions): 0-32 per stat, 1 SP = +1 stat. */
  sp: BaseStats
  nature: string
  ability?: string
  item?: string
  /** Move types known by this slot (for offensive coverage). */
  moveTypes?: PokemonType[]
}

export const ALL_STATS: StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']

/** Fixed competitive level for every Champions calculation. */
export const CHAMPIONS_LEVEL = 50
