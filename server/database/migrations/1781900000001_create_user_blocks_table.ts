import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('blocker_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('blocked_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamp('created_at').notNullable()

      // A user can only block another user once.
      table.unique(['blocker_id', 'blocked_id'])
      table.index(['blocker_id'])
    })

    // A user cannot block themselves (defense-in-depth; also guarded in controller).
    this.schema.raw(
      'ALTER TABLE user_blocks ADD CONSTRAINT chk_no_self_block CHECK (blocker_id <> blocked_id)'
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
