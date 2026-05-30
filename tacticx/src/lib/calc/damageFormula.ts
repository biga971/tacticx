import type { PokemonType } from '@/lib/theme'
import type { StatKey } from '@/lib/data/natures'
import { effectiveness } from '@/lib/data/typeChart'
import { CHAMPIONS_LEVEL } from '@/lib/calc/types'

export type Weather = 'sun' | 'rain' | 'sand' | 'snow' | 'none'
export type Terrain = 'electric' | 'grassy' | 'psychic' | 'misty' | 'none'

export interface DamageParams {
  attacker: { stats: Record<StatKey, number>; types: PokemonType[]; ability: string; item: string }
  defender: { stats: Record<StatKey, number>; types: PokemonType[]; ability: string; item: string }
  move: { power: number; type: PokemonType; category: 'physical' | 'special' }
  attackerStatStage: number // -6 → +6
  defenderStatStage: number // -6 → +6
  weather: Weather
  terrain: Terrain
  helpingHand: boolean // ×1.5 (VGC)
  isSpreadMove: boolean // ×0.75 if 2 targets (VGC)
  reflect: boolean // ×0.5 physical (×0.66 doubles)
  lightScreen: boolean // ×0.5 special (×0.66 doubles)
  auroraVeil: boolean // ×0.5 all (×0.66 doubles)
  intimidateApplied: boolean // -1 Atk for physical attacker
  isCriticalHit: boolean // ×1.5, ignores stat drops & screens
  isDoubles: boolean // affects screen multiplier
}

/** Stat-stage multiplier (-6..+6). */
function stageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage))
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s)
}

function stab(moveType: PokemonType, attackerTypes: PokemonType[]): number {
  return attackerTypes.includes(moveType) ? 1.5 : 1
}

function typeMultiplier(moveType: PokemonType, defenderTypes: PokemonType[]): number {
  return defenderTypes.reduce((acc, t) => acc * effectiveness(moveType, t), 1)
}

function weatherMultiplier(weather: Weather, moveType: PokemonType): number {
  if (weather === 'sun') {
    if (moveType === 'fire') return 1.5
    if (moveType === 'water') return 0.5
  } else if (weather === 'rain') {
    if (moveType === 'water') return 1.5
    if (moveType === 'fire') return 0.5
  }
  return 1
}

function terrainMultiplier(terrain: Terrain, moveType: PokemonType): number {
  // Grounded attacker assumed (VGC default). +30% on matching terrain.
  if (terrain === 'electric' && moveType === 'electric') return 1.3
  if (terrain === 'grassy' && moveType === 'grass') return 1.3
  if (terrain === 'psychic' && moveType === 'psychic') return 1.3
  if (terrain === 'misty' && moveType === 'dragon') return 0.5
  return 1
}

function screenMultiplier(p: DamageParams): number {
  if (p.isCriticalHit) return 1 // crits bypass screens
  const factor = p.isDoubles ? 0.667 : 0.5
  if (p.auroraVeil) return factor
  if (p.move.category === 'physical' && p.reflect) return factor
  if (p.move.category === 'special' && p.lightScreen) return factor
  return 1
}

/**
 * Gen 9 damage base (level 50):
 *   base = floor(floor(floor(2*L/5 + 2) * Power * A / D) / 50) + 2
 * Returns the 16 damage rolls (0.85 → 1.00) as integers, smallest first.
 */
export function calcAllRolls(p: DamageParams, level: number = CHAMPIONS_LEVEL): number[] {
  if (!p.move.power || p.move.power <= 0) return new Array(16).fill(0)

  const isPhysical = p.move.category === 'physical'

  // Attack stat with stage. Crits ignore the attacker's negative stage.
  let atkStage = p.attackerStatStage
  if (p.isCriticalHit && atkStage < 0) atkStage = 0
  let atk = (isPhysical ? p.attacker.stats.atk : p.attacker.stats.spa) * stageMultiplier(atkStage)
  if (p.intimidateApplied && isPhysical) atk *= stageMultiplier(-1)
  atk = Math.floor(atk)

  // Defense stat with stage. Crits ignore the defender's positive stage.
  let defStage = p.defenderStatStage
  if (p.isCriticalHit && defStage > 0) defStage = 0
  const def = Math.max(
    1,
    Math.floor((isPhysical ? p.defender.stats.def : p.defender.stats.spd) * stageMultiplier(defStage))
  )

  const basePart = Math.floor((2 * level) / 5 + 2)
  const base = Math.floor(Math.floor((basePart * p.move.power * atk) / def) / 50) + 2

  // Ordered multiplier chain (pokeRound at each step, like the games).
  const mods = 1
  let dmgBase = base

  // Spread (multi-target) reduction.
  if (p.isSpreadMove) dmgBase = pokeRound(dmgBase * 0.75)
  // Weather.
  dmgBase = pokeRound(dmgBase * weatherMultiplier(p.weather, p.move.type))
  // Critical hit.
  if (p.isCriticalHit) dmgBase = pokeRound(dmgBase * 1.5)

  const stabMod = stab(p.move.type, p.attacker.types)
  const typeMod = typeMultiplier(p.move.type, p.defender.types)
  const terrainMod = terrainMultiplier(p.terrain, p.move.type)
  const screenMod = screenMultiplier(p)
  const helpingHandMod = p.helpingHand ? 1.5 : 1

  void mods
  const rolls: number[] = []
  for (let i = 0; i < 16; i++) {
    const randomFactor = (85 + i) / 100
    let dmg = Math.floor(dmgBase * randomFactor)
    dmg = pokeRound(dmg * helpingHandMod)
    dmg = pokeRound(dmg * stabMod)
    dmg = Math.floor(dmg * typeMod)
    dmg = pokeRound(dmg * terrainMod)
    dmg = pokeRound(dmg * screenMod)
    rolls.push(Math.max(typeMod === 0 ? 0 : 1, dmg))
  }
  return rolls
}

/** Game-accurate rounding: .5 rounds down. */
function pokeRound(n: number): number {
  return n - Math.floor(n) > 0.5 ? Math.ceil(n) : Math.floor(n)
}

export interface KOChances {
  ohko: number // % of single rolls that meet/exceed defender HP
  twohko: number // % of roll pairs that meet/exceed defender HP
}

export function calcKOChances(rolls: number[], defHP: number): KOChances {
  if (defHP <= 0) return { ohko: 100, twohko: 100 }
  const n = rolls.length || 1

  const ohkoCount = rolls.filter((r) => r >= defHP).length
  let twohkoCount = 0
  for (const a of rolls) for (const b of rolls) if (a + b >= defHP) twohkoCount++

  return {
    ohko: Math.round((ohkoCount / n) * 100),
    twohko: Math.round((twohkoCount / (n * n)) * 100),
  }
}

/** Convenience: min/max roll and % of defender HP. */
export function rollSummary(rolls: number[], defHP: number) {
  const min = Math.min(...rolls)
  const max = Math.max(...rolls)
  return {
    min,
    max,
    minPct: defHP > 0 ? Math.round((min / defHP) * 1000) / 10 : 0,
    maxPct: defHP > 0 ? Math.round((max / defHP) * 1000) / 10 : 0,
  }
}
