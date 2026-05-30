import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PokemonSyncService from '#services/pokemon/pokemon_sync_service'

/**
 * Seeds moves + items first (Pokémon reference move ids), then Pokémon + Megas.
 * Run with: node ace db:seed
 */
export default class extends BaseSeeder {
  async run() {
    await PokemonSyncService.syncMoves()
    await PokemonSyncService.syncItems()
    await PokemonSyncService.syncPokemon()
    await PokemonSyncService.syncMegas()
  }
}
