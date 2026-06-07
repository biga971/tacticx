import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Team from '#models/team'
import TeamLike from '#models/team_like'

/** Public projection of the author — never leak email or guest flag. */
const PUBLIC_USER = { fields: ['id', 'fullName', 'initials'] }

export default class CommunityController {
  /**
   * GET /community — public feed.
   * Query: ?page, ?limit, ?format, ?style, ?regulation,
   *        ?pokemonIds=1,4,7 (teams containing all listed), ?sort=recent|likes
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = Math.min(Number(request.input('limit', 20)), 50)
    const { format, style, regulation, sort } = request.qs()
    const pokemonIds = request.input('pokemonIds')

    const query = Team.query()
      .where('is_public', true)
      .preload('slots', (s) => s.preload('pokemon'))
      .preload('user')

    if (format) query.where('format', format)
    if (style) query.where('style', style)
    if (regulation) query.where('regulation', regulation)

    if (pokemonIds) {
      const ids = String(pokemonIds)
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((x) => !Number.isNaN(x))
      for (const id of ids) {
        query.whereHas('slots', (s) => s.where('pokemon_id', id))
      }
    }

    if (sort === 'likes') {
      query.orderBy('likes_count', 'desc')
    } else {
      query.orderBy('created_at', 'desc')
    }

    const teams = await query.paginate(page, limit)
    return response.ok(teams.serialize({ relations: { user: PUBLIC_USER } }))
  }

  /**
   * GET /community/:id — public team sheet. Includes whether the current
   * user has liked it, so the client can render the heart state.
   */
  async show({ auth, params, response }: HttpContext) {
    const team = await Team.query()
      .where('id', params.id)
      .where('is_public', true)
      .preload('slots', (s) => s.preload('pokemon'))
      .preload('user')
      .first()

    if (!team) return response.notFound({ message: 'Team not found' })

    const user = auth.user
    const liked = user
      ? !!(await TeamLike.query().where('user_id', user.id).where('team_id', team.id).first())
      : false

    return response.ok({ ...team.serialize({ relations: { user: PUBLIC_USER } }), liked })
  }

  /**
   * POST /community/:id/like — toggle like for current user.
   */
  async like({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const team = await Team.query().where('id', params.id).where('is_public', true).first()
    if (!team) return response.notFound({ message: 'Team not found' })

    const existing = await TeamLike.query()
      .where('user_id', user.id)
      .where('team_id', team.id)
      .first()

    const liked = await db.transaction(async (trx) => {
      team.useTransaction(trx)
      if (existing) {
        existing.useTransaction(trx)
        await existing.delete()
        team.likesCount = Math.max(0, team.likesCount - 1)
        await team.save()
        return false
      }
      await TeamLike.create({ userId: user.id, teamId: team.id }, { client: trx })
      team.likesCount = team.likesCount + 1
      await team.save()
      return true
    })

    return response.ok({ liked, likesCount: team.likesCount })
  }
}
