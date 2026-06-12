/**
 * Resolves a parsed Showdown team into in-app team slots.
 *
 * The app stores moves/items by French display name and abilities by PokéAPI
 * slug (see PokemonEditorSheet), and uses a 66-point "SP" budget instead of
 * 0–252 EVs. This module bridges the Showdown English/EV world to that model.
 */
import { apiFetch, qs } from '@/lib/api/client'
import type { ApiItem, ApiPokemon, ApiPokemonDetail, Paginated } from '@/lib/api/types'
import { NATURES } from '@/lib/data/natures'
import type { TeamSlotInput } from '@/lib/api/hooks/useTeams'
import { parseShowdownTeam, type ParsedSet, type ShowdownStat } from '@/lib/showdown/parse'

/** Per-stat SP cap and total budget, mirroring PokemonEditorSheet. */
const SP_PER_STAT = 32
const SP_BUDGET = 66
/** 8 EVs ≈ 1 SP (510 EV total ≈ 64 SP, close to the 66 budget). */
const EV_PER_SP = 8

const SP_KEYS: Record<ShowdownStat, keyof TeamSlotInput> = {
  hp: 'spHp',
  atk: 'spAtk',
  def: 'spDef',
  spa: 'spSpa',
  spd: 'spSpd',
  spe: 'spSpe',
}

export interface ResolvedSlot {
  slot: TeamSlotInput & { pokemon: ApiPokemon }
}

export interface ImportResult {
  name: string | null
  slots: Array<TeamSlotInput & { pokemon: ApiPokemon }>
  /** Non-fatal issues (unmatched item/move/ability, dropped sets, etc.). */
  warnings: string[]
}

/** Collapses casing, accents, spaces and punctuation for fuzzy name matching. */
function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** Capitalizes a nature and validates it against the known set. */
function resolveNature(raw: string | null): string {
  if (!raw) return 'Hardy'
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  return NATURES[cap] ? cap : 'Hardy'
}

/** Converts Showdown EVs to the app's capped SP spread. */
function evsToSp(evs: Partial<Record<ShowdownStat, number>>): {
  sp: Pick<TeamSlotInput, 'spHp' | 'spAtk' | 'spDef' | 'spSpa' | 'spSpd' | 'spSpe'>
  total: number
} {
  const sp = { spHp: 0, spAtk: 0, spDef: 0, spSpa: 0, spSpd: 0, spSpe: 0 }
  let total = 0
  for (const stat of Object.keys(evs) as ShowdownStat[]) {
    const value = Math.min(SP_PER_STAT, Math.round((evs[stat] ?? 0) / EV_PER_SP))
    sp[SP_KEYS[stat] as keyof typeof sp] = value
    total += value
  }
  return { sp, total }
}

/** Runs a `/pokemon?search=` query and returns the page rows. */
async function searchPokemon(query: string): Promise<ApiPokemon[]> {
  const page = await apiFetch<Paginated<ApiPokemon>>(
    `/pokemon${qs({ search: query, limit: 20 })}`
  )
  return page.data
}

/**
 * Finds the in-app Pokémon for a Showdown species name.
 *
 * Showdown species are English and often hyphenated forms — "Calyrex-Ice",
 * "Urshifu-Rapid-Strike", "Ogerpon-Hearthflame". The backend rarely indexes the
 * full hyphenated string, so a direct search returns nothing. When that happens
 * we retry on the base species name (before the first '-') and then pick the row
 * whose name carries all the form tokens, falling back to the base species.
 */
async function resolvePokemon(species: string): Promise<ApiPokemon | null> {
  const target = norm(species)
  let data = await searchPokemon(species)
  const exact = data.find((p) => norm(p.nameEn) === target || norm(p.nameFr) === target)
  if (exact) return exact

  const parts = species.split('-')
  const base = parts[0].trim()
  if (norm(base) !== target) {
    // Retry on the base name when the hyphenated form returned nothing.
    if (data.length === 0) data = await searchPokemon(base)

    const formTokens = parts.slice(1).map(norm).filter(Boolean)
    if (formTokens.length) {
      const formMatch = data.find((p) => {
        const haystack = norm(p.nameEn) + '|' + norm(p.nameFr)
        return formTokens.every((t) => haystack.includes(t))
      })
      if (formMatch) return formMatch
    }

    const baseTarget = norm(base)
    const baseMatch = data.find(
      (p) => norm(p.nameEn) === baseTarget || norm(p.nameFr) === baseTarget
    )
    if (baseMatch) return baseMatch
  }

  return data[0] ?? null
}

