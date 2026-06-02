/** Shared shapes for meta-data parsing (Pikalytics + Smogon). */

export type MetaFormat = 'vgc' | '3v3'
export type MetaSource = 'ranked_preview' | 'tournament' | 'ranked_ladder'

export type SyncJobType = 'pikalytics' | 'smogon' | 'roster'
export type SyncStatus = 'started' | 'completed' | 'failed'

export interface BaseStats {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

export interface UsageEntry {
  name: string
  usageRate: number
}

export interface SpreadEntry {
  spreadString: string
  nature: string | null
  usageRate: number
}

/** A single Pokémon's parsed meta detail. */
export interface PokemonMeta {
  pokemonName: string // normalised slug
  rank: number | null
  usageRate: number | null
  winRate: number | null
  moves: UsageEntry[]
  items: UsageEntry[]
  abilities: UsageEntry[]
  teammates: UsageEntry[]
  spreads: SpreadEntry[]
  rawData?: string | null
}
