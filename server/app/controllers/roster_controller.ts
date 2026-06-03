import type { HttpContext } from '@adonisjs/core/http'
import PokemonRoster from '#models/pokemon_roster'

export default class RosterController {
  /**
   * GET /roster — Champions roster (incl. Megas/regionals), paginated.
   * Shaped like the Pokédex /pokemon response so the app can reuse PokemonRow.
   * Query: ?page, ?limit, ?type, ?search.
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = Math.min(Number(request.input('limit', 30)), 100)
    const type = request.input('type')
    const search = request.input('search')

    const query = PokemonRoster.query().where('is_available', true)

    if (type) {
      query.where((b) => b.where('type_1', type).orWhere('type_2', type))
    }
    if (search) {
      const term = `%${String(search).toLowerCase()}%`
      query.where((b) => {
        b.whereRaw('LOWER(name_fr) LIKE ?', [term]).orWhereRaw('LOWER(name_en) LIKE ?', [term])
      })
    }

    query.orderBy('pokemon_id', 'asc').orderBy('is_mega', 'asc').orderBy('form', 'asc')

    const results = await query.paginate(page, limit)
    const json = results.toJSON()

    return response.ok({
      meta: json.meta,
      data: json.data.map((r) => ({
        // Composite key so base + mega forms of the same dex id stay distinct.
        key: `${r.pokemonId}-${r.form ?? 'base'}`,
        id: r.pokemonId,
        uuid: r.id,
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
      })),
    })
  }
}
