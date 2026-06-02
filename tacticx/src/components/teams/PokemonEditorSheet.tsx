import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Pressable } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Text } from '@/components/ui/text'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { RollingCounter } from '@/components/ui/rolling-counter'
import { SelectModal, type SelectOption } from '@/components/ui/select-modal'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { calcStat } from '@/lib/calc/statFormula'
import { NATURES, NATURE_NAMES, type StatKey } from '@/lib/data/natures'
import { POPULAR_SPREADS } from '@/lib/data/spreads'
import { usePokemon } from '@/lib/api/hooks/usePokemon'
import { useItems } from '@/lib/api/hooks/useItems'
import type { ApiPokemon } from '@/lib/api/types'
import { colors, radii, spacing, type PokemonType } from '@/lib/theme'

interface SlotConfig {
  nature: string
  ability: string
  item?: string | null
  move1?: string | null
  move2?: string | null
  move3?: string | null
  move4?: string | null
  spHp: number
  spAtk: number
  spDef: number
  spSpa: number
  spSpd: number
  spSpe: number
}

const MOVE_KEYS = ['move1', 'move2', 'move3', 'move4'] as const

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

  const types = [pokemon.type1, pokemon.type2].filter(Boolean) as PokemonType[]
  const natureLabel = (key: StatKey) => STATS.find((s) => s.key === key)?.label ?? key

  // Item + move data. Detail (moveDetails) is fetched lazily while the sheet is open.
  const detail = usePokemon(visible ? pokemon.id : null)
  const itemsQuery = useItems()

  // Which picker is open: 'item' or a move slot index (0-3).
  const [picker, setPicker] = useState<'item' | number | null>(null)

  const itemOptions = useMemo<SelectOption[]>(
    () => (itemsQuery.data ?? []).map((it) => ({ key: it.nameFr, label: it.nameFr, imageUrl: it.spriteUrl })),
    [itemsQuery.data]
  )
  const selectedItemSprite = useMemo(
    () => (itemsQuery.data ?? []).find((it) => it.nameFr === slot.item)?.spriteUrl ?? null,
    [itemsQuery.data, slot.item]
  )
  const moveOptions = useMemo<SelectOption[]>(
    () =>
      (detail.data?.moveDetails ?? []).map((m) => ({
        key: m.nameFr,
        label: m.nameFr,
        sublabel: `${m.type} · ${m.category}`,
      })),
    [detail.data]
  )

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.9}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
        {/* Pokémon header — photo + name + types + nature */}
        <View style={styles.header}>
          <View style={styles.spriteWrap}>
            <PokemonSprite uri={pokemon.spriteUrl} pokemonId={pokemon.id} size={64} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="h3" numberOfLines={1}>
              {pokemon.nameFr}
            </Text>
            <View style={styles.types}>
              {types.map((t) => (
                <TypeBadge key={t} type={t} size="xs" />
              ))}
            </View>
            <Text variant="caption" color="fg3">
              Nature {slot.nature}
              {nature.plus ? (
                <Text variant="caption" style={{ color: colors.success }}>
                  {`  +${natureLabel(nature.plus)}`}
                </Text>
              ) : null}
              {nature.minus ? (
                <Text variant="caption" style={{ color: colors.danger }}>
                  {`  −${natureLabel(nature.minus)}`}
                </Text>
              ) : null}
            </Text>
          </View>
        </View>

        {/* Ability */}
        <Section label="Talent">
          <View style={styles.chips}>
            {pokemon.abilities.map((a) => (
              <Chip key={a} label={a} active={slot.ability === a} onPress={() => onChange({ ability: a })} />
            ))}
          </View>
        </Section>

        {/* Item */}
        <Section label="Objet">
          <Pressable style={styles.fieldRow} onPress={() => setPicker('item')}>
            {selectedItemSprite ? (
              <Image source={{ uri: selectedItemSprite }} style={styles.itemSprite} contentFit="contain" transition={120} />
            ) : null}
            <Text variant="body" color={slot.item ? 'fg1' : 'fg3'} style={{ flex: 1 }}>
              {slot.item ?? 'Aucun objet'}
            </Text>
            {slot.item ? (
              <Pressable onPress={() => onChange({ item: null })} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.fg3} />
              </Pressable>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={colors.fg3} />
          </Pressable>
        </Section>

        {/* Moves */}
        <Section label="Attaques">
          <View style={{ gap: spacing.sm }}>
            {MOVE_KEYS.map((mk, i) => {
              const move = slot[mk]
              return (
                <Pressable key={mk} style={styles.fieldRow} onPress={() => setPicker(i)}>
                  {move ? (
                    <Text variant="body" style={{ flex: 1 }}>
                      {move}
                    </Text>
                  ) : (
                    <View style={styles.moveEmpty}>
                      <Ionicons name="add" size={16} color={colors.fg3} />
                      <Text variant="body" color="fg3">
                        Ajouter une capacité
                      </Text>
                    </View>
                  )}
                  {move ? (
                    <Pressable onPress={() => onChange({ [mk]: null } as Partial<SlotConfig>)} hitSlop={8}>
                      <Ionicons name="close-circle" size={18} color={colors.fg3} />
                    </Pressable>
                  ) : null}
                </Pressable>
              )
            })}
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

        {/* Popular spreads — one-tap presets */}
        <Section label="Spreads populaires">
          <View style={{ gap: spacing.sm }}>
            {POPULAR_SPREADS.map((sp) => (
              <View key={sp.id} style={styles.presetRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="caption" weight="semibold">
                    {sp.label} · {sp.nature}
                  </Text>
                  <Text variant="caption" color="fg3">
                    {sp.note}
                  </Text>
                </View>
                <Pressable
                  style={styles.applyBtn}
                  onPress={() => onChange({ nature: sp.nature, ...sp.sp })}
                >
                  <Text variant="caption" color="accent" weight="semibold">
                    Appliquer
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      <SelectModal
        visible={picker !== null}
        title={picker === 'item' ? 'Choisir un objet' : 'Choisir une capacité'}
        options={picker === 'item' ? itemOptions : moveOptions}
        selectedKey={picker === 'item' ? slot.item : typeof picker === 'number' ? slot[MOVE_KEYS[picker]] : null}
        allowNone
        noneLabel={picker === 'item' ? 'Aucun objet' : 'Aucune capacité'}
        onSelect={(key) => {
          if (picker === 'item') onChange({ item: key })
          else if (typeof picker === 'number') onChange({ [MOVE_KEYS[picker]]: key } as Partial<SlotConfig>)
        }}
        onClose={() => setPicker(null)}
      />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  spriteWrap: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.lg,
    padding: spacing.xs,
  },
  types: { flexDirection: 'row', gap: spacing.xs },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  moveEmpty: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  itemSprite: { width: 26, height: 26 },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  applyBtn: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
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
