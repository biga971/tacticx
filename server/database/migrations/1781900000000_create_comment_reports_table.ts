import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comment_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('comment_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('comments')
        .onDelete('CASCADE')
      table
        .integer('reporter_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('reason').notNullable()

      table.timestamp('created_at').notNullable()

      // A user can only report a given comment once.
      table.unique(['comment_id', 'reporter_id'])
      table.index(['comment_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
