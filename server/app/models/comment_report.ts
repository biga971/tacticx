import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { CommentReportSchema } from '#database/schema'
import User from '#models/user'
import Comment from '#models/comment'

export default class CommentReport extends CommentReportSchema {
  @belongsTo(() => Comment)
  declare comment: BelongsTo<typeof Comment>

  @belongsTo(() => User, { foreignKey: 'reporterId' })
  declare reporter: BelongsTo<typeof User>
}
