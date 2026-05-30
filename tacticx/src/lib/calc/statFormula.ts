import { NATURES, type StatKey } from '@/lib/data/natures'
import { CHAMPIONS_LEVEL, type BaseStats, type PokemonSlot } from '@/lib/calc/types'

/**
 * Champions stat formula. SP replaces EV/IV: 1 SP = +1 to the stat term directly.
 * Level is fixed at 50.
 *
 * HP    : floor((2*base + sp) * L/100) + L + 10
 * Others: floor( (floor((2*base + sp) * L/100) + 5) * natureMult )
 * natureMult: 1.1 boosted / 0.9 lowered / 1.0 neutral
 *
 * NOTE: validate against pikalytics.com/champions and porygonlabs.com.
 */
export function calcStat(
  base: number,
  sp: number,
  nature: string,
  statKey: StatKey,
  level: number = CHAMPIONS_LEVEL
): number {
  const core = Math.floor(((2 * base + sp) * level) / 100)

  if (statKey === 'hp') {
    // Shedinja-style 1 HP species would need a special case; not relevant in Champions.
    return core + level + 10
  }

  const nat = NATURES[nature] ?? { plus: null, minus: null }
  let mult = 1.0
  if (nat.plus === statKey) mult = 1.1
  else if (nat.minus === statKey) mult = 0.9

  return Math.floor((core + 5) * mult)
}

/** Computes all six final stats for a slot. */
export function calcAllStats(slot: PokemonSlot, baseStats?: BaseStats): Record<StatKey, number> {
  const base = baseStats ?? slot.base
  const out = {} as Record<StatKey, number>
  ;(Object.keys(base) as StatKey[]).forEach((key) => {
    out[key] = calcStat(base[key], slot.sp[key] ?? 0, slot.nature, key)
  })
  return out
}
