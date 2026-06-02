import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import MetaCache from '#models/meta_cache'
import { normalizePokemonName } from '#utils/pokemon_name'
import { fetchText, sleep } from '#services/meta/http'
import type { MetaFormat, PokemonMeta, UsageEntry, SpreadEntry } from '#services/meta/meta_types'

const BASE = 'https://www.smogon.com/stats'
const CUTOFFS = [1695, 1630, 0]
const DELAY_MS = 1500
const SECTION_LIMIT = 10

interface SmogonFormat {
  file: string
  format: MetaFormat
}

const FORMATS: SmogonFormat[] = [
  { file: 'gen9championsvgc2026regma', format: 'vgc' },
  { file: 'gen9championsbssregma', format: '3v3' },
]

const SECTION_KEYWORDS = new Set([
  'abilities',
  'items',
  'spreads',
  'moves',
  'teammates',
  'checks and counters',
])
const STATS_KEYWORDS = ['raw count', 'avg. weight', 'viability ceiling']

/** Previous month as YYYY-MM (Smogon publishes ~1 month late). */
function previousMonth(now = DateTime.now()): string {
  return now.minus({ months: 1 }).toFormat('yyyy-MM')
}

function parsePercent(raw: string): number | null {
  const m = raw.match(/([\d.]+)\s*%/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? Number((n / 100).toFixed(4)) : null
}

/** Try each cutoff until a file is found. Returns text + the path used. */
async function fetchWithFallback(month: string, path: (cutoff: number) => string): Promise<string | null> {
  for (const cutoff of CUTOFFS) {
    const txt = await fetchText(`${BASE}/${month}/${path(cutoff)}`)
    await sleep(DELAY_MS)
    if (txt) return txt
  }
  return null
}

/** Usage table: rows like "| 1 | Incineroar | 48.271%| 6050 | ...". */
function parseUsage(txt: string): Map<string, { rank: number; usageRate: number | null }> {
  const map = new Map<string, { rank: number; usageRate: number | null }>()
  for (const line of txt.split('\n')) {
    if (!line.includes('|')) continue
    const cols = line.split('|').map((c) => c.trim())
    const rank = Number(cols[1])
    if (!Number.isInteger(rank) || rank < 1) continue
    const name = cols[2]
    if (!name) continue
    map.set(normalizePokemonName(name), { rank, usageRate: parsePercent(cols[3] ?? '') })
  }
  return map
}

/** First non-pipe content of a block segment. */
function firstLabel(segment: string[]): string {
  const first = segment.find((l) => l.trim().length > 0) ?? ''
  return first.replace(/\|/g, '').trim().toLowerCase()
}

function dataLines(segment: string[]): string[] {
  // Drop the label line, keep the rest.
  const content = segment.map((l) => l.replace(/\|/g, '').trim()).filter(Boolean)
  return content.slice(1)
}

function parseUsageEntries(segment: string[]): UsageEntry[] {
  const out: UsageEntry[] = []
  for (const line of dataLines(segment)) {
    const m = line.match(/^(.+?)\s+\+?([\d.]+)\s*%$/)
    if (!m) continue
    const usage = parsePercent(m[2] + '%')
    if (usage === null) continue
    out.push({ name: m[1].trim(), usageRate: usage })
    if (out.length >= SECTION_LIMIT) break
  }
  return out
}

function parseSpreadEntries(segment: string[]): SpreadEntry[] {
  const out: SpreadEntry[] = []
  for (const line of dataLines(segment)) {
    const m = line.match(/^([A-Za-z]+):([\d/]+)\s+([\d.]+)\s*%$/)
    if (!m) continue
    const usage = parsePercent(m[3] + '%')
    if (usage === null) continue
    out.push({ spreadString: m[2], nature: m[1], usageRate: usage })
    if (out.length >= SECTION_LIMIT) break
  }
  return out
}

/** Parse the moveset .txt into per-Pokémon detail blocks. */
function parseMoveset(txt: string): Map<string, Omit<PokemonMeta, 'rank' | 'usageRate' | 'winRate'>> {
  const result = new Map<string, Omit<PokemonMeta, 'rank' | 'usageRate' | 'winRate'>>()
  // Segments are delimited by "+-----+" rule lines.
  const segments: string[][] = []
  let current: string[] = []
  for (const line of txt.split('\n')) {
    if (/^\s*\+-+\+\s*$/.test(line)) {
      if (current.length) segments.push(current)
      current = []
    } else {
      current.push(line)
    }
  }
  if (current.length) segments.push(current)

  let active: (Omit<PokemonMeta, 'rank' | 'usageRate' | 'winRate'> & { _name: string }) | null = null
  const commit = () => {
    if (active) {
      const { _name, ...rest } = active
      result.set(_name, rest)
    }
  }

  for (const seg of segments) {
    const label = firstLabel(seg)
    if (!label) continue
    if (label.includes('%')) continue
    if (STATS_KEYWORDS.some((k) => label.startsWith(k))) continue // stats block

    if (SECTION_KEYWORDS.has(label)) {
      if (!active) continue
      if (label === 'abilities') active.abilities = parseUsageEntries(seg)
      else if (label === 'items') active.items = parseUsageEntries(seg)
      else if (label === 'moves') active.moves = parseUsageEntries(seg)
      else if (label === 'teammates') active.teammates = parseUsageEntries(seg)
      else if (label === 'spreads') active.spreads = parseSpreadEntries(seg)
      // 'checks and counters' ignored
      continue
    }

    // Otherwise: a Pokémon name header → start a new block.
    commit()
    active = {
      _name: normalizePokemonName(label),
      pokemonName: normalizePokemonName(label),
      moves: [],
      items: [],
      abilities: [],
      teammates: [],
      spreads: [],
    }
  }
  commit()
  return result
}

class SmogonService {
  async sync(): Promise<number> {
    const month = previousMonth()
    let upserted = 0

    for (const fmt of FORMATS) {
      const usageTxt = await fetchWithFallback(month, (c) => `${fmt.file}-${c}.txt`)
      if (!usageTxt) {
        logger.warn(`[smogon] usage file not found for ${fmt.file} (${month})`)
        continue
      }
      const usage = parseUsage(usageTxt)

      const movesetTxt = await fetchWithFallback(month, (c) => `moveset/${fmt.file}-${c}.txt`)
      const movesets = movesetTxt ? parseMoveset(movesetTxt) : new Map()
      logger.info(`[smogon] ${fmt.file}: ${usage.size} Pokémon, ${movesets.size} movesets`)

      for (const [name, u] of usage) {
        try {
          const detail = movesets.get(name)
          await MetaCache.updateOrCreate(
            { pokemonName: name, format: fmt.format, source: 'ranked_ladder', regulation: 'M-A' },
            {
              rank: u.rank,
              usageRate: u.usageRate,
              winRate: null,
              moves: detail?.moves ?? [],
              items: detail?.items ?? [],
              abilities: detail?.abilities ?? [],
              teammates: detail?.teammates ?? [],
              spreads: detail?.spreads ?? [],
              rawData: null,
              fetchedAt: DateTime.now(),
            }
          )
          upserted++
        } catch (err) {
          logger.error({ err, pokemon: name }, '[smogon] skip Pokémon')
        }
      }
    }
    return upserted
  }
}

export default new SmogonService()
