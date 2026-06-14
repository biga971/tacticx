import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import CommentReport from '#models/comment_report'
import { reportCommentValidator } from '#validators/moderation'

export default class CommentReportsController {
  /**
   * POST /comments/:commentId/report — flag a comment as inappropriate.
   * Idempotent: re-reporting the same comment updates the reason and succeeds.
   */
  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { reason } = await request.validateUsing(reportCommentValidator)

    const comment = await Comment.find(params.commentId)
    if (!comment) return response.notFound({ message: 'Comment not found' })
    if (comment.userId === user.id) {
      return response.forbidden({ message: 'You cannot report your own comment' })
    }

    await CommentReport.updateOrCreate(
      { commentId: comment.id, reporterId: user.id },
      { commentId: comment.id, reporterId: user.id, reason }
    )

    return response.ok({ reported: true })
  }
}
