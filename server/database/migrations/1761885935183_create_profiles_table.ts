import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

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
      table.enum('level', ['casual', 'competitive', 'tryhard']).notNullable()
      table.enum('format', ['vgc', '3v3', 'both']).notNullable()
      table.enum('style', ['offense', 'control', 'balance']).notNullable()
      table.enum('objective', ['learn', 'rankup', 'tournament']).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
