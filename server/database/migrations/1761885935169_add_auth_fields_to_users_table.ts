import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('provider').nullable()
      table.string('provider_id').nullable()
      table.boolean('is_activated').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('provider')
      table.dropColumn('provider_id')
      table.dropColumn('is_activated')
    })
  }
}
