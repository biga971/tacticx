import { randomUUID } from 'node:crypto'
import { beforeCreate } from '@adonisjs/lucid/orm'
import { MetaCacheSchema } from '#database/schema'

/** Cached competitive meta per Pokémon, per format/source. Upserted by sync jobs. */
export default class MetaCache extends MetaCacheSchema {
  static table = 'meta_cache'

  @beforeCreate()
  static assignUuid(row: MetaCache) {
    if (!row.id) row.id = randomUUID()
  }
}
