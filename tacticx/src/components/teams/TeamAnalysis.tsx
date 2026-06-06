import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { Tabs } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeCoverageTable } from '@/components/teams/TypeCoverageTable'
import { SpeedComparison } from '@/components/teams/SpeedComparison'
import { getOffensiveCoverage } from '@/lib/calc/typeCoverage'
import { calcStat } from '@/lib/calc/statFormula'
import type { PokemonSlot } from '@/lib/calc/types'
import { TYPE_ORDER, colors, radii, spacing, type PokemonType } from '@/lib/theme'

/** A team slot enriched with display metadata for the speed tab. */
export interface AnalysisSlot extends PokemonSlot {
  name: string
  spriteUrl?: string | null
}

type AnalysisTab = 'def' | 'off' | 'speed'

export function TeamAnalysis({ slots }: { slots: AnalysisSlot[] }) {
  const [tab, setTab] = useState<AnalysisTab>('def')

  return (
    <View style={{ gap: spacing.md }}>
      <Tabs<AnalysisTab>
        value={tab}
        onChange={setTab}
        items={[
          { label: 'Défensif', value: 'def' },
          { label: 'Offensif', value: 'off' },
          { label: 'Speed', value: 'speed' },
        ]}
      />
      {tab === 'def' && <TypeCoverageTable slots={slots} />}
      {tab === 'off' && <OffensiveCoverage slots={slots} />}
      {tab === 'speed' && <SpeedTiers slots={slots} />}
    </View>
  )
}

/** 18 types with a covered / not-covered indicator (STAB + move types). */
function OffensiveCoverage({ slots }: { slots: AnalysisSlot[] }) {
  const cover = useMemo(() => getOffensiveCoverage(slots), [slots])
  if (slots.length === 0) return <EmptyHint text="Ajoute des Pokémon pour voir la couverture offensive." />

  const gaps = TYPE_ORDER.filter((t) => !cover[t]).length

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" color="fg3">
        {gaps === 0 ? 'Couverture super-efficace complète.' : `${gaps} type(s) non couvert(s) en super-efficace.`}
      </Text>
      <View style={styles.grid}>
        {TYPE_ORDER.map((type) => {
          const ok = cover[type]
          return (
            <View key={type} style={[styles.covCell, { opacity: ok ? 1 : 0.5 }]}>
              <TypeBadge type={type as PokemonType} size="xs" />
              <Ionicons
                name={ok ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color={ok ? colors.success : colors.danger}
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}

/** Slots ranked by final Speed (Champions formula, level 50). */
function SpeedTiers({ slots }: { slots: AnalysisSlot[] }) {
  const [compareOpen, setCompareOpen] = useState(false)
  const ranked = useMemo(
    () =>
      slots
        .map((s) => ({ ...s, spe: calcStat(s.base.spe, s.sp.spe, s.nature, 'spe') }))
        .sort((a, b) => b.spe - a.spe),
    [slots]
  )
  if (ranked.length === 0) return <EmptyHint text="Ajoute des Pokémon pour voir les speed tiers." />

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.table}>
        {ranked.map((s, i) => (
          <View key={`${s.pokemonId}-${i}`} style={[styles.speedRow, i > 0 && styles.speedBorder]}>
            <PokemonSprite uri={s.spriteUrl ?? undefined} pokemonId={s.pokemonId} size={32} />
            <Text variant="caption" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
              {s.name}
            </Text>
            <Text variant="title" mono>
              {s.spe}
            </Text>
            <Text variant="caption" color="fg3" style={{ width: 28 }}>
              Vit
            </Text>
          </View>
        ))}
      </View>

      <Button
        label="Comparer au roster"
        icon="swap-vertical"
        variant="secondary"
        size="sm"
        onPress={() => setCompareOpen(true)}
      />

      <SpeedComparison
        visible={compareOpen}
        onClose={() => setCompareOpen(false)}
        team={ranked.map((s) => ({
          pokemonId: s.pokemonId,
          name: s.name,
          spriteUrl: s.spriteUrl,
          spe: s.spe,
        }))}
      />
    </View>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text variant="caption" color="fg3" center>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  covCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  table: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  speedBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  empty: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
})
