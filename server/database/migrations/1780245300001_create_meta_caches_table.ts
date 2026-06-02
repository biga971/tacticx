import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'meta_cache'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // UUID generated in the model (@beforeCreate) for sqlite/pg portability.
      table.uuid('id').notNullable().primary()
      table.string('pokemon_name').notNullable() // normalised Showdown slug
      table.string('format').notNullable() // 'vgc' | '3v3'
      table.string('source').notNullable() // 'ranked_preview' | 'tournament' | 'ranked_ladder'
      table.string('regulation').notNullable().defaultTo('M-A')
      table.integer('rank').nullable()
      table.decimal('usage_rate', 5, 4).nullable()
      table.decimal('win_rate', 5, 4).nullable()
      table.jsonb('moves').defaultTo('[]')
      table.jsonb('items').defaultTo('[]')
      table.jsonb('abilities').defaultTo('[]')
      table.jsonb('teammates').defaultTo('[]')
      table.jsonb('spreads').defaultTo('[]')
      table.text('raw_data').nullable()
      table.timestamp('fetched_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['pokemon_name', 'format', 'source', 'regulation'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
