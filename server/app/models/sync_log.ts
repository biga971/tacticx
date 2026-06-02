import { randomUUID } from 'node:crypto'
import { beforeCreate } from '@adonisjs/lucid/orm'
import { SyncLogSchema } from '#database/schema'

export type { SyncJobType, SyncStatus } from '#services/meta/meta_types'

/** Traceability row for each sync run. */
export default class SyncLog extends SyncLogSchema {
  @beforeCreate()
  static assignUuid(row: SyncLog) {
    if (!row.id) row.id = randomUUID()
  }
}
