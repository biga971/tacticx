import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { CommentSchema } from '#database/schema'
import User from '#models/user'
import Team from '#models/team'

export default class Comment extends CommentSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>
}
