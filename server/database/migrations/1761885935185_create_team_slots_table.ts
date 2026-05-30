import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'team_slots'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('team_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('teams')
        .onDelete('CASCADE')
      table.integer('slot_index').notNullable() // 0-5
      table.integer('pokemon_id').notNullable().references('id').inTable('pokemon_data')
      table.string('nickname', 50).nullable()
      table.string('nature', 20).notNullable()
      table.string('ability', 100).notNullable()
      table.string('item', 100).nullable()
      table.string('move_1', 100).nullable()
      table.string('move_2', 100).nullable()
      table.string('move_3', 100).nullable()
      table.string('move_4', 100).nullable()
      table.integer('sp_hp').notNullable().defaultTo(0)
      table.integer('sp_atk').notNullable().defaultTo(0)
      table.integer('sp_def').notNullable().defaultTo(0)
      table.integer('sp_spa').notNullable().defaultTo(0)
      table.integer('sp_spd').notNullable().defaultTo(0)
      table.integer('sp_spe').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['team_id'])
      table.unique(['team_id', 'slot_index'])
    })

    // SP budget: total <= 66, each stat within 0..32.
    this.schema.raw(`
      ALTER TABLE ${this.tableName}
      ADD CONSTRAINT team_slots_sp_total_chk
      CHECK (sp_hp + sp_atk + sp_def + sp_spa + sp_spd + sp_spe <= 66)
    `)
    this.schema.raw(`
      ALTER TABLE ${this.tableName}
      ADD CONSTRAINT team_slots_sp_range_chk
      CHECK (
        sp_hp BETWEEN 0 AND 32 AND sp_atk BETWEEN 0 AND 32 AND sp_def BETWEEN 0 AND 32 AND
        sp_spa BETWEEN 0 AND 32 AND sp_spd BETWEEN 0 AND 32 AND sp_spe BETWEEN 0 AND 32
      )
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
