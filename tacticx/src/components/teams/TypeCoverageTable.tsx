import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { getTeamWeaknesses, isDangerType } from '@/lib/calc/typeCoverage'
import type { PokemonSlot } from '@/lib/calc/types'
import { TYPE_ORDER, colors, radii, spacing, type PokemonType } from '@/lib/theme'

export interface TypeCoverageTableProps {
  slots: (PokemonSlot | null)[]
  readonly?: boolean
}

function cellStyle(mult: number) {
  if (mult === 0) return { bg: colors.infoSoft, fg: colors.info, label: 'IMM' }
  if (mult >= 4) return { bg: colors.dangerSoft, fg: colors.danger, label: '4×' }
  if (mult === 2) return { bg: colors.warningSoft, fg: colors.warning, label: '2×' }
  if (mult === 1) return { bg: 'transparent', fg: colors.fgFaint, label: '·' }
  if (mult === 0.5) return { bg: colors.successSoft, fg: colors.success, label: '½' }
  if (mult < 1) return { bg: colors.successSoft, fg: colors.success, label: '¼' }
  return { bg: 'transparent', fg: colors.fg3, label: `${mult}×` }
}

/** 18 rows × N slots defensive matrix with DANGER alerts. */
export function TypeCoverageTable({ slots }: TypeCoverageTableProps) {
  const weaknesses = useMemo(() => getTeamWeaknesses(slots), [slots])
  const slotCount = slots.filter(Boolean).length

  if (slotCount === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="caption" color="fg3">
          Ajoute des Pokémon pour voir la couverture défensive.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headRow]}>
        <View style={styles.typeCell} />
        <View style={styles.cells} />
        <View style={styles.scoreCell}>
          <Text variant="caption" color="fg3" style={{ fontSize: 9 }} weight="semibold">
            SCORE
          </Text>
        </View>
      </View>
      {TYPE_ORDER.map((type) => {
        const row = weaknesses[type] ?? []
        const danger = isDangerType(weaknesses, type)
        const score = row.filter((m) => m > 1).length
        const sc = scoreStyle(score)
        return (
          <View key={type} style={[styles.row, danger && styles.rowDanger]}>
            <View style={styles.typeCell}>
              <TypeBadge type={type as PokemonType} size="xs" />
              {danger && <Ionicons name="warning-outline" size={12} color={colors.danger} />}
            </View>
            <View style={styles.cells}>
              {row.map((mult, i) => {
                const c = cellStyle(mult)
                return (
                  <View key={i} style={[styles.cell, { backgroundColor: c.bg }]}>
                    <Text variant="caption" style={{ color: c.fg, fontSize: 10 }} weight="semibold">
                      {c.label}
                    </Text>
                  </View>
                )
              })}
            </View>
            <View style={styles.scoreCell}>
              <View style={[styles.scoreBadge, { backgroundColor: sc.bg }]}>
                <Text variant="caption" style={{ color: sc.fg, fontSize: 11 }} weight="semibold" mono>
                  {score}
                </Text>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

/** Score badge color: red ≥ 4 weak slots, orange ≥ 2, muted otherwise. */
function scoreStyle(score: number) {
  if (score >= 4) return { bg: colors.dangerSoft, fg: colors.danger }
  if (score >= 2) return { bg: colors.warningSoft, fg: colors.warning }
  return { bg: 'transparent', fg: colors.fgFaint }
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
  headRow: { paddingVertical: 4, backgroundColor: colors.surfaceHigh },
  rowDanger: { backgroundColor: colors.dangerSoft },
  typeCell: { width: 76, flexDirection: 'row', alignItems: 'center', gap: 4 },
  cells: { flex: 1, flexDirection: 'row', gap: 4 },
  scoreCell: { width: 34, alignItems: 'center', justifyContent: 'center' },
  scoreBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    flex: 1,
    height: 26,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
})
