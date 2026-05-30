import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.enum('format', ['vgc', '3v3']).notNullable()
      table.string('style', 20).nullable()
      table.boolean('is_public').notNullable().defaultTo(false)
      table.integer('likes_count').notNullable().defaultTo(0)
      table.text('description').nullable()
      table.string('regulation', 20).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id'])
      table.index(['is_public'])
      table.index(['format'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
