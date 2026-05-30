import type { HttpContext } from '@adonisjs/core/http'
import ItemData from '#models/item_data'

export default class ItemController {
  /**
   * GET /items — full competitive item list (small, returned unpaginated).
   */
  async index({ response }: HttpContext) {
    const items = await ItemData.query().orderBy('name_fr', 'asc')
    return response.ok(items)
  }
}
