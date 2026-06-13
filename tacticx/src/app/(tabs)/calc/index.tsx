import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { RollingCounter } from '@/components/ui/rolling-counter'
import { Slider } from '@/components/ui/slider'
import { Accordion } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Dropdown } from '@/components/ui/dropdown'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { PokemonPickerSheet } from '@/components/teams/PokemonPickerSheet'
import { MovePickerSheet } from '@/components/calc/MovePickerSheet'
import { TeamPickerSheet } from '@/components/calc/TeamPickerSheet'
import { calcAllStats } from '@/lib/calc/statFormula'
import { calcAllRolls, calcKOChances, rollSummary, type DamageParams } from '@/lib/calc/damageFormula'
import type { BaseStats, StatKey } from '@/lib/calc/types'
import { NATURE_NAMES } from '@/lib/data/natures'
import type { ApiPokemon, ApiMove, ApiTeamSlot } from '@/lib/api/types'
import { TYPE_ORDER, typeColors, colors, radii, spacing, type PokemonType } from '@/lib/theme'

type Category = 'physical' | 'special'
type Mode = 'vgc' | 'singles'

const ZERO_SP: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
const SP_MAX_PER_STAT = 32
const SP_BUDGET = 66

const STAT_ORDER: StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
const STAT_FR: Record<StatKey, string> = {
  hp: 'PV',
  atk: 'Atq',
  def: 'Déf',
  spa: 'Atq S',
  spd: 'Déf S',
  spe: 'Vit',
}
const CATEGORY_ICON: Record<Category, keyof typeof Ionicons.glyphMap> = {
  physical: 'barbell-outline',
  special: 'flash-outline',
}

interface SideConfig {
  sp: BaseStats
  nature: string
}
const DEFAULT_SIDE: SideConfig = { sp: { ...ZERO_SP }, nature: 'Hardy' }

function statsOf(p: ApiPokemon, cfg: SideConfig): Record<StatKey, number> {
  return calcAllStats({
    pokemonId: p.id,
    types: [p.type1, p.type2].filter(Boolean) as PokemonType[],
    base: { hp: p.baseHp, atk: p.baseAtk, def: p.baseDef, spa: p.baseSpa, spd: p.baseSpd, spe: p.baseSpe },
    sp: cfg.sp,
    nature: cfg.nature,
  })
}

function spUsed(sp: BaseStats): number {
  return STAT_ORDER.reduce((acc, k) => acc + (sp[k] ?? 0), 0)
}

