import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'move_data'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').primary().notNullable()
      table.string('name_fr', 100).notNullable()
      table.string('name_en', 100).notNullable()
      table.string('type', 20).notNullable()
      // 'physical' | 'special' | 'status'
      table.string('category', 20).notNullable()
      table.integer('power').nullable()
      table.integer('accuracy').nullable()
      table.integer('pp').notNullable()
      table.text('description_fr').nullable()

      table.index(['type'])
      table.index(['category'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
