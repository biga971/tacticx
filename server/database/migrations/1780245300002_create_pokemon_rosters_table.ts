import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pokemon_roster'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.integer('pokemon_id').notNullable() // national dex id
      table.string('name_en').notNullable()
      table.string('name_fr').nullable()
      table.string('form').nullable() // null | 'mega' | 'hisui' | 'alola' ...
      table.integer('base_form_id').nullable() // mega → base pokemon id
      table.jsonb('types').notNullable().defaultTo('[]')
      table.jsonb('base_stats').notNullable().defaultTo('{}')
      table.boolean('is_mega').notNullable().defaultTo(false)
      table.boolean('is_available').notNullable().defaultTo(true)
      table.string('sprite_url').nullable()
      table.string('regulation').notNullable().defaultTo('M-A')
      table.jsonb('raw_data').defaultTo('{}')
      table.timestamp('synced_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['pokemon_id', 'form', 'regulation'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
