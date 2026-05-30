import { BaseModel, column } from '@adonisjs/lucid/orm'

export type MoveCategory = 'physical' | 'special' | 'status'

export default class MoveData extends BaseModel {
  static table = 'move_data'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nameFr: string

  @column()
  declare nameEn: string

  @column()
  declare type: string

  @column()
  declare category: MoveCategory

  @column()
  declare power: number | null

  @column()
  declare accuracy: number | null

  @column()
  declare pp: number

  @column()
  declare descriptionFr: string | null
}
