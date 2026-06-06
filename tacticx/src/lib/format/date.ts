/** Lightweight French date formatting — no date lib dependency. */

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/**
 * Relative time in French ("il y a 3 h", "il y a 2 j). Falls back to an
 * absolute short date past one week. Safe on null/invalid input.
 */
export function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  const ts = date.getTime()
  if (Number.isNaN(ts)) return ''

  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000))

  if (seconds < MINUTE) return "à l'instant"
  if (seconds < HOUR) return `il y a ${Math.floor(seconds / MINUTE)} min`
  if (seconds < DAY) return `il y a ${Math.floor(seconds / HOUR)} h`
  if (seconds < WEEK) return `il y a ${Math.floor(seconds / DAY)} j`
  return formatShortDate(iso)
}

/** Absolute short date, e.g. "6 juin 2026". Safe on null/invalid input. */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
