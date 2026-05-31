import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { TeamLikeSchema } from '#database/schema'
import User from '#models/user'
import Team from '#models/team'

export default class TeamLike extends TeamLikeSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>
}
