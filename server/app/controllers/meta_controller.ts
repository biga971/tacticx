import type { HttpContext } from '@adonisjs/core/http'
import MetaCache from '#models/meta_cache'
import PokemonRoster from '#models/pokemon_roster'
import type { MetaFormat, MetaSource } from '#services/meta/meta_types'

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
}
