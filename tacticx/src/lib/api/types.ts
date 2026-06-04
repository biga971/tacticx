/** Serialized API shapes (Lucid camelCases columns; paginator wraps in meta+data). */

export interface Paginated<T> {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    hasMorePages?: boolean
  }
  data: T[]
}

export interface ApiPokemon {
  id: number
  nameFr: string
  nameEn: string
  type1: string
  type2: string | null
  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpa: number
  baseSpd: number
  baseSpe: number
  abilities: string[]
  moves: number[]
  spriteUrl: string
  isMega: boolean
  megaOf: number | null
  inRegMa: boolean
  regulationNotes: string | null
}

export interface ApiItem {
  id: number
  slug: string
  nameFr: string
  nameEn: string
  spriteUrl: string
}

export interface ApiMove {
  id: number
  nameFr: string
  nameEn: string
  type: string
  category: 'physical' | 'special' | 'status'
  power: number | null
  accuracy: number | null
  pp: number
  descriptionFr: string | null
}

export interface ApiPokemonDetail extends ApiPokemon {
  moveDetails: ApiMove[]
}

export interface ApiTeamSlot {
  id: number
  teamId: number
  slotIndex: number
  pokemonId: number
  nickname: string | null
  nature: string
  ability: string
  item: string | null
  move1: string | null
  move2: string | null
  move3: string | null
  move4: string | null
  spHp: number
  spAtk: number
  spDef: number
  spSpa: number
  spSpd: number
  spSpe: number
  pokemon?: ApiPokemon
}

export interface ApiUserPublic {
  id: number
  fullName: string | null
  initials: string
}

export interface ApiTeam {
  id: number
  userId: number
  name: string
  format: 'vgc' | '3v3'
  style: string | null
  isPublic: boolean
  likesCount: number
  description: string | null
  regulation: string | null
  slots: ApiTeamSlot[]
  user?: ApiUserPublic
  createdAt: string
  updatedAt: string | null
}

export interface ApiProfile {
  id: number
  userId: number
  level: 'casual' | 'competitive' | 'tryhard'
  format: 'vgc' | '3v3' | 'both'
  style: 'offense' | 'control' | 'balance'
  objective: 'learn' | 'rankup' | 'tournament'
}

export interface ApiSubscriptionStatus {
  isPremium: boolean
  subscription: {
    id: number
    plan: 'monthly' | 'annual'
    status: 'active' | 'expired' | 'cancelled'
    expiresAt: string | null
  } | null
}

export interface ApiComment {
  id: number
  userId: number
  teamId: number
  content: string
  createdAt: string
  user?: ApiUserPublic
}

export interface PokemonFilters {
  type?: string
  inRegMa?: boolean
  search?: string
  page?: number
  limit?: number
}

/** Champions roster entry (shaped like ApiPokemon + form metadata). */
export interface ApiRosterPokemon extends ApiPokemon {
  key: string
  uuid: string
  form: string | null
}

export interface ApiUsageEntry {
  name: string
  usageRate: number
}

export interface ApiSpreadEntry {
  spreadString: string
  nature: string | null
  usageRate: number
}

export interface ApiMetaEntry {
  pokemonName: string
  rank: number | null
  usageRate: number | null
  winRate: number | null
  moves: ApiUsageEntry[]
  items: ApiUsageEntry[]
  abilities: ApiUsageEntry[]
  teammates: ApiUsageEntry[]
  spreads: ApiSpreadEntry[]
  pokemon: ApiPokemon | null
}

export interface ApiMetaResponse {
  source: string | null
  sort: 'usage' | 'winrate'
  data: ApiMetaEntry[]
}

export interface ApiMetaMove {
  name: string
  nameFr: string
  usageRate: number
  type: string | null
  category: 'physical' | 'special' | 'status' | null
}

export interface ApiMetaTeammate {
  name: string
  nameFr: string
  usageRate: number
  spriteUrl: string | null
  pokemonId: number | null
}

export interface ApiMetaDetail {
  pokemonName: string
  rank: number | null
  usageRate: number | null
  winRate: number | null
  moves: ApiMetaMove[]
  items: ApiUsageEntry[]
  abilities: ApiUsageEntry[]
  teammates: ApiMetaTeammate[]
  spreads: ApiSpreadEntry[]
  pokemon: ApiPokemon | null
}

export interface ApiMetaDetailResponse {
  source: string
  data: ApiMetaDetail
}

export interface CommunityFilters {
  format?: string
  style?: string
  regulation?: string
  pokemonIds?: number[]
  sort?: 'recent' | 'likes'
  page?: number
  limit?: number
}
