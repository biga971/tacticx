import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PokemonSyncService from '#services/pokemon/pokemon_sync_service'

export default class extends BaseSeeder {
  async run() {
    await PokemonSyncService.syncItems()
  }
}
