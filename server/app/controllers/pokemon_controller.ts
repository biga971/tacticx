import type { HttpContext } from '@adonisjs/core/http'
import PokemonData from '#models/pokemon_data'
import MoveData from '#models/move_data'

export default class PokemonController {
  /**
   * GET /pokemon — paginated list with filters.
   * Query: ?page, ?limit, ?type, ?inRegMa=true, ?search (matches FR + EN names).
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = Math.min(Number(request.input('limit', 30)), 100)
    const type = request.input('type')
    const inRegMa = request.input('inRegMa')
    const search = request.input('search')

    const query = PokemonData.query()

    if (type) {
      query.where((b) => {
        b.where('type_1', type).orWhere('type_2', type)
      })
    }

    if (inRegMa === 'true' || inRegMa === true) {
      query.where('in_reg_ma', true)
    }

    if (search) {
      const term = `%${String(search).toLowerCase()}%`
      query.where((b) => {
        b.whereRaw('LOWER(name_fr) LIKE ?', [term]).orWhereRaw('LOWER(name_en) LIKE ?', [term])
      })
    }

    query.orderBy('id', 'asc')

    const results = await query.paginate(page, limit)
    return response.ok(results)
  }

  /**
   * GET /pokemon/:id — detail with resolved move objects.
   */
  async show({ params, response }: HttpContext) {
    const pokemon = await PokemonData.find(params.id)
    if (!pokemon) {
      return response.notFound({ message: 'Pokemon not found' })
    }

    const moves = pokemon.moves?.length
      ? await MoveData.query().whereIn('id', pokemon.moves).orderBy('name_en', 'asc')
      : []

    return response.ok({
      ...pokemon.serialize(),
      moveDetails: moves.map((m) => m.serialize()),
    })
  }
}
