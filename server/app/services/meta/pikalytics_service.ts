import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import MetaCache from '#models/meta_cache'
import { normalizePokemonName } from '#utils/pokemon_name'
import { fetchText, sleep } from '#services/meta/http'
import type { MetaFormat, MetaSource, PokemonMeta, UsageEntry, SpreadEntry } from '#services/meta/meta_types'

const BASE = 'https://www.pikalytics.com/ai/pokedex'
const DELAY_MS = 1500
const TOP_N = 50
const SECTION_LIMIT = 10

interface Endpoint {
  slug: string
  format: MetaFormat
  source: MetaSource
}

const ENDPOINTS: Endpoint[] = [
  { slug: 'championspreview', format: 'vgc', source: 'ranked_preview' },
  { slug: 'gen9championsvgc2026regma', format: 'vgc', source: 'tournament' },
  { slug: 'gen9championsbssregma', format: '3v3', source: 'tournament' },
]

/** "48.27%" → 0.4827, "N/A" → null. */
function parsePercent(raw: string | undefined): number | null {
  if (!raw) return null
  const m = raw.match(/([\d.]+)\s*%/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? Number((n / 100).toFixed(4)) : null
}

function splitCells(line: string): string[] {
  const cells = line.split('|').map((c) => c.trim())
  return cells.filter(
    (_, i) => !(i === 0 && cells[0] === '') && !(i === cells.length - 1 && cells[cells.length - 1] === '')
  )
}

/**
 * Parse the "Best 50 Pokemon by Usage" table.
 * IMPORTANT: anchor on the header row that contains "Pokemon" + "Usage" so we
 * skip the "Team Cores" tables (header "| Rank | Core | Teams | Usage |") that
 * appear first on the tournament endpoints.
 */
function parseListTable(md: string): { name: string; rank: number; usageRate: number | null; winRate: number | null }[] {
  const lines = md.split('\n')
  const headerIdx = lines.findIndex(
    (l) => l.includes('|') && /\bpokemon\b/i.test(l) && /usage/i.test(l)
  )
  if (headerIdx < 0) return []

  const rows: { name: string; rank: number; usageRate: number | null; winRate: number | null }[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.includes('|')) {
      if (rows.length) break // table ended
      continue
    }
    const cols = splitCells(line)
    const rank = Number(cols[0])
    if (!Number.isInteger(rank) || rank < 1) continue // separator / stray row
    // Pikalytics wraps the name in markdown bold: "**Incineroar**".
    const name = cols[1]?.replace(/\*\*/g, '').trim()
    if (!name || /[-=]{3,}/.test(name)) continue
    rows.push({ rank, name, usageRate: parsePercent(cols[2]), winRate: parsePercent(cols[3]) })
    if (rows.length >= TOP_N) break
  }
  return rows
}

/**
 * Extract "name + usage%" pairs from the block following a heading whose text
 * matches one of `keywords`. Robust to bullets, tables and plain lines.
 */
function extractUsageSection(md: string, keywords: string[]): UsageEntry[] {
  const lines = md.split('\n')
  const out: UsageEntry[] = []
  let inSection = false
  for (const raw of lines) {
    const line = raw.trim()
    const isHeading = /^#{1,6}\s/.test(line) || /^\*\*.+\*\*$/.test(line) || /^[A-Z][A-Za-z ]+:?$/.test(line)
    if (isHeading) {
      const lower = line.toLowerCase()
      inSection = keywords.some((k) => lower.includes(k))
      continue
    }
    if (!inSection || !line) continue
    // Lines look like "- **Fake Out**: 41.092%". Strip list/bold markers,
    // then capture "name [: ] percent".
    const cleaned = line.replace(/^[-*•\s|]+/, '').replace(/\|/g, ' ').trim()
    const m = cleaned.match(/^\*{0,2}(.+?)\*{0,2}\s*:?\s*([\d.]+)\s*%/)
    if (m) {
      const usage = parsePercent(m[2] + '%')
      const name = m[1].replace(/\*\*/g, '').trim()
      if (name && usage !== null) {
        out.push({ name, usageRate: usage })
        if (out.length >= SECTION_LIMIT) break
      }
    }
  }
  return out
}

