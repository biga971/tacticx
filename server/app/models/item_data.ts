import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ItemData extends BaseModel {
  static table = 'item_data'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare nameFr: string

  @column()
  declare nameEn: string

  @column()
  declare spriteUrl: string
}
