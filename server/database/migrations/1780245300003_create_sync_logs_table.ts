import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sync_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.string('job_type').notNullable() // 'pikalytics' | 'smogon' | 'roster'
      table.string('status').notNullable() // 'started' | 'completed' | 'failed'
      table.integer('records_upserted').defaultTo(0)
      table.text('error_message').nullable()
      table.integer('duration_ms').nullable()
      table.string('triggered_by').defaultTo('n8n')
      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
