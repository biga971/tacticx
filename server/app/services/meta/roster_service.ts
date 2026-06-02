import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import PokemonRoster from '#models/pokemon_roster'
import { normalizePokemonName } from '#utils/pokemon_name'
import { fetchJson, sleep } from '#services/meta/http'

const ROSTER_JSON =
  'https://raw.githubusercontent.com/otterlyclueless/pokemon-champions-data/main/pokemon/roster.json'
const POKEAPI = 'https://pokeapi.co/api/v2'
const SPRITES_HOME = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home'
const POKEAPI_DELAY = 700 // ~85 req/min, under the 100/min budget

/** Raw shape of an entry in roster.json. */
interface RawRosterEntry {
  name: string
  dexNumber: number
  types: string[]
  form: string // 'Base' | 'Mega' | 'Hisui' | ...
  abilities?: Record<string, string>
  championsVerified?: boolean
}

interface NormalizedEntry {
  pokemonId: number
  nameEn: string
  form: string | null // null | 'mega' | 'mega-x' | 'mega-y' | 'hisui' ...
  isMega: boolean
  types: string[]
  isAvailable: boolean
  /** PokeAPI slug used to fetch base stats + sprite. */
  apiSlug: string
}

function normalizeEntry(raw: RawRosterEntry): NormalizedEntry {
  const isMega = /mega/i.test(raw.form)
  const xy = raw.name.match(/\b([XY])\s*$/i)

  let form: string | null
  if (/^base$/i.test(raw.form)) form = null
  else if (isMega) form = 'mega' + (xy ? `-${xy[1].toLowerCase()}` : '')
  else form = normalizePokemonName(raw.form)

  // Build the PokeAPI slug. Base → dex id; Mega → "<base>-mega[-x|-y]".
  let apiSlug: string
  if (isMega) {
    const base = raw.name.replace(/^mega\s+/i, '').replace(/\s+[XY]$/i, '')
    apiSlug = `${normalizePokemonName(base)}-mega${xy ? `-${xy[1].toLowerCase()}` : ''}`
  } else if (form) {
    apiSlug = normalizePokemonName(raw.name)
  } else {
    apiSlug = String(raw.dexNumber)
  }

  return {
    pokemonId: raw.dexNumber,
    nameEn: raw.name,
    form,
    isMega,
    types: (raw.types ?? []).map((t) => t.toLowerCase()),
    isAvailable: raw.championsVerified !== false,
    apiSlug,
  }
}

function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/)
  return m ? Number(m[1]) : 0
}

interface Enriched {
  spriteId: number
  speciesId: number
  baseStats: Record<string, number>
}

const STAT_MAP: Record<string, string> = {
  hp: 'hp',
  attack: 'atk',
  defense: 'def',
  'special-attack': 'spa',
  'special-defense': 'spd',
  speed: 'spe',
}

async function enrichFromPokeApi(slug: string): Promise<Enriched | null> {
  const poke = await fetchJson<any>(`${POKEAPI}/pokemon/${slug}`)
  await sleep(POKEAPI_DELAY)
  if (!poke) return null
  const baseStats: Record<string, number> = {}
  for (const s of poke.stats ?? []) {
    const key = STAT_MAP[s.stat?.name]
    if (key) baseStats[key] = s.base_stat
  }
  return {
    spriteId: poke.id,
    speciesId: poke.species?.url ? idFromUrl(poke.species.url) : poke.id,
    baseStats,
  }
}

async function frName(speciesId: number): Promise<string | null> {
  const species = await fetchJson<any>(`${POKEAPI}/pokemon-species/${speciesId}`)
  await sleep(POKEAPI_DELAY)
  const fr = species?.names?.find((n: any) => n.language?.name === 'fr')
  return fr?.name ?? null
}

class RosterService {
  /** Build the Champions roster (incl. Megas) by crossing roster.json + PokeAPI. */
  async sync(): Promise<number> {
    const raw = await fetchJson<RawRosterEntry[]>(ROSTER_JSON)
    if (!raw || !Array.isArray(raw)) {
      logger.warn('[roster] roster.json unavailable or malformed — aborting roster sync')
      return 0
    }
    logger.info(`[roster] ${raw.length} roster entries`)

    let upserted = 0
    for (const rawEntry of raw) {
      try {
        const entry = normalizeEntry(rawEntry)

        // Enrich with base stats + sprite. Fallback to the base dex id so a
        // missing Mega form on PokeAPI still produces a usable entry.
        const enriched =
          (await enrichFromPokeApi(entry.apiSlug)) ??
          (entry.isMega ? await enrichFromPokeApi(String(entry.pokemonId)) : null)

        const speciesId = enriched?.speciesId ?? entry.pokemonId
        const spriteId = enriched?.spriteId ?? entry.pokemonId
        const nameFr = await frName(speciesId)

        const stats = enriched?.baseStats ?? {}
        await PokemonRoster.updateOrCreate(
          { pokemonId: entry.pokemonId, form: entry.form, regulation: 'M-A' },
          {
            nameEn: entry.nameEn,
            nameFr,
            baseFormId: entry.isMega ? entry.pokemonId : null,
            type1: entry.types[0] ?? null,
            type2: entry.types[1] ?? null,
            baseHp: stats.hp ?? null,
            baseAtk: stats.atk ?? null,
            baseDef: stats.def ?? null,
            baseSpa: stats.spa ?? null,
            baseSpd: stats.spd ?? null,
            baseSpe: stats.spe ?? null,
            isMega: entry.isMega,
            isAvailable: entry.isAvailable,
            spriteUrl: `${SPRITES_HOME}/${spriteId}.png`,
            rawData: rawEntry as unknown as Record<string, unknown>,
            syncedAt: DateTime.now(),
          }
        )
        upserted++
      } catch (err) {
        logger.error({ err, pokemon: rawEntry?.name }, '[roster] skip Pokémon')
      }
    }
    return upserted
  }
}

export default new RosterService()
