import type { HttpContext } from '@adonisjs/core/http'
import MetaCache from '#models/meta_cache'
import PokemonData from '#models/pokemon_data'
import { normalizePokemonName } from '#utils/pokemon_name'
import type { MetaFormat, MetaSource } from '#services/meta/meta_types'

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

    // Build a slug → Pokémon lookup once for enrichment.
    const pokemon = await PokemonData.all()
    const bySlug = new Map<string, PokemonData>()
    for (const p of pokemon) bySlug.set(normalizePokemonName(p.nameEn), p)

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
        pokemon: match ? match.serialize() : null,
      }
    })

    return response.ok({ source, sort, data })
  }
}
