import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Team from '#models/team'
import { storeTeamValidator, updateTeamValidator } from '#validators/team'

export default class TeamController {
  /**
   * GET /teams — current user's teams. Optional ?format filter.
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const format = request.input('format')

    const query = Team.query()
      .where('user_id', user.id)
      .preload('slots', (s) => s.preload('pokemon'))
      .orderBy('updated_at', 'desc')

    if (format) query.where('format', format)

    const teams = await query
    return response.ok(teams)
  }

  /**
   * GET /teams/:id — owned team detail.
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const team = await Team.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('slots', (s) => s.preload('pokemon'))
      .first()

    if (!team) return response.notFound({ message: 'Team not found' })
    return response.ok(team)
  }

  /**
   * POST /teams — create team with its slots.
   */
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(storeTeamValidator)

    const team = await db.transaction(async (trx) => {
      const created = await Team.create(
        {
          userId: user.id,
          name: payload.name,
          format: payload.format,
          style: payload.style ?? null,
          description: payload.description ?? null,
          regulation: payload.regulation ?? null,
        },
        { client: trx }
      )

      if (payload.slots?.length) {
        await created.related('slots').createMany(payload.slots)
      }

      return created
    })

    await team.load('slots', (s) => s.preload('pokemon'))
    return response.created(team)
  }

  /**
   * PUT /teams/:id — update team. If slots provided, replaces all slots.
   */
  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const team = await Team.query().where('id', params.id).where('user_id', user.id).first()
    if (!team) return response.notFound({ message: 'Team not found' })

    const payload = await request.validateUsing(updateTeamValidator)

    await db.transaction(async (trx) => {
      team.useTransaction(trx)
      team.merge({
        name: payload.name ?? team.name,
        format: payload.format ?? team.format,
        style: payload.style ?? team.style,
        description: payload.description ?? team.description,
        regulation: payload.regulation ?? team.regulation,
      })
      await team.save()

      if (payload.slots) {
        await team.related('slots').query().delete()
        if (payload.slots.length) {
          await team.related('slots').createMany(payload.slots)
        }
      }
    })

    await team.load('slots', (s) => s.preload('pokemon'))
    return response.ok(team)
  }

  /**
   * DELETE /teams/:id
   */
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const team = await Team.query().where('id', params.id).where('user_id', user.id).first()
    if (!team) return response.notFound({ message: 'Team not found' })

    await team.delete()
    return response.noContent()
  }

  /**
   * POST /teams/:id/publish — make team public (open to all users).
   */
  async publish({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const team = await Team.query().where('id', params.id).where('user_id', user.id).first()
    if (!team) return response.notFound({ message: 'Team not found' })

    team.isPublic = true
    await team.save()
    return response.ok(team)
  }
}
