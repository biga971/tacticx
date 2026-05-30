import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { RollingCounter } from '@/components/ui/rolling-counter'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { PokemonPickerSheet } from '@/components/teams/PokemonPickerSheet'
import { calcAllStats } from '@/lib/calc/statFormula'
import { calcAllRolls, calcKOChances, rollSummary, type DamageParams } from '@/lib/calc/damageFormula'
import type { ApiPokemon } from '@/lib/api/types'
import { TYPE_ORDER, typeColors, colors, radii, spacing, type PokemonType } from '@/lib/theme'

type Category = 'physical' | 'special'

function toStats(p: ApiPokemon) {
  return calcAllStats(
    {
      pokemonId: p.id,
      types: [p.type1, p.type2].filter(Boolean) as PokemonType[],
      base: { hp: p.baseHp, atk: p.baseAtk, def: p.baseDef, spa: p.baseSpa, spd: p.baseSpd, spe: p.baseSpe },
      sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      nature: 'Hardy',
    },
  )
}

export default function CalcScreen() {
  const [attacker, setAttacker] = useState<ApiPokemon | null>(null)
  const [defender, setDefender] = useState<ApiPokemon | null>(null)
  const [picking, setPicking] = useState<null | 'attacker' | 'defender'>(null)
  const [power, setPower] = useState('80')
  const [moveType, setMoveType] = useState<PokemonType>('normal')
  const [category, setCategory] = useState<Category>('physical')
  const [weather, setWeather] = useState<DamageParams['weather']>('none')

  const result = useMemo(() => {
    if (!attacker || !defender) return null
    const aStats = toStats(attacker)
    const dStats = toStats(defender)
    const params: DamageParams = {
      attacker: {
        stats: aStats,
        types: [attacker.type1, attacker.type2].filter(Boolean) as PokemonType[],
        ability: '',
        item: '',
      },
      defender: {
        stats: dStats,
        types: [defender.type1, defender.type2].filter(Boolean) as PokemonType[],
        ability: '',
        item: '',
      },
      move: { power: Number(power) || 0, type: moveType, category },
      attackerStatStage: 0,
      defenderStatStage: 0,
      weather,
      terrain: 'none',
      helpingHand: false,
      isSpreadMove: false,
      reflect: false,
      lightScreen: false,
      auroraVeil: false,
      intimidateApplied: false,
      isCriticalHit: false,
      isDoubles: false,
    }
    const rolls = calcAllRolls(params)
    const defHP = dStats.hp
    const ko = calcKOChances(rolls, defHP)
    const summary = rollSummary(rolls, defHP)
    return { rolls, defHP, ko, summary }
  }, [attacker, defender, power, moveType, category, weather])

  const koBadge = (() => {
    if (!result) return null
    if (result.ko.ohko === 100) return { label: 'OHKO garanti', tone: colors.danger }
    if (result.ko.ohko > 0) return { label: `OHKO ${result.ko.ohko}%`, tone: colors.warning }
    if (result.ko.twohko === 100) return { label: '2HKO garanti', tone: colors.warning }
    if (result.ko.twohko > 0) return { label: `2HKO ${result.ko.twohko}%`, tone: colors.info }
    return { label: 'Survit', tone: colors.success }
  })()

  return (
    <Screen padded>
      <ScreenHeader title="Calc" subtitle="Calculateur de dégâts Champions" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing['3xl'] }}>
        <View style={styles.duel}>
          <PokemonSlot label="Attaquant" pokemon={attacker} onPress={() => setPicking('attacker')} />
          <Ionicons name="flash" size={20} color={colors.accent} />
          <PokemonSlot label="Défenseur" pokemon={defender} onPress={() => setPicking('defender')} />
        </View>

        <View style={styles.section}>
          <Text variant="eyebrow" color="fg3">
            Attaque
          </Text>
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
              <TextInput
                value={power}
                onChangeText={setPower}
                keyboardType="number-pad"
                style={styles.powerInput}
                maxLength={3}
              />
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
                  <Text variant="caption" style={{ color: active ? c.fg : colors.fg3 }} weight="semibold">
                    {t}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text variant="eyebrow" color="fg3">
            Météo
          </Text>
          <SegmentedControl
            value={weather}
            onChange={(v) => setWeather(v as DamageParams['weather'])}
            options={[
              { label: 'Aucune', value: 'none' },
              { label: 'Soleil', value: 'sun' },
              { label: 'Pluie', value: 'rain' },
            ]}
          />
        </View>

        {result && koBadge ? (
          <View style={styles.result}>
            <View style={styles.resultHead}>
              <View>
                <Text variant="eyebrow" color="fg3">
                  Dégâts
                </Text>
                <View style={styles.range}>
                  <RollingCounter value={result.summary.minPct} decimals={1} variant="h2" />
                  <Text variant="h3" color="fg3">
                    {' – '}
                  </Text>
                  <RollingCounter value={result.summary.maxPct} decimals={1} variant="h2" suffix="%" />
                </View>
                <Text variant="caption" color="fg3" mono>
                  {result.summary.min}–{result.summary.max} sur {result.defHP} PV
                </Text>
              </View>
              <Badge label={koBadge.label} bg={colors.surfaceHigh} fg={koBadge.tone} size="md" />
            </View>

            <View style={styles.histogram}>
              {result.rolls.map((r, i) => {
                const ratio = result.summary.max > 0 ? r / result.summary.max : 0
                const isKO = r >= result.defHP
                return (
                  <View
                    key={i}
                    style={[
                      styles.histBar,
                      { height: 8 + ratio * 56, backgroundColor: isKO ? colors.danger : colors.accent },
                    ]}
                  />
                )
              })}
            </View>
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
        onSelect={(p) => {
          if (picking === 'attacker') setAttacker(p)
          else if (picking === 'defender') setDefender(p)
        }}
      />
    </Screen>
  )
}

function PokemonSlot({ label, pokemon, onPress }: { label: string; pokemon: ApiPokemon | null; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.slot}>
      {pokemon ? (
        <PokemonSprite uri={pokemon.spriteUrl} pokemonId={pokemon.id} size={64} />
      ) : (
        <View style={styles.slotEmpty}>
          <Ionicons name="add" size={28} color={colors.fg3} />
        </View>
      )}
      <Text variant="caption" color="fg3">
        {pokemon?.nameFr ?? label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  duel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  slot: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  slotEmpty: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  powerBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  powerInput: { color: colors.fg1, fontSize: 18, fontWeight: '600', minWidth: 40, textAlign: 'center' },
  typeChips: { gap: spacing.sm, paddingVertical: spacing.xs },
  typeChip: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  result: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.base,
  },
  resultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  range: { flexDirection: 'row', alignItems: 'baseline' },
  histogram: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 64 },
  histBar: { flex: 1, borderRadius: 2 },
})
