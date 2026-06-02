import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pokemon_roster'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.integer('pokemon_id').notNullable() // national dex id
      table.string('name_en', 100).notNullable()
      table.string('name_fr', 100).nullable()
      table.string('form').nullable() // null | 'mega' | 'mega-x' | 'hisui' ...
      table.integer('base_form_id').nullable() // mega → base pokemon id
      // Mirror pokemon_data: explicit type + stat columns (no JSON blobs).
      table.string('type_1', 20).nullable()
      table.string('type_2', 20).nullable()
      table.integer('base_hp').nullable()
      table.integer('base_atk').nullable()
      table.integer('base_def').nullable()
      table.integer('base_spa').nullable()
      table.integer('base_spd').nullable()
      table.integer('base_spe').nullable()
      table.boolean('is_mega').notNullable().defaultTo(false)
      table.boolean('is_available').notNullable().defaultTo(true)
      table.string('sprite_url').nullable()
      table.string('regulation').notNullable().defaultTo('M-A')
      table.jsonb('raw_data').defaultTo('{}')
      table.timestamp('synced_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['pokemon_id', 'form', 'regulation'])
      table.index(['type_1'])
      table.index(['type_2'])
      table.index(['is_available'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