/** Resolves one parsed set into a draft slot, pushing any warnings. */
async function resolveSet(
  set: ParsedSet,
  slotIndex: number,
  items: ApiItem[],
  warnings: string[]
): Promise<(TeamSlotInput & { pokemon: ApiPokemon }) | null> {
  const pokemon = await resolvePokemon(set.species)
  if (!pokemon) {
    warnings.push(`Pokémon introuvable : « ${set.species} » (ignoré)`)
    return null
  }

  // Ability — stored as a PokéAPI slug from pokemon.abilities.
  let ability = pokemon.abilities[0] ?? ''
  if (set.ability) {
    const matched = pokemon.abilities.find((a) => norm(a) === norm(set.ability!))
    if (matched) ability = matched
    else warnings.push(`${pokemon.nameFr} : talent « ${set.ability} » non reconnu`)
  }

  // Item — stored as French name; match Showdown English name or slug.
  let item: string | null = null
  if (set.item) {
    const found = items.find(
      (it) => norm(it.nameEn) === norm(set.item!) || norm(it.slug) === norm(set.item!)
    )
    if (found) item = found.nameFr
    else warnings.push(`${pokemon.nameFr} : objet « ${set.item} » non reconnu`)
  }

  // Moves — stored as French name; need the detail payload for the move pool.
  const moves: (string | null)[] = [null, null, null, null]
  if (set.moves.length) {
    const detail = await apiFetch<ApiPokemonDetail>(`/pokemon/${pokemon.id}`)
    set.moves.slice(0, 4).forEach((rawMove, i) => {
      // Drop Hidden Power type suffixes: "Hidden Power [Fire]" → "Hidden Power".
      const clean = rawMove.replace(/\s*\[[^\]]*\]\s*$/, '').trim()
      const found = detail.moveDetails.find(
        (m) => norm(m.nameEn) === norm(clean) || norm(m.nameFr) === norm(clean)
      )
      if (found) moves[i] = found.nameFr
      else warnings.push(`${pokemon.nameFr} : capacité « ${rawMove} » non reconnue`)
    })
  }

  const { sp, total } = evsToSp(set.evs)
  if (total > SP_BUDGET) {
    warnings.push(`${pokemon.nameFr} : EVs convertis dépassent le budget SP (${total}/${SP_BUDGET})`)
  }

  return {
    pokemon,
    slotIndex,
    pokemonId: pokemon.id,
    nickname: set.nickname,
    nature: resolveNature(set.nature),
    ability,
    item,
    move1: moves[0],
    move2: moves[1],
    move3: moves[2],
    move4: moves[3],
    ...sp,
  }
}

/** Parses + resolves a raw Showdown paste into importable team slots. */
export async function resolveShowdownTeam(text: string): Promise<ImportResult> {
  const parsed = parseShowdownTeam(text)
  const warnings: string[] = []

  if (parsed.sets.length === 0) {
    throw new Error('Aucune équipe détectée. Vérifie le format Showdown.')
  }

  const items = await apiFetch<ApiItem[]>('/items').catch(() => [] as ApiItem[])

  const resolved = await Promise.all(
    parsed.sets.slice(0, 6).map((set, i) => resolveSet(set, i, items, warnings))
  )
  const slots = resolved
    .filter((s): s is TeamSlotInput & { pokemon: ApiPokemon } => s !== null)
    // slotIndex must stay contiguous after any dropped sets.
    .map((s, i) => ({ ...s, slotIndex: i }))

  if (slots.length === 0) {
    throw new Error('Aucun Pokémon n’a pu être importé.')
  }

  return { name: parsed.name, slots, warnings }
}
