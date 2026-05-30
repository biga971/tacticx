import { TYPE_ORDER, type PokemonType } from '@/lib/theme'
import { effectiveness } from '@/lib/data/typeChart'
import type { PokemonSlot } from '@/lib/calc/types'

/**
 * Defensive multiplier of an attacking type against a (dual-)type defender.
 * Handles immunities (0) and dual-type stacking.
 */
export function getDefensiveMultiplier(
  attackType: PokemonType,
  defenderTypes: PokemonType[]
): number {
  return defenderTypes.reduce((acc, t) => acc * effectiveness(attackType, t), 1)
}

/** Per-attacking-type, the multiplier each team member takes. */
export type WeaknessMap = Record<PokemonType, number[]>

/**
 * For each of the 18 attacking types, the multiplier suffered by each slot.
 * Null slots are skipped (their column is omitted from the arrays).
 */
export function getTeamWeaknesses(slots: (PokemonSlot | null)[]): WeaknessMap {
  const present = slots.filter((s): s is PokemonSlot => !!s)
  const map = {} as WeaknessMap
  for (const atk of TYPE_ORDER) {
    map[atk] = present.map((s) => getDefensiveMultiplier(atk, s.types))
  }
  return map
}

export type CoverageMap = Record<PokemonType, boolean>

/**
 * Offensive coverage: which defending types the team can hit super-effectively
 * via STAB or known move types.
 */
export function getOffensiveCoverage(slots: (PokemonSlot | null)[]): CoverageMap {
  const present = slots.filter((s): s is PokemonSlot => !!s)
  const attackTypes = new Set<PokemonType>()
  for (const s of present) {
    s.types.forEach((t) => attackTypes.add(t))
    s.moveTypes?.forEach((t) => attackTypes.add(t))
  }

  const cover = {} as CoverageMap
  for (const def of TYPE_ORDER) {
    cover[def] = [...attackTypes].some((atk) => effectiveness(atk, def) > 1)
  }
  return cover
}

export interface TypeDanger {
  type: PokemonType
  exposures: number // count of slots taking > 1×
  totalMultiplier: number // sum of multipliers across slots
}

/**
 * Types ordered by danger (most slots hit super-effectively first).
 * A type is "dangerous" when ≥ 1 slot takes super-effective damage.
 */
export function getMostDangerousTypes(weaknesses: WeaknessMap): TypeDanger[] {
  const ranked: TypeDanger[] = TYPE_ORDER.map((type) => {
    const mults = weaknesses[type] ?? []
    return {
      type,
      exposures: mults.filter((m) => m > 1).length,
      totalMultiplier: mults.reduce((a, b) => a + b, 0),
    }
  })

  return ranked
    .filter((r) => r.exposures > 0)
    .sort((a, b) => b.exposures - a.exposures || b.totalMultiplier - a.totalMultiplier)
}

/** A type counts as a DANGER alert when ≥ 4 slots are weak to it (Phase 11 spec). */
export function isDangerType(weaknesses: WeaknessMap, type: PokemonType): boolean {
  return (weaknesses[type] ?? []).filter((m) => m > 1).length >= 4
}
