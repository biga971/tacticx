import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pokemon_data'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // id = PokeAPI id (also the home-sprite id). Not auto-incremented.
      table.integer('id').primary().notNullable()
      table.string('name_fr', 100).notNullable()
      table.string('name_en', 100).notNullable()
      table.string('type_1', 20).notNullable()
      table.string('type_2', 20).nullable()
      table.integer('base_hp').notNullable()
      table.integer('base_atk').notNullable()
      table.integer('base_def').notNullable()
      table.integer('base_spa').notNullable()
      table.integer('base_spd').notNullable()
      table.integer('base_spe').notNullable()
      table.jsonb('abilities').notNullable().defaultTo('[]')
      table.jsonb('moves').notNullable().defaultTo('[]')
      table.string('sprite_url', 255).notNullable()
      table.boolean('is_mega').notNullable().defaultTo(false)
      table.integer('mega_of').nullable()
      table.boolean('in_reg_ma').notNullable().defaultTo(false)
      table.text('regulation_notes').nullable()
      table.timestamp('updated_at').nullable()

      table.index(['type_1'])
      table.index(['type_2'])
      table.index(['in_reg_ma'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
