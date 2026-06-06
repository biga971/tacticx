/**
 * Pokémon Showdown team paste parser.
 *
 * Parses the standard Showdown export format into structured sets. Pure — no
 * network, no name resolution. Resolution to in-app Pokémon/move/item ids
 * happens in `resolveShowdownTeam` (./import).
 *
 * Example of one set:
 *
 *   Nickname (Great Tusk) (M) @ Booster Energy
 *   Ability: Protosynthesis
 *   Level: 50
 *   Tera Type: Ground
 *   EVs: 252 Atk / 4 Def / 252 Spe
 *   Adamant Nature
 *   IVs: 0 SpA
 *   - Headlong Rush
 *   - Close Combat
 *   - Ice Spinner
 *   - Protect
 */

export type ShowdownStat = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'

export interface ParsedSet {
  species: string
  nickname: string | null
  gender: 'M' | 'F' | 'N' | null
  item: string | null
  ability: string | null
  level: number | null
  nature: string | null
  teraType: string | null
  evs: Partial<Record<ShowdownStat, number>>
  ivs: Partial<Record<ShowdownStat, number>>
  moves: string[]
}

export interface ParsedTeam {
  /** Team name from a `=== [format] Name ===` header, if present. */
  name: string | null
  /** Format tag from the header (e.g. `gen9vgc2024regh`), if present. */
  formatTag: string | null
  sets: ParsedSet[]
}

const STAT_TOKENS: Record<string, ShowdownStat> = {
  hp: 'hp',
  atk: 'atk',
  def: 'def',
  spa: 'spa',
  spd: 'spd',
  spe: 'spe',
}

/** Parses an `EVs:`/`IVs:` value like `252 Atk / 4 Def / 252 Spe`. */
function parseStatLine(value: string): Partial<Record<ShowdownStat, number>> {
  const out: Partial<Record<ShowdownStat, number>> = {}
  for (const part of value.split('/')) {
    const m = part.trim().match(/^(\d+)\s+([A-Za-z]+)$/)
    if (!m) continue
    const stat = STAT_TOKENS[m[2].toLowerCase()]
    if (stat) out[stat] = Number(m[1])
  }
  return out
}

/** Parses the first line of a set: name, nickname, gender and held item. */
function parseFirstLine(line: string): Pick<ParsedSet, 'species' | 'nickname' | 'gender' | 'item'> {
  let rest = line.trim()
  let item: string | null = null

  const atIdx = rest.lastIndexOf(' @ ')
  if (atIdx !== -1) {
    item = rest.slice(atIdx + 3).trim() || null
    rest = rest.slice(0, atIdx).trim()
  }

  let gender: ParsedSet['gender'] = null
  const genderMatch = rest.match(/\s*\((M|F|N)\)\s*$/)
  if (genderMatch) {
    gender = genderMatch[1] as ParsedSet['gender']
    rest = rest.slice(0, genderMatch.index).trim()
  }

  let nickname: string | null = null
  let species = rest
  const nickMatch = rest.match(/^(.*)\s+\((.+)\)\s*$/)
  if (nickMatch) {
    nickname = nickMatch[1].trim()
    species = nickMatch[2].trim()
  }

  return { species, nickname, gender, item }
}

/** Parses a single set block (already split into trimmed, non-empty lines). */
function parseSet(lines: string[]): ParsedSet | null {
  if (lines.length === 0) return null

  const set: ParsedSet = {
    ...parseFirstLine(lines[0]),
    ability: null,
    level: null,
    nature: null,
    teraType: null,
    evs: {},
    ivs: {},
    moves: [],
  }
  if (!set.species) return null

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('- ') || line.startsWith('-\t')) {
      // Moves can carry a hidden-power type suffix like `Hidden Power [Fire]`.
      const move = line.slice(1).trim()
      if (move) set.moves.push(move)
      continue
    }

    const natureMatch = line.match(/^(\w+)\s+Nature$/)
    if (natureMatch) {
      set.nature = natureMatch[1]
      continue
    }

    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim().toLowerCase()
    const value = line.slice(colon + 1).trim()

    switch (key) {
      case 'ability':
        set.ability = value || null
        break
      case 'level':
        set.level = Number(value) || null
        break
      case 'tera type':
        set.teraType = value || null
        break
      case 'evs':
        set.evs = parseStatLine(value)
        break
      case 'ivs':
        set.ivs = parseStatLine(value)
        break
      // Shiny / Happiness / Gigantamax / Dynamax Level / etc. are ignored.
      default:
        break
    }
  }

  return set
}

/** Parses a full Showdown paste into a structured team. */
export function parseShowdownTeam(text: string): ParsedTeam {
  const result: ParsedTeam = { name: null, formatTag: null, sets: [] }
  if (!text.trim()) return result

  // Normalize line endings, then split into blocks on blank lines.
  const normalized = text.replace(/\r\n?/g, '\n')
  const blocks = normalized.split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) continue

    // Optional header line: `=== [format] Team Name ===`.
    if (lines[0].startsWith('===')) {
      const header = lines[0].replace(/=/g, '').trim()
      const fmt = header.match(/^\[([^\]]+)\]\s*(.*)$/)
      if (fmt) {
        result.formatTag = fmt[1].trim() || null
        result.name = fmt[2].trim() || null
      } else {
        result.name = header || null
      }
      lines.shift()
      if (lines.length === 0) continue
    }

    const set = parseSet(lines)
    if (set) result.sets.push(set)
  }

  return result
}
