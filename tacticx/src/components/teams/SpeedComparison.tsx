import { useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlashList, type FlashListRef } from '@shopify/flash-list'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { useRosterAll } from '@/lib/api/hooks/useRoster'
import { calcStat } from '@/lib/calc/statFormula'
import { colors, radii, spacing } from '@/lib/theme'

/** One configured team member, ranked by its final (SP + nature) Speed. */
export interface TeamSpeedEntry {
  pokemonId: number
  name: string
  spriteUrl?: string | null
  spe: number
}

interface SpeedRow {
  key: string
  pokemonId: number
  name: string
  spriteUrl?: string | null
  spe: number
  inTeam: boolean
}

export interface SpeedComparisonProps {
  visible: boolean
  onClose: () => void
  team: TeamSpeedEntry[]
}

/**
 * Full-roster Speed ranking. Roster mons are shown at their bare base Speed
 * (level 50, no investment); team mons keep their real configured Speed and are
 * flagged. Sorted fastest → slowest so the builder sees exactly what outspeeds
 * their picks. Auto-centers on the fastest team member on open.
 */
export function SpeedComparison({ visible, onClose, team }: SpeedComparisonProps) {
  const { all, loading } = useRosterAll(visible)
  const listRef = useRef<FlashListRef<SpeedRow>>(null)

  const rows = useMemo<SpeedRow[]>(() => {
    const teamIds = new Set(team.map((t) => t.pokemonId))
    const rosterRows: SpeedRow[] = all
      .filter((r) => !teamIds.has(r.id))
      .map((r) => ({
        key: `r-${r.uuid ?? r.id}`,
        pokemonId: r.id,
        name: r.nameFr,
        spriteUrl: r.spriteUrl,
        // Bare base Speed at the Champions level — no SP, neutral nature.
        spe: calcStat(r.baseSpe, 0, 'Hardy', 'spe'),
        inTeam: false,
      }))
    const teamRows: SpeedRow[] = team.map((t, i) => ({
      key: `t-${t.pokemonId}-${i}`,
      pokemonId: t.pokemonId,
      name: t.name,
      spriteUrl: t.spriteUrl,
      spe: t.spe,
      inTeam: true,
    }))
    return [...rosterRows, ...teamRows].sort((a, b) => b.spe - a.spe)
  }, [all, team])

  // Index of the fastest team member (first flagged row once sorted).
  const fastestTeamIndex = useMemo(() => rows.findIndex((r) => r.inTeam), [rows])

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.9} title="Comparaison de vitesse">
      <Text variant="caption" color="fg3" style={{ marginBottom: spacing.sm }}>
        Vitesse de base du roster vs la vitesse réelle de ton équipe. Tout ce qui est au-dessus d'un
        de tes Pokémon le dépasse.
      </Text>

      {loading ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Shimmer key={i} height={56} radius={radii.lg} />
          ))}
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={rows}
          keyExtractor={(it) => it.key}
          initialScrollIndex={fastestTeamIndex > 0 ? fastestTeamIndex : undefined}
          onLoad={() => {
            if (fastestTeamIndex > 0) {
              listRef.current?.scrollToIndex({
                index: fastestTeamIndex,
                viewPosition: 0.5,
                animated: false,
              })
            }
          }}
          renderItem={({ item, index }) => <SpeedComparisonRow row={item} rank={index + 1} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BottomSheet>
  )
}

function SpeedComparisonRow({ row, rank }: { row: SpeedRow; rank: number }) {
  return (
    <View style={[styles.row, row.inTeam && styles.rowTeam]}>
      <Text variant="caption" color="fg3" mono style={styles.rank}>
        {rank}
      </Text>
      <PokemonSprite uri={row.spriteUrl ?? undefined} pokemonId={row.pokemonId} size={32} />
      <Text
        variant="caption"
        weight={row.inTeam ? 'semibold' : 'regular'}
        color={row.inTeam ? 'fg1' : 'fg2'}
        style={{ flex: 1 }}
        numberOfLines={1}
      >
        {row.name}
      </Text>
      {row.inTeam && (
        <View style={styles.badge}>
          <Text variant="caption" weight="semibold" color="accent">
            Équipe
          </Text>
        </View>
      )}
      <Text variant="title" mono color={row.inTeam ? 'accent' : 'fg1'} style={styles.spe}>
        {row.spe}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowTeam: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentMuted,
  },
  rank: { width: 24, textAlign: 'right' },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  spe: { width: 44, textAlign: 'right' },
})
