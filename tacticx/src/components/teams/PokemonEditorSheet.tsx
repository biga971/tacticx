import { ScrollView, StyleSheet, View } from 'react-native'
import { Pressable } from 'react-native'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Text } from '@/components/ui/text'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { RollingCounter } from '@/components/ui/rolling-counter'
import { calcStat } from '@/lib/calc/statFormula'
import { NATURES, NATURE_NAMES, type StatKey } from '@/lib/data/natures'
import type { ApiPokemon } from '@/lib/api/types'
import { colors, radii, spacing } from '@/lib/theme'

interface SlotConfig {
  nature: string
  ability: string
  spHp: number
  spAtk: number
  spDef: number
  spSpa: number
  spSpd: number
  spSpe: number
}

export interface PokemonEditorSheetProps {
  visible: boolean
  onClose: () => void
  slot: SlotConfig
  pokemon: ApiPokemon
  onChange: (patch: Partial<SlotConfig>) => void
}

const SP_BUDGET = 66

const STATS: { key: StatKey; label: string; spKey: keyof SlotConfig; base: keyof ApiPokemon }[] = [
  { key: 'hp', label: 'PV', spKey: 'spHp', base: 'baseHp' },
  { key: 'atk', label: 'Att', spKey: 'spAtk', base: 'baseAtk' },
  { key: 'def', label: 'Déf', spKey: 'spDef', base: 'baseDef' },
  { key: 'spa', label: 'Att. Spé', spKey: 'spSpa', base: 'baseSpa' },
  { key: 'spd', label: 'Déf. Spé', spKey: 'spSpd', base: 'baseSpd' },
  { key: 'spe', label: 'Vit', spKey: 'spSpe', base: 'baseSpe' },
]

export function PokemonEditorSheet({ visible, onClose, slot, pokemon, onChange }: PokemonEditorSheetProps) {
  const totalSp = STATS.reduce((sum, s) => sum + (slot[s.spKey] as number), 0)
  const remaining = SP_BUDGET - totalSp
  const nature = NATURES[slot.nature] ?? { plus: null, minus: null }

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.9} title={pokemon.nameFr}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
        {/* Ability */}
        <Section label="Talent">
          <View style={styles.chips}>
            {pokemon.abilities.map((a) => (
              <Chip key={a} label={a} active={slot.ability === a} onPress={() => onChange({ ability: a })} />
            ))}
          </View>
        </Section>

        {/* Nature */}
        <Section label="Nature">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {NATURE_NAMES.map((n) => (
              <Chip key={n} label={n} active={slot.nature === n} onPress={() => onChange({ nature: n })} />
            ))}
          </ScrollView>
        </Section>

        {/* SP budget */}
        <Section label={`Budget SP — ${totalSp}/${SP_BUDGET}`}>
          <Progress value={totalSp / SP_BUDGET} color={remaining < 0 ? colors.danger : colors.accent} height={8} />
        </Section>

        {/* SP sliders */}
        <View style={{ gap: spacing.base }}>
          {STATS.map((s) => {
            const sp = slot[s.spKey] as number
            const base = pokemon[s.base] as number
            const finalStat = calcStat(base, sp, slot.nature, s.key)
            const natureColor =
              nature.plus === s.key ? colors.success : nature.minus === s.key ? colors.danger : colors.fg2
            return (
              <View key={s.key} style={styles.statRow}>
                <View style={styles.statHead}>
                  <Text variant="caption" style={{ color: natureColor }} weight="semibold">
                    {s.label}
                    {nature.plus === s.key ? ' +' : nature.minus === s.key ? ' −' : ''}
                  </Text>
                  <View style={styles.statVals}>
                    <Text variant="caption" color="fg3" mono>
                      {sp} SP
                    </Text>
                    <RollingCounter value={finalStat} variant="title" style={{ width: 44, textAlign: 'right' }} />
                  </View>
                </View>
                <Slider
                  value={sp}
                  min={0}
                  max={32}
                  step={1}
                  color={natureColor}
                  onChange={(v) => {
                    // respect the 66-point budget
                    const others = totalSp - sp
                    const capped = Math.min(v, SP_BUDGET - others)
                    onChange({ [s.spKey]: Math.max(0, capped) } as Partial<SlotConfig>)
                  }}
                />
              </View>
            )
          })}
        </View>
      </ScrollView>
    </BottomSheet>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="eyebrow" color="fg3">
        {label}
      </Text>
      {children}
    </View>
  )
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
    >
      <Text variant="caption" color={active ? 'fg1' : 'fg3'} weight={active ? 'semibold' : 'regular'}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  statRow: { gap: spacing.xs },
  statHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statVals: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
})
