import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'item_data'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary().notNullable()
      table.string('slug', 100).notNullable()
      table.string('name_fr', 100).notNullable()
      table.string('name_en', 100).notNullable()
      table.string('sprite_url', 255).notNullable()

      table.index(['slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