/** Spreads: "252 Atk / 4 Def / 252 Spe · Adamant — 31.2%" style lines. */
function extractSpreads(md: string): SpreadEntry[] {
  const lines = md.split('\n')
  const out: SpreadEntry[] = []
  let inSection = false
  for (const raw of lines) {
    const line = raw.trim()
    const isHeading = /^#{1,6}\s/.test(line) || /^\*\*.+\*\*$/.test(line)
    if (isHeading) {
      inSection = /spread/i.test(line)
      continue
    }
    if (!inSection || !line) continue
    const usage = parsePercent(line)
    if (usage === null) continue
    const natureMatch = line.match(/\b(Hardy|Lonely|Brave|Adamant|Naughty|Bold|Docile|Relaxed|Impish|Lax|Timid|Hasty|Serious|Jolly|Naive|Modest|Mild|Quiet|Bashful|Rash|Calm|Gentle|Sassy|Careful|Quirky)\b/i)
    const spreadMatch = line.match(/((?:\d{1,3}\s*[A-Za-z.]+\s*\/?\s*){2,})/)
    out.push({
      spreadString: (spreadMatch?.[1] ?? line).replace(/[•|]/g, '').trim(),
      nature: natureMatch ? natureMatch[1] : null,
      usageRate: usage,
    })
    if (out.length >= SECTION_LIMIT) break
  }
  return out
}

function parseDetail(md: string, base: { name: string; rank: number; usageRate: number | null; winRate: number | null }): PokemonMeta {
  return {
    pokemonName: normalizePokemonName(base.name),
    rank: base.rank,
    usageRate: base.usageRate,
    winRate: base.winRate,
    moves: extractUsageSection(md, ['move']),
    items: extractUsageSection(md, ['item']),
    abilities: extractUsageSection(md, ['abilit']),
    teammates: extractUsageSection(md, ['teammate', 'partner']),
    spreads: extractSpreads(md),
    rawData: md.slice(0, 20000),
  }
}

class PikalyticsService {
  /** Sync all three endpoints. Resilient: a failed endpoint/Pokémon is skipped. */
  async sync(): Promise<number> {
    let upserted = 0
    for (const ep of ENDPOINTS) {
      const listMd = await fetchText(`${BASE}/${ep.slug}`)
      await sleep(DELAY_MS)
      if (!listMd) {
        logger.warn(`[pikalytics] list unavailable: ${ep.slug}`)
        continue
      }
      const rows = parseListTable(listMd)
      logger.info(`[pikalytics] ${ep.slug}: ${rows.length} Pokémon`)

      for (const row of rows) {
        try {
          const detailMd = await fetchText(`${BASE}/${ep.slug}/${encodeURIComponent(row.name)}`)
          await sleep(DELAY_MS)
          const meta = detailMd ? parseDetail(detailMd, row) : parseDetail('', row)
          await this.upsert(meta, ep)
          upserted++
        } catch (err) {
          logger.error({ err, pokemon: row.name, endpoint: ep.slug }, '[pikalytics] skip Pokémon')
        }
      }
    }
    return upserted
  }

  private async upsert(meta: PokemonMeta, ep: Endpoint) {
    await MetaCache.updateOrCreate(
      { pokemonName: meta.pokemonName, format: ep.format, source: ep.source, regulation: 'M-A' },
      {
        rank: meta.rank,
        usageRate: meta.usageRate,
        winRate: meta.winRate,
        moves: meta.moves,
        items: meta.items,
        abilities: meta.abilities,
        teammates: meta.teammates,
        spreads: meta.spreads,
        rawData: meta.rawData ?? null,
        fetchedAt: DateTime.now(),
      }
    )
  }
}

export default new PikalyticsService()
