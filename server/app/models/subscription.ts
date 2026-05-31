import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { SubscriptionSchema } from '#database/schema'
import User from '#models/user'

export type SubscriptionPlan = 'monthly' | 'annual'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled'

export default class Subscription extends SubscriptionSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
