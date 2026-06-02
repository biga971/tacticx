import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import SyncLog, { type SyncJobType } from '#models/sync_log'
import MetaCache from '#models/meta_cache'
import PokemonRoster from '#models/pokemon_roster'
import PikalyticsService from '#services/meta/pikalytics_service'
import SmogonService from '#services/meta/smogon_service'
import RosterService from '#services/meta/roster_service'

/**
 * Runs a sync job in the background and records its lifecycle in sync_logs.
 * Never throws — failures are logged and persisted, not propagated.
 */
async function runJob(jobType: SyncJobType, fn: () => Promise<number>): Promise<void> {
  const start = Date.now()
  const log = await SyncLog.create({
    jobType,
    status: 'started',
    recordsUpserted: 0,
    triggeredBy: 'n8n',
  })
  logger.info(`[sync:${jobType}] started`)

  try {
    const count = await fn()
    log.merge({ status: 'completed', recordsUpserted: count, durationMs: Date.now() - start })
    await log.save()
    logger.info(`[sync:${jobType}] completed — ${count} records upserted`)
  } catch (err) {
    log.merge({
      status: 'failed',
      errorMessage: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    })
    await log.save()
    logger.error({ err }, `[sync:${jobType}] failed`)
  }
}

export default class SyncController {
  /** POST /internal/sync/meta/pikalytics — n8n (Mon + Thu). */
  async pikalytics({ response }: HttpContext) {
    void runJob('pikalytics', () => PikalyticsService.sync())
    return response.accepted({ job: 'queued' })
  }

  /** POST /internal/sync/meta/smogon — n8n (monthly, 1st). */
  async smogon({ response }: HttpContext) {
    void runJob('smogon', () => SmogonService.sync())
    return response.accepted({ job: 'queued' })
  }

  /** POST /internal/sync/roster — n8n (manual / monthly). */
  async roster({ response }: HttpContext) {
    void runJob('roster', () => RosterService.sync())
    return response.accepted({ job: 'queued' })
  }

  /**
   * GET /internal/sync/status — inspect recent runs + row counts.
   * Tells you whether a job completed (status, records_upserted, duration, error).
   */
  async status({ request, response }: HttpContext) {
    const limit = Math.min(Number(request.input('limit', 10)) || 10, 50)
    const logs = await SyncLog.query().orderBy('createdAt', 'desc').limit(limit)
    const metaCount = await MetaCache.query().count('* as total')
    const rosterCount = await PokemonRoster.query().count('* as total')

    return response.ok({
      counts: {
        metaCache: Number(metaCount[0].$extras.total),
        roster: Number(rosterCount[0].$extras.total),
      },
      logs: logs.map((l) => ({
        jobType: l.jobType,
        status: l.status,
        recordsUpserted: l.recordsUpserted,
        durationMs: l.durationMs,
        errorMessage: l.errorMessage,
        createdAt: l.createdAt,
      })),
    })
  }
}
