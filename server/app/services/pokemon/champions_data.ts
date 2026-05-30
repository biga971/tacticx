/**
 * Manual Champions-specific data NOT available on PokeAPI.
 *
 * Sources to maintain these by hand:
 *  - Reg M-A list: https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_in_Pokémon_Champions
 *  - Serebii:      https://www.serebii.net/pokemonchampions/pokemon.shtml
 *  - Megas (Legends Z-A): search the web for the Champions mega roster.
 *
 * Next regulation change: 2026-06-16 (Reg M-A window end). Update + re-run sync.
 */

/**
 * PokeAPI ids legal in Regulation M-A.
 * Leave empty to mark every seeded Pokémon as NOT in Reg M-A until curated.
 * Fill from Bulbapedia, then re-run `node ace db:seed` or POST /admin/sync-pokemon.
 */
export const REG_MA_IDS: ReadonlySet<number> = new Set<number>([
  // e.g. 6 (Charizard), 9 (Blastoise), 25 (Pikachu) ...
])

/** Optional per-id regulation notes (e.g. transfer requirements). */
export const REGULATION_NOTES: Readonly<Record<number, string>> = {
  // 905: 'nécessite transfert HOME',
}

export interface ChampionsMega {
  id: number // synthetic id for the mega form (keep > 100000 to avoid PokeAPI clashes)
  megaOf: number // base PokeAPI id
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
  /** move ids inherited from base form; usually reuse the base's move pool */
  inheritMovesFrom?: number
  spriteUrl: string
}

/**
 * Champions Megas (Legends Z-A) not present on PokeAPI.
 * Add entries as the roster is confirmed. Example shape below (commented).
 */
export const CHAMPIONS_MEGAS: ReadonlyArray<ChampionsMega> = [
  // {
  //   id: 100006,
  //   megaOf: 6,
  //   nameFr: 'Méga-Dracaufeu X',
  //   nameEn: 'Mega Charizard X',
  //   type1: 'fire',
  //   type2: 'dragon',
  //   baseHp: 78, baseAtk: 130, baseDef: 111, baseSpa: 130, baseSpd: 85, baseSpe: 100,
  //   abilities: ['Tough Claws'],
  //   inheritMovesFrom: 6,
  //   spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/6.png',
  // },
]

/** Competitive items for Champions. slug must match the PokeAPI item sprite path. */
export interface CompetitiveItem {
  id: number
  slug: string
  nameFr: string
  nameEn: string
}

export const COMPETITIVE_ITEMS: ReadonlyArray<CompetitiveItem> = [
  { id: 1, slug: 'leftovers', nameFr: 'Restes', nameEn: 'Leftovers' },
  { id: 2, slug: 'choice-band', nameFr: 'Bandeau Choix', nameEn: 'Choice Band' },
  { id: 3, slug: 'choice-specs', nameFr: 'Lunettes Choix', nameEn: 'Choice Specs' },
  { id: 4, slug: 'choice-scarf', nameFr: 'Mouchoir Choix', nameEn: 'Choice Scarf' },
  { id: 5, slug: 'life-orb', nameFr: 'Orbe Vie', nameEn: 'Life Orb' },
  { id: 6, slug: 'focus-sash', nameFr: 'Ceinture Force', nameEn: 'Focus Sash' },
  { id: 7, slug: 'assault-vest', nameFr: 'Veste de Combat', nameEn: 'Assault Vest' },
  { id: 8, slug: 'rocky-helmet', nameFr: 'Casque Brut', nameEn: 'Rocky Helmet' },
  { id: 9, slug: 'sitrus-berry', nameFr: 'Baie Sitrus', nameEn: 'Sitrus Berry' },
  { id: 10, slug: 'mental-herb', nameFr: 'Herbe Mentale', nameEn: 'Mental Herb' },
  { id: 11, slug: 'safety-goggles', nameFr: 'Lunettes Filtre', nameEn: 'Safety Goggles' },
  { id: 12, slug: 'covert-cloak', nameFr: 'Cape Mystère', nameEn: 'Covert Cloak' },
  { id: 13, slug: 'clear-amulet', nameFr: 'Amulette Claire', nameEn: 'Clear Amulet' },
  { id: 14, slug: 'booster-energy', nameFr: 'Boost Énergie', nameEn: 'Booster Energy' },
]