export default function CalcScreen() {
  const [mode] = useState<Mode>('vgc')
  const [attacker, setAttacker] = useState<ApiPokemon | null>(null)
  const [defender, setDefender] = useState<ApiPokemon | null>(null)
  const [atkCfg, setAtkCfg] = useState<SideConfig>(DEFAULT_SIDE)
  const [defCfg, setDefCfg] = useState<SideConfig>(DEFAULT_SIDE)
  const [picking, setPicking] = useState<null | 'attacker' | 'defender'>(null)
  const [teamPicking, setTeamPicking] = useState<null | 'attacker' | 'defender'>(null)
  const [movePicking, setMovePicking] = useState(false)

  // Move — picked from attacker learnset (power + type + category), tweakable.
  const [moveName, setMoveName] = useState<string | null>(null)
  const [power, setPower] = useState('80')
  const [moveType, setMoveType] = useState<PokemonType>('normal')
  const [category, setCategory] = useState<Category>('physical')

  // Offensive modifiers.
  const [helpingHand, setHelpingHand] = useState(false)
  const [spreadMove, setSpreadMove] = useState(false)
  const [crit, setCrit] = useState(false)
  const [atkStage, setAtkStage] = useState(0)

  // Defensive modifiers.
  const [intimidate, setIntimidate] = useState(false)
  const [reflect, setReflect] = useState(false)
  const [lightScreen, setLightScreen] = useState(false)
  const [auroraVeil, setAuroraVeil] = useState(false)
  const [defStage, setDefStage] = useState(0)

  // Field conditions.
  const [weather, setWeather] = useState<DamageParams['weather']>('none')
  const [terrain, setTerrain] = useState<DamageParams['terrain']>('none')

  const isDoubles = mode === 'vgc'

  const result = useMemo(() => {
    if (!attacker || !defender) return null
    const aStats = statsOf(attacker, atkCfg)
    const dStats = statsOf(defender, defCfg)
    const params: DamageParams = {
      attacker: { stats: aStats, types: [attacker.type1, attacker.type2].filter(Boolean) as PokemonType[], ability: '', item: '' },
      defender: { stats: dStats, types: [defender.type1, defender.type2].filter(Boolean) as PokemonType[], ability: '', item: '' },
      move: { power: Number(power) || 0, type: moveType, category },
      attackerStatStage: atkStage,
      defenderStatStage: defStage,
      weather,
      terrain,
      helpingHand: helpingHand && isDoubles,
      isSpreadMove: spreadMove && isDoubles,
      reflect,
      lightScreen,
      auroraVeil,
      intimidateApplied: intimidate,
      isCriticalHit: crit,
      isDoubles,
    }
    const rolls = calcAllRolls(params)
    const defHP = dStats.hp
    return { rolls, defHP, ko: calcKOChances(rolls, defHP), summary: rollSummary(rolls, defHP) }
  }, [attacker, defender, atkCfg, defCfg, power, moveType, category, atkStage, defStage, weather, terrain, helpingHand, spreadMove, reflect, lightScreen, auroraVeil, intimidate, crit, isDoubles])

  const koBadge = (() => {
    if (!result) return null
    const { ohko, twohko } = result.ko
    if (ohko === 100) return { label: 'OHKO garanti', tone: colors.danger, soft: colors.dangerSoft, icon: 'skull-outline' as const }
    if (ohko > 0) return { label: `OHKO ${ohko}%`, tone: colors.warning, soft: colors.warningSoft, icon: 'alert-circle-outline' as const }
    if (twohko === 100) return { label: '2HKO garanti', tone: colors.warning, soft: colors.warningSoft, icon: 'alert-circle-outline' as const }
    if (twohko > 0) return { label: `2HKO ${twohko}%`, tone: colors.info, soft: colors.infoSoft, icon: 'alert-circle-outline' as const }
    return { label: 'Survit', tone: colors.success, soft: colors.successSoft, icon: 'shield-checkmark-outline' as const }
  })()

  const swap = () => {
    Haptics.selectionAsync()
    setAttacker(defender)
    setDefender(attacker)
    setAtkCfg(defCfg)
    setDefCfg(atkCfg)
  }

  const offMods = (helpingHand ? 1 : 0) + (spreadMove ? 1 : 0) + (crit ? 1 : 0) + (atkStage !== 0 ? 1 : 0)
  const defMods = (intimidate ? 1 : 0) + (reflect ? 1 : 0) + (lightScreen ? 1 : 0) + (auroraVeil ? 1 : 0) + (defStage !== 0 ? 1 : 0)

  return (
    <Screen padded>
      <ScreenHeader
        title="Calculateur"
        right={
          <View style={styles.headActions}>
            <Pressable onPress={swap} hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="swap-vertical-outline" size={21} color={colors.fg2} />
            </Pressable>
            <Pressable hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="bookmark-outline" size={21} color={colors.fg2} />
            </Pressable>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
       {/*  <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { label: 'VGC', value: 'vgc' },
            { label: 'Singles', value: 'singles' },
          ]}
        /> */}

        {/* ── Attaquant ── */}
        <View style={styles.card}>
          <CardEyebrow role="atk" label="Attaquant" />
          <PokeLine pokemon={attacker} fallback="Choisir l'attaquant" onPress={() => setPicking('attacker')} />

          {/* Capacité — picked from learnset */}
          <Text variant="eyebrow" color="fg3" style={styles.fieldLabel}>
            Capacité
          </Text>
          <Pressable
            style={[styles.moveField, !attacker && styles.moveFieldDisabled]}
            disabled={!attacker}
            onPress={() => setMovePicking(true)}
          >
            <View style={[styles.moveCat, { backgroundColor: colors.surfaceHigh }]}>
              <Ionicons name={CATEGORY_ICON[category]} size={14} color={category === 'physical' ? colors.danger : colors.info} />
            </View>
            <Text variant="body" color={moveName ? 'fg1' : 'fg3'} numberOfLines={1} style={{ flex: 1 }}>
              {moveName ?? (attacker ? 'Choisir une capacité' : 'Choisis un attaquant')}
            </Text>
            {moveName ? <TypeBadge type={moveType} size="xs" /> : null}
            {moveName ? (
              <Text variant="caption" color="fg3" mono>
                {power} pw
              </Text>
            ) : null}
            <Ionicons name="chevron-down" size={16} color={colors.fgFaint} />
          </Pressable>

          {/* Ajustement manuel (catégorie · puissance · type) */}
          <Accordion title="Ajustement manuel" icon="create-outline">
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <SegmentedControl<Category>
                  value={category}
                  onChange={setCategory}
                  options={[
                    { label: 'Physique', value: 'physical' },
                    { label: 'Spéciale', value: 'special' },
                  ]}
                />
              </View>
              <View style={styles.powerBox}>
                <Text variant="caption" color="fg3">
                  Puiss.
                </Text>
                <TextInput value={power} onChangeText={setPower} keyboardType="number-pad" style={styles.powerInput} maxLength={3} />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChips}>
              {TYPE_ORDER.map((t) => {
                const active = t === moveType
                const c = typeColors[t]
                return (
                  <Pressable
                    key={t}
                    onPress={() => setMoveType(t)}
                    style={[styles.typeChip, { borderColor: active ? c.fg : colors.border, backgroundColor: active ? c.bg : colors.surface }]}
                  >
                    <Text variant="caption" weight="semibold" style={{ color: active ? c.fg : colors.fg3 }}>
                      {t}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </Accordion>

          {/* SP offensif (stat pertinente) */}
          {attacker ? (
            <SpSlider
              pokemon={attacker}
              cfg={atkCfg}
              setCfg={setAtkCfg}
              statKey={category === 'physical' ? 'atk' : 'spa'}
              label={category === 'physical' ? 'SP Attaque' : 'SP Att. Spé'}
              withNature
            />
          ) : null}

          {/* Voir tous les SP */}
          {attacker ? <AllSpAccordion pokemon={attacker} cfg={atkCfg} setCfg={setAtkCfg} /> : null}

          {/* Modificateurs offensifs */}
          <Accordion title="Modificateurs" icon="options-outline">
            <CountHint count={offMods} />
            {isDoubles ? (
              <>
                <ToggleRow label="Helping Hand" hint="×1.5" value={helpingHand} onChange={setHelpingHand} />
                <ToggleRow label="Move spread" hint="×0.75" value={spreadMove} onChange={setSpreadMove} />
              </>
            ) : null}
            <ToggleRow label="Coup critique" hint="×1.5" value={crit} onChange={setCrit} />
            <StepperRow label="Boost d'attaque" value={atkStage} onChange={setAtkStage} />
          </Accordion>
        </View>

        <Pressable style={styles.fromTeam} onPress={() => setTeamPicking('attacker')}>
          <Ionicons name="people-outline" size={15} color={colors.fg2} />
          <Text variant="caption" color="fg1">
            Choisir depuis mon équipe
          </Text>
        </Pressable>

        {/* ── Défenseur ── */}
        <View style={styles.card}>
          <CardEyebrow role="def" label="Défenseur" />
          <PokeLine pokemon={defender} fallback="Choisir le défenseur" onPress={() => setPicking('defender')} />

          {defender ? (
            <>
              <SpSlider
                pokemon={defender}
                cfg={defCfg}
                setCfg={setDefCfg}
                statKey={category === 'physical' ? 'def' : 'spd'}
                label={category === 'physical' ? 'SP Défense' : 'SP Déf. Spé'}
              />
              <SpSlider pokemon={defender} cfg={defCfg} setCfg={setDefCfg} statKey="hp" label="SP PV" />
              <AllSpAccordion pokemon={defender} cfg={defCfg} setCfg={setDefCfg} />
            </>
          ) : null}

          <Accordion title="Modificateurs" icon="options-outline">
            <CountHint count={defMods} />
            <ToggleRow label="Intimidation reçue" hint="−1 Atq" value={intimidate} onChange={setIntimidate} />
            {category === 'physical' ? (
              <ToggleRow label="Mur Lumière" hint={isDoubles ? '×0.66' : '×0.5'} value={reflect} onChange={setReflect} />
            ) : (
              <ToggleRow label="Écran Magique" hint={isDoubles ? '×0.66' : '×0.5'} value={lightScreen} onChange={setLightScreen} />
            )}
            <ToggleRow label="Voile Aurore" hint={isDoubles ? '×0.66' : '×0.5'} value={auroraVeil} onChange={setAuroraVeil} />
            <StepperRow label="Boost de défense" value={defStage} onChange={setDefStage} />
          </Accordion>
        </View>

        <Pressable style={styles.fromTeam} onPress={() => setTeamPicking('defender')}>
          <Ionicons name="people-outline" size={15} color={colors.fg2} />
          <Text variant="caption" color="fg1">
            Choisir depuis mon équipe
          </Text>
        </Pressable>

        {/* ── Conditions de terrain ── */}
        <View style={styles.card}>
          <CardEyebrow role="field" label="Conditions de terrain" />
          <CondRow
            label="Météo"
            value={weather}
            onChange={(v) => setWeather(v as DamageParams['weather'])}
            options={[
              { value: 'sun', label: 'Soleil', icon: 'sunny-outline' },
              { value: 'rain', label: 'Pluie', icon: 'rainy-outline' },
              { value: 'sand', label: 'Sable', icon: 'cloud-outline' },
              { value: 'snow', label: 'Grêle', icon: 'snow-outline' },
              { value: 'none', label: 'Aucune', icon: 'close-outline' },
            ]}
          />
          <CondRow
            label="Terrain"
            value={terrain}
            onChange={(v) => setTerrain(v as DamageParams['terrain'])}
            options={[
              { value: 'electric', label: 'Élec', icon: 'flash-outline' },
              { value: 'grassy', label: 'Gram.', icon: 'leaf-outline' },
              { value: 'misty', label: 'Brume', icon: 'water-outline' },
              { value: 'psychic', label: 'Psy', icon: 'sparkles-outline' },
              { value: 'none', label: 'Aucun', icon: 'close-outline' },
            ]}
          />
        </View>

        {/* ── Résultat ── */}
        {result && koBadge ? (
          <View style={styles.result}>
            <View style={styles.resultGlow} />
            <Text variant="eyebrow" color="fg3" center>
              Résultat
            </Text>

            <View style={styles.versus}>
              <PokemonSprite uri={attacker!.spriteUrl} pokemonId={attacker!.id} size={44} />
              <View style={styles.vsArrow}>
                <Text variant="caption" color="fg2" numberOfLines={1}>
                  {power}pw {moveType}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.fg3} />
              </View>
              <PokemonSprite uri={defender!.spriteUrl} pokemonId={defender!.id} size={44} />
            </View>

            <View style={styles.range}>
              <RollingCounter value={result.summary.minPct} decimals={1} variant="h2" />
              <Text variant="h3" color="fgFaint">
                {' – '}
              </Text>
              <RollingCounter value={result.summary.maxPct} decimals={1} variant="h2" suffix=" %" style={{ color: colors.accent }} />
            </View>
            <Text variant="caption" color="fg3" center mono>
              {result.summary.min}–{result.summary.max} sur {result.defHP} PV
            </Text>

            <View style={styles.koWrap}>
              <Badge label={koBadge.label} bg={koBadge.soft} fg={koBadge.tone} size="md" />
            </View>

            <Histogram rolls={result.rolls} defHP={result.defHP} max={result.summary.max} />

            <Pressable style={styles.testInverse} onPress={swap}>
              <Ionicons name="swap-vertical-outline" size={14} color={colors.accent} />
              <Text variant="caption" weight="semibold" style={{ color: colors.accent }}>
                Tester en inverse
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text variant="body" color="fg3" center style={{ marginTop: spacing.lg }}>
            Sélectionne un attaquant et un défenseur.
          </Text>
        )}
      </ScrollView>

      <PokemonPickerSheet
        visible={picking !== null}
        onClose={() => setPicking(null)}
        scopeToggle
        onSelect={(p) => {
          if (picking === 'attacker') {
            setAttacker(p)
            setAtkCfg(DEFAULT_SIDE)
          } else if (picking === 'defender') {
            setDefender(p)
            setDefCfg(DEFAULT_SIDE)
          }
        }}
      />

      <MovePickerSheet
        visible={movePicking}
        pokemonId={attacker?.id ?? null}
        onClose={() => setMovePicking(false)}
        onSelect={(m: ApiMove) => {
          setMoveName(m.nameFr)
          setPower(String(m.power ?? 0))
          setMoveType(m.type.toLowerCase() as PokemonType)
          setCategory(m.category === 'special' ? 'special' : 'physical')
        }}
      />

      <TeamPickerSheet
        visible={teamPicking !== null}
        onClose={() => setTeamPicking(null)}
        onSelect={(pick, slot: ApiTeamSlot) => {
          if (!slot.pokemon) return
          const cfg: SideConfig = { sp: pick.sp, nature: pick.nature }
          if (teamPicking === 'attacker') {
            setAttacker(slot.pokemon)
            setAtkCfg(cfg)
          } else if (teamPicking === 'defender') {
            setDefender(slot.pokemon)
            setDefCfg(cfg)
          }
        }}
      />
    </Screen>
  )
}

/* ─────────────── Subcomponents ─────────────── */

function CardEyebrow({ role, label }: { role: 'atk' | 'def' | 'field'; label: string }) {
  const map = {
    atk: { icon: 'flame-outline' as const, fg: colors.danger, bg: colors.dangerSoft },
    def: { icon: 'shield-outline' as const, fg: colors.info, bg: colors.infoSoft },
    field: { icon: 'partly-sunny-outline' as const, fg: colors.fg2, bg: colors.surfaceHigh },
  }[role]
  return (
    <View style={styles.eyebrow}>
      <View style={[styles.roleIcon, { backgroundColor: map.bg }]}>
        <Ionicons name={map.icon} size={12} color={map.fg} />
      </View>
      <Text variant="eyebrow" color="fg3">
        {label}
      </Text>
    </View>
  )
}

function PokeLine({ pokemon, fallback, onPress }: { pokemon: ApiPokemon | null; fallback: string; onPress: () => void }) {
  return (
    <Pressable style={styles.pokeLine} onPress={onPress}>
      {pokemon ? (
        <PokemonSprite uri={pokemon.spriteUrl} pokemonId={pokemon.id} size={56} />
      ) : (
        <View style={styles.pokeEmpty}>
          <Ionicons name="add" size={26} color={colors.fg3} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.pokeNameRow}>
          <Text variant="bodyMd" weight="semibold" numberOfLines={1}>
            {pokemon?.nameFr ?? fallback}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.fgFaint} />
        </View>
        {pokemon ? (
          <View style={styles.pokeTypes}>
            <TypeBadge type={pokemon.type1} size="xs" />
            {pokemon.type2 ? <TypeBadge type={pokemon.type2} size="xs" /> : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

function SpSlider({
  pokemon,
  cfg,
  setCfg,
  statKey,
  label,
  withNature,
}: {
  pokemon: ApiPokemon
  cfg: SideConfig
  setCfg: (next: SideConfig) => void
  statKey: StatKey
  label: string
  withNature?: boolean
}) {
  const final = statsOf(pokemon, cfg)[statKey]
  const setSp = (v: number) => setCfg({ ...cfg, sp: { ...cfg.sp, [statKey]: v } })
  return (
    <View style={styles.spBlock}>
      <View style={styles.spTop}>
        <Text variant="caption" color="fg3" weight="semibold">
          {label}
        </Text>
        <Text variant="stat" color="fg1">
          {final}
        </Text>
      </View>
      <View style={styles.spBottom}>
        <View style={{ flex: 1 }}>
          <Slider value={cfg.sp[statKey] ?? 0} onChange={setSp} min={0} max={SP_MAX_PER_STAT} />
        </View>
        {withNature ? (
          <View style={styles.natDrop}>
            <Dropdown<string>
              label="Nature"
              value={cfg.nature}
              options={NATURE_NAMES.map((n) => ({ label: n, value: n }))}
              onChange={(v) => setCfg({ ...cfg, nature: v ?? 'Hardy' })}
              searchable
            />
          </View>
        ) : null}
      </View>
    </View>
  )
}

function AllSpAccordion({ pokemon, cfg, setCfg }: { pokemon: ApiPokemon; cfg: SideConfig; setCfg: (n: SideConfig) => void }) {
  const used = spUsed(cfg.sp)
  const left = SP_BUDGET - used
  const stats = statsOf(pokemon, cfg)
  const budgetColor = left > 12 ? colors.success : left >= 4 ? colors.warning : colors.danger
  return (
    <Accordion title="Voir tous les SP" icon="construct-outline">
      <View style={{ gap: spacing.sm }}>
        {STAT_ORDER.map((k) => (
          <View key={k} style={styles.spRow}>
            <Text variant="caption" color="fg3" weight="semibold" style={styles.spRowLabel}>
              {STAT_FR[k]}
            </Text>
            <View style={{ flex: 1 }}>
              <Slider value={cfg.sp[k] ?? 0} onChange={(v) => setCfg({ ...cfg, sp: { ...cfg.sp, [k]: v } })} min={0} max={SP_MAX_PER_STAT} />
            </View>
            <Text variant="caption" color="fg1" mono style={styles.spRowVal}>
              {stats[k]}
            </Text>
            <Text variant="caption" color="fg3" mono style={styles.spRowSp}>
              {cfg.sp[k] ?? 0}
            </Text>
          </View>
        ))}
        <View style={styles.budget}>
          <View style={styles.budgetTop}>
            <Text variant="caption" color="fg3" weight="semibold">
              Budget SP
            </Text>
            <Text variant="caption" mono style={{ color: budgetColor }}>
              {left} restants
            </Text>
          </View>
          <Progress value={Math.min(1, used / SP_BUDGET)} color={budgetColor} />
          <Text variant="caption" color="fgFaint">
            0–32 / stat · {SP_BUDGET} total · Niv. 50
          </Text>
        </View>
      </View>
    </Accordion>
  )
}

function CountHint({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <View style={styles.countHint}>
      <Text variant="caption" weight="semibold" style={{ color: colors.accent }}>
        {count} actif{count > 1 ? 's' : ''}
      </Text>
    </View>
  )
}

function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text variant="caption" color="fg1">
        {label}
        {hint ? <Text variant="caption" color="fg3">{`  ${hint}`}</Text> : null}
      </Text>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync()
          onChange(!value)
        }}
        style={[styles.sw, value && styles.swOn]}
      >
        <View style={[styles.swKnob, value && styles.swKnobOn]} />
      </Pressable>
    </View>
  )
}

function StepperRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const step = (d: number) => {
    const next = Math.max(-6, Math.min(6, value + d))
    if (next !== value) {
      Haptics.selectionAsync()
      onChange(next)
    }
  }
  return (
    <View style={styles.toggleRow}>
      <Text variant="caption" color="fg1">
        {label}
      </Text>
      <View style={styles.stepper}>
        <Pressable onPress={() => step(-1)} style={styles.stepBtn}>
          <Ionicons name="remove" size={14} color={colors.fg1} />
        </Pressable>
        <Text variant="caption" mono style={{ width: 30, textAlign: 'center', color: value > 0 ? colors.accent : value < 0 ? colors.danger : colors.fg1 }}>
          {value > 0 ? `+${value}` : value}
        </Text>
        <Pressable onPress={() => step(1)} style={styles.stepBtn}>
          <Ionicons name="add" size={14} color={colors.fg1} />
        </Pressable>
      </View>
    </View>
  )
}

interface CondOption {
  value: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
}
function CondRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: CondOption[] }) {
  return (
    <View style={styles.condRow}>
      <Text variant="eyebrow" color="fg3" style={styles.fieldLabel}>
        {label}
      </Text>
      <View style={styles.condSeg}>
        {options.map((o) => {
          const active = o.value === value
          return (
            <Pressable
              key={o.value}
              onPress={() => {
                Haptics.selectionAsync()
                onChange(o.value)
              }}
              style={[styles.condBtn, active && styles.condBtnOn]}
            >
              <Ionicons name={o.icon} size={16} color={active ? colors.accent : colors.fg3} />
              <Text variant="caption" style={{ fontSize: 9, color: active ? colors.fg1 : colors.fg3 }} numberOfLines={1}>
                {o.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function Histogram({ rolls, defHP, max }: { rolls: number[]; defHP: number; max: number }) {
  const H = 72
  const peak = Math.max(max, defHP, 1)
  const hpLineBottom = Math.min(1, defHP / peak) * H
  return (
    <View style={styles.histoWrap}>
      <View style={styles.histo}>
        {defHP <= peak ? (
          <View style={[styles.hpLine, { bottom: hpLineBottom }]}>
            <Text variant="caption" style={styles.hpLineLabel}>
              {defHP} PV
            </Text>
          </View>
        ) : null}
        {rolls.map((r, i) => {
          const isKO = r >= defHP
          return <View key={i} style={[styles.histBar, { height: Math.max(3, (r / peak) * H), backgroundColor: isKO ? colors.danger : colors.accent }]} />
        })}
      </View>
      <View style={styles.histoCaption}>
        <Text variant="caption" color="fgFaint" mono style={{ fontSize: 8 }}>
          roll 0.85
        </Text>
        <Text variant="caption" color="fgFaint" mono style={{ fontSize: 8 }}>
          16 rolls
        </Text>
        <Text variant="caption" color="fgFaint" mono style={{ fontSize: 8 }}>
          roll 1.00
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  headActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  roleIcon: { width: 18, height: 18, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },

  pokeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pokeEmpty: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pokeTypes: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },

  fieldLabel: { marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  powerBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  powerInput: { color: colors.fg1, fontSize: 16, fontWeight: '600', minWidth: 36, textAlign: 'center', padding: 0 },
  moveField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  moveFieldDisabled: { opacity: 0.5 },
  moveCat: { width: 26, height: 26, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  typeChips: { gap: spacing.xs, paddingVertical: spacing.xs },
  typeChip: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },

  spBlock: { gap: spacing.xs, marginTop: spacing.xs },
  spTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  natDrop: { width: 120 },

  spRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spRowLabel: { width: 38 },
  spRowVal: { width: 34, textAlign: 'right' },
  spRowSp: { width: 22, textAlign: 'right' },

  budget: {
    marginTop: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  budgetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  countHint: { marginBottom: spacing.xs },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  sw: {
    width: 40,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  swOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  swKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.fgFaint },
  swKnobOn: { backgroundColor: colors.fgInverse, transform: [{ translateX: 16 }] },

  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, overflow: 'hidden' },
  stepBtn: { width: 30, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceHigh },

  fromTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },

  condRow: { marginTop: spacing.xs },
  condSeg: { flexDirection: 'row', gap: 4, backgroundColor: colors.surfaceSunken, borderRadius: radii.md, padding: 3 },
  condBtn: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: spacing.sm, borderRadius: radii.sm },
  condBtnOn: { backgroundColor: colors.surfaceHigh },

  result: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  resultGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 240,
    height: 160,
    borderRadius: 120,
    backgroundColor: colors.accentSoft,
    opacity: 0.5,
  },
  versus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  vsArrow: { alignItems: 'center', gap: 2 },
  range: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  koWrap: { alignItems: 'center', marginVertical: spacing.xs },

  histoWrap: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.sm },
  histo: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 72, position: 'relative' },
  hpLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderTopColor: colors.danger, borderStyle: 'dashed' },
  hpLineLabel: { position: 'absolute', right: 0, top: -13, fontSize: 8, color: colors.danger },
  histBar: { flex: 1, borderRadius: 2 },
  histoCaption: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },

  testInverse: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingTop: spacing.sm },
})
