import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import PokemonSyncService from '#services/pokemon/pokemon_sync_service'

export default class AdminController {
  /**
   * POST /admin/sync-pokemon — re-sync the Pokémon buffer without redeploying.
   * Auth: header `Authorization: Bearer <ADMIN_SYNC_TOKEN>`.
   */
  async syncPokemon({ request, response }: HttpContext) {
    const token = env.get('ADMIN_SYNC_TOKEN')
    const authHeader = request.header('authorization')
    if (!token || authHeader !== `Bearer ${token}`) {
      return response.unauthorized({ message: 'Invalid admin token' })
    }

    const summary = await PokemonSyncService.syncAll()
    return response.ok({ message: 'Sync complete', ...summary })
  }
}
