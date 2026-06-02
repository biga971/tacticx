import { column } from '@adonisjs/lucid/orm'

/**
 * JSON column that survives both Postgres (jsonb) and SQLite (text).
 * Postgres returns parsed objects, SQLite returns strings — normalise both.
 */
export function jsonColumn<T>(defaultValue: T) {
  return column({
    prepare: (value: T) => JSON.stringify(value ?? defaultValue),
    consume: (value: string | T | null) => {
      if (value === null || value === undefined) return defaultValue
      return (typeof value === 'string' ? JSON.parse(value) : value) as T
    },
  })
}
