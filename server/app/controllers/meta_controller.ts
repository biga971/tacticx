import type { HttpContext } from '@adonisjs/core/http'
import MetaCache from '#models/meta_cache'
import PokemonRoster from '#models/pokemon_roster'
import MoveData from '#models/move_data'
import { normalizePokemonName } from '#utils/pokemon_name'
import type { MetaFormat, MetaSource } from '#services/meta/meta_types'

/** Loose key for matching move display names against MoveData (no spaces/punct). */
function moveKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/** Shape a roster row like the Pokédex ApiPokemon so the app can reuse PokemonRow. */
function toApiPokemon(r: PokemonRoster) {
  return {
    id: r.pokemonId,
    nameFr: r.nameFr ?? r.nameEn,
    nameEn: r.nameEn,
    type1: r.type1,
    type2: r.type2,
    baseHp: r.baseHp,
    baseAtk: r.baseAtk,
    baseDef: r.baseDef,
    baseSpa: r.baseSpa,
    baseSpd: r.baseSpd,
    baseSpe: r.baseSpe,
    abilities: [],
    moves: [],
    spriteUrl: r.spriteUrl,
    isMega: r.isMega,
    megaOf: r.baseFormId,
    inRegMa: true,
    regulationNotes: null,
    form: r.form,
  }
}

// 'tournament' (gen9...regma) is real Reg M-A tournament data with win rates →
// preferred. preview/ladder are fallbacks (no win-rate column).
const SOURCE_PRIORITY: MetaSource[] = ['tournament', 'ranked_ladder', 'ranked_preview']

export default class MetaController {
  /**
   * GET /meta — meta_cache rows for a format, enriched with Pokémon display data.
   * Query: ?format=vgc|3v3, ?source, ?sort=usage|winrate, ?limit.
   * When no source is given, picks the first non-empty in priority order.
   */
  async index({ request, response }: HttpContext) {
    const format = (request.input('format', 'vgc') as MetaFormat) === '3v3' ? '3v3' : 'vgc'
    const sort = request.input('sort', 'usage') === 'winrate' ? 'winrate' : 'usage'
    const limit = Math.min(Number(request.input('limit', 50)), 100)
    let source = request.input('source') as MetaSource | undefined

    // Resolve a source with data when none requested.
    if (!source) {
      for (const candidate of SOURCE_PRIORITY) {
        const exists = await MetaCache.query()
          .where('format', format)
          .where('source', candidate)
          .first()
        if (exists) {
          source = candidate
          break
        }
      }
    }
    if (!source) return response.ok({ source: null, sort, data: [] })

    const query = MetaCache.query().where('format', format).where('source', source)
    if (sort === 'winrate') query.orderByRaw('win_rate DESC NULLS LAST')
    else query.orderByRaw('rank ASC NULLS LAST')
    const rows = await query.limit(limit)

    // Join on the roster's canonical slug (covers base + Megas + regionals).
    const roster = await PokemonRoster.query().where('regulation', 'M-A')
    const bySlug = new Map<string, PokemonRoster>()
    for (const r of roster) if (r.slug) bySlug.set(r.slug, r)

    const data = rows.map((row) => {
      const match = bySlug.get(row.pokemonName)
      return {
        pokemonName: row.pokemonName,
        rank: row.rank,
        usageRate: row.usageRate,
        winRate: row.winRate,
        moves: row.moves,
        items: row.items,
        abilities: row.abilities,
        teammates: row.teammates,
        spreads: row.spreads,
        pokemon: match ? toApiPokemon(match) : null,
      }
    })

    return response.ok({ source, sort, data })
  }

  /**
   * GET /meta/:name — single meta_cache entry by pokemonName (Showdown slug).
   * Query: ?format=vgc|3v3, ?source. Resolves source by priority when absent.
   */
  async show({ params, request, response }: HttpContext) {
    const name = String(params.name)
    const format = (request.input('format', 'vgc') as MetaFormat) === '3v3' ? '3v3' : 'vgc'
    let source = request.input('source') as MetaSource | undefined

    // Resolve a source that has this pokemon when none requested.
    if (!source) {
      for (const candidate of SOURCE_PRIORITY) {
        const exists = await MetaCache.query()
          .where('format', format)
          .where('source', candidate)
          .where('pokemon_name', name)
          .first()
        if (exists) {
          source = candidate
          break
        }
      }
    }
    if (!source) return response.notFound({ message: 'Meta entry not found' })

    const row = await MetaCache.query()
      .where('format', format)
      .where('source', source)
      .where('pokemon_name', name)
      .first()
    if (!row) return response.notFound({ message: 'Meta entry not found' })

    const match = await PokemonRoster.query()
      .where('regulation', 'M-A')
      .where('slug', name)
      .first()

    // Enrich moves with type + category from move_data (match on loose key).
    const allMoves = await MoveData.all()
    const movesByKey = new Map<string, MoveData>()
    for (const m of allMoves) {
      movesByKey.set(moveKey(m.nameEn), m)
      if (m.nameFr) movesByKey.set(moveKey(m.nameFr), m)
    }
    const moves = (row.moves ?? []).map((mv) => {
      const md = movesByKey.get(moveKey(mv.name))
      return {
        name: mv.name,
        nameFr: md?.nameFr ?? mv.name,
        usageRate: mv.usageRate,
        type: md?.type ?? null,
        category: md?.category ?? null,
      }
    })

    // Enrich teammates with sprite + display name from roster (match on slug).
    const tmSlugs = (row.teammates ?? []).map((t) => normalizePokemonName(t.name))
    const tmRoster = tmSlugs.length
      ? await PokemonRoster.query().where('regulation', 'M-A').whereIn('slug', tmSlugs)
      : []
    const tmBySlug = new Map<string, PokemonRoster>()
    for (const r of tmRoster) if (r.slug) tmBySlug.set(r.slug, r)
    const teammates = (row.teammates ?? []).map((t) => {
      const r = tmBySlug.get(normalizePokemonName(t.name))
      return {
        name: t.name,
        nameFr: r?.nameFr ?? r?.nameEn ?? t.name,
        usageRate: t.usageRate,
        spriteUrl: r?.spriteUrl ?? null,
        pokemonId: r?.pokemonId ?? null,
      }
    })

    return response.ok({
      source,
      data: {
        pokemonName: row.pokemonName,
        rank: row.rank,
        usageRate: row.usageRate,
        winRate: row.winRate,
        moves,
        items: row.items,
        abilities: row.abilities,
        teammates,
        spreads: row.spreads,
        pokemon: match ? toApiPokemon(match) : null,
      },
    })
  }
}
