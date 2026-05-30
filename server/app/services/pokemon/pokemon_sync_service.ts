import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import PokemonData from '#models/pokemon_data'
import MoveData from '#models/move_data'
import ItemData from '#models/item_data'
import {
  REG_MA_IDS,
  REGULATION_NOTES,
  CHAMPIONS_MEGAS,
  COMPETITIVE_ITEMS,
} from '#services/pokemon/champions_data'

const POKEAPI = 'https://pokeapi.co/api/v2'
const SPRITES_HOME =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home'
const SPRITES_ITEMS = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'

const POKEMON_LIMIT = 1025
const MOVE_LIMIT = 1000
const CONCURRENCY = 8

/** Bounded-concurrency map. Keeps PokeAPI happy (fair-use policy). */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

async function fetchJson<T = any>(url: string, retries = 3): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return (await res.json()) as T
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
  throw new Error(`unreachable: ${url}`)
}

function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/)
  return m ? Number(m[1]) : 0
}

function nameByLang(names: any[], lang: string): string | null {
  const entry = names?.find((n) => n.language?.name === lang)
  return entry?.name ?? null
}

class PokemonSyncService {
  /** Full buffer rebuild: moves, items, pokemon, then Champions patches. */
  async syncAll() {
    const moves = await this.syncMoves()
    const items = await this.syncItems()
    const pokemon = await this.syncPokemon()
    const megas = await this.syncMegas()
    return { moves, items, pokemon, megas }
  }

  async syncMoves(): Promise<number> {
    logger.info('Syncing moves from PokeAPI…')
    const list = await fetchJson<{ results: { url: string }[] }>(
      `${POKEAPI}/move?limit=${MOVE_LIMIT}`
    )

    const rows: Partial<MoveData>[] = []
    await mapLimit(list.results, CONCURRENCY, async (r) => {
      try {
        const d = await fetchJson<any>(r.url)
        rows.push({
          id: d.id,
          nameEn: d.name,
          nameFr: nameByLang(d.names, 'fr') ?? d.name,
          type: d.type?.name ?? 'normal',
          category: (d.damage_class?.name ?? 'status') as any,
          power: d.power ?? null,
          accuracy: d.accuracy ?? null,
          pp: d.pp ?? 0,
          descriptionFr:
            d.flavor_text_entries?.find((f: any) => f.language?.name === 'fr')?.flavor_text ?? null,
        })
      } catch (err) {
        logger.warn(`move fetch failed: ${r.url} (${(err as Error).message})`)
      }
    })

    await MoveData.updateOrCreateMany('id', rows as any)
    logger.info(`Moves synced: ${rows.length}`)
    return rows.length
  }

  async syncItems(): Promise<number> {
    logger.info('Syncing competitive items…')
    const rows = COMPETITIVE_ITEMS.map((it) => ({
      id: it.id,
      slug: it.slug,
      nameFr: it.nameFr,
      nameEn: it.nameEn,
      spriteUrl: `${SPRITES_ITEMS}/${it.slug}.png`,
    }))
    await ItemData.updateOrCreateMany('id', rows as any)
    logger.info(`Items synced: ${rows.length}`)
    return rows.length
  }

  async syncPokemon(): Promise<number> {
    logger.info('Syncing Pokémon from PokeAPI…')
    const list = await fetchJson<{ results: { url: string }[] }>(
      `${POKEAPI}/pokemon?limit=${POKEMON_LIMIT}`
    )

    if (REG_MA_IDS.size === 0) {
      logger.warn(
        'REG_MA_IDS is empty — every Pokémon will be flagged in_reg_ma=false. Fill champions_data.ts.'
      )
    }

    const rows: Partial<PokemonData>[] = []
    await mapLimit(list.results, CONCURRENCY, async (r) => {
      const id = idFromUrl(r.url)
      try {
        const [p, species] = await Promise.all([
          fetchJson<any>(`${POKEAPI}/pokemon/${id}`),
          fetchJson<any>(`${POKEAPI}/pokemon-species/${id}`).catch(() => null),
        ])

        const stat = (key: string) =>
          p.stats?.find((s: any) => s.stat?.name === key)?.base_stat ?? 0

        const types: string[] = (p.types ?? [])
          .sort((a: any, b: any) => a.slot - b.slot)
          .map((t: any) => t.type?.name)

        rows.push({
          id,
          nameEn: species ? (nameByLang(species.names, 'en') ?? p.name) : p.name,
          nameFr: species ? (nameByLang(species.names, 'fr') ?? p.name) : p.name,
          type1: types[0] ?? 'normal',
          type2: types[1] ?? null,
          baseHp: stat('hp'),
          baseAtk: stat('attack'),
          baseDef: stat('defense'),
          baseSpa: stat('special-attack'),
          baseSpd: stat('special-defense'),
          baseSpe: stat('speed'),
          abilities: (p.abilities ?? []).map((a: any) => a.ability?.name).filter(Boolean),
          moves: (p.moves ?? []).map((m: any) => idFromUrl(m.move?.url)).filter(Boolean),
          spriteUrl: `${SPRITES_HOME}/${id}.png`,
          isMega: false,
          megaOf: null,
          inRegMa: REG_MA_IDS.has(id),
          regulationNotes: REGULATION_NOTES[id] ?? null,
          updatedAt: DateTime.now(),
        })
      } catch (err) {
        logger.warn(`pokemon ${id} fetch failed (${(err as Error).message})`)
      }
    })

    await PokemonData.updateOrCreateMany('id', rows as any)
    logger.info(`Pokémon synced: ${rows.length}`)
    return rows.length
  }

  /** Insert manual Champions Megas, inheriting move pools from base forms. */
  async syncMegas(): Promise<number> {
    if (CHAMPIONS_MEGAS.length === 0) return 0
    logger.info('Inserting Champions Megas…')

    const rows: Partial<PokemonData>[] = []
    for (const m of CHAMPIONS_MEGAS) {
      let moves: number[] = []
      if (m.inheritMovesFrom) {
        const base = await PokemonData.find(m.inheritMovesFrom)
        moves = base?.moves ?? []
      }
      rows.push({
        id: m.id,
        nameEn: m.nameEn,
        nameFr: m.nameFr,
        type1: m.type1,
        type2: m.type2,
        baseHp: m.baseHp,
        baseAtk: m.baseAtk,
        baseDef: m.baseDef,
        baseSpa: m.baseSpa,
        baseSpd: m.baseSpd,
        baseSpe: m.baseSpe,
        abilities: m.abilities,
        moves,
        spriteUrl: m.spriteUrl,
        isMega: true,
        megaOf: m.megaOf,
        inRegMa: REG_MA_IDS.has(m.id),
        regulationNotes: REGULATION_NOTES[m.id] ?? null,
        updatedAt: DateTime.now(),
      })
    }

    await PokemonData.updateOrCreateMany('id', rows as any)
    logger.info(`Megas inserted: ${rows.length}`)
    return rows.length
  }
}

export default new PokemonSyncService()
