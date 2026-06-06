import type { HttpContext } from '@adonisjs/core/http'
import Team from '#models/team'
import Comment from '#models/comment'
import { storeCommentValidator } from '#validators/team'

/** Public projection of the commenter — never leak email or guest flag. */
const PUBLIC_USER = { fields: ['id', 'fullName', 'initials'] }

export default class CommentController {
  /**
   * GET /community/:id/comments — comments on a public team.
   */
  async index({ params, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = Math.min(Number(request.input('limit', 30)), 100)

    const team = await Team.query().where('id', params.id).where('is_public', true).first()
    if (!team) return response.notFound({ message: 'Team not found' })

    const comments = await Comment.query()
      .where('team_id', team.id)
      .preload('user')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    return response.ok(comments.serialize({ relations: { user: PUBLIC_USER } }))
  }

  /**
   * POST /community/:id/comments — add a comment (premium gated via middleware).
   */
  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const team = await Team.query().where('id', params.id).where('is_public', true).first()
    if (!team) return response.notFound({ message: 'Team not found' })

    const { content } = await request.validateUsing(storeCommentValidator)
    const comment = await Comment.create({ userId: user.id, teamId: team.id, content })
    await comment.load('user')

    return response.created(comment.serialize({ relations: { user: PUBLIC_USER } }))
  }
}
