import { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { Progress } from '@/components/ui/progress'
import { RollingCounter } from '@/components/ui/rolling-counter'
import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { usePokemon } from '@/lib/api/hooks/usePokemon'
import { getDefensiveMultiplier } from '@/lib/calc/typeCoverage'
import { TYPE_ORDER, typeColors, colors, radii, spacing, type PokemonType } from '@/lib/theme'

const STAT_ROWS: { key: keyof StatVals; label: string }[] = [
  { key: 'baseHp', label: 'PV' },
  { key: 'baseAtk', label: 'Att' },
  { key: 'baseDef', label: 'Déf' },
  { key: 'baseSpa', label: 'Att. Spé' },
  { key: 'baseSpd', label: 'Déf. Spé' },
  { key: 'baseSpe', label: 'Vit' },
]
type StatVals = {
  baseHp: number
  baseAtk: number
  baseDef: number
  baseSpa: number
  baseSpd: number
  baseSpe: number
}

const MAX_BASE = 255

/** Bar color by base-stat value (wireframe note #5). */
function statColor(v: number): string {
  if (v >= 120) return colors.success
  if (v >= 100) return colors.accent
  if (v >= 70) return colors.warning
  return colors.danger
}

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  // Pass as number if numeric, otherwise as UUID string
  const pokemonId = id && /^\d+$/.test(id) ? Number(id) : id
  const { data: p, isLoading } = usePokemon(pokemonId)

  const matchups = useMemo(() => {
    if (!p) return { weak: [], resist: [], immune: [] as Matchup[] }
    const types = [p.type1, p.type2].filter(Boolean) as PokemonType[]
    const weak: Matchup[] = []
    const resist: Matchup[] = []
    const immune: Matchup[] = []
    for (const atk of TYPE_ORDER) {
      const m = getDefensiveMultiplier(atk, types)
      if (m === 0) immune.push({ type: atk, mult: m })
      else if (m > 1) weak.push({ type: atk, mult: m })
      else if (m < 1) resist.push({ type: atk, mult: m })
    }
    weak.sort((a, b) => b.mult - a.mult)
    resist.sort((a, b) => a.mult - b.mult)
    return { weak, resist, immune }
  }, [p])

  if (isLoading || !p) {
    return (
      <Screen padded edges={['top']}>
        <BackButton onPress={() => router.back()} />
        <Shimmer width={120} height={120} radius={60} style={{ alignSelf: 'center', marginVertical: spacing.lg }} />
        <Shimmer height={24} width={160} style={{ alignSelf: 'center' }} />
        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          {STAT_ROWS.map((_, i) => (
            <Shimmer key={i} height={20} />
          ))}
        </View>
      </Screen>
    )
  }

  const typeColor = typeColors[p.type1.toLowerCase() as PokemonType]?.fg ?? colors.accent
  const bst = STAT_ROWS.reduce((sum, row) => sum + (p[row.key] as number), 0)

  return (
    <Screen edges={['top']}>
      <View style={[styles.radial, { backgroundColor: typeColor }]} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={() => router.back()} />

        <View style={styles.hero}>
          <PokemonSprite uri={p.spriteUrl} pokemonId={p.id} size={140} />
          <Text variant="caption" color="fg3" mono>
            #{String(p.id).padStart(4, '0')}
          </Text>
          <Text variant="h1">{p.nameFr}</Text>
          <View style={styles.types}>
            <TypeBadge type={p.type1} size="md" />
            {p.type2 ? <TypeBadge type={p.type2} size="md" /> : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.statHead}>
            <Text variant="eyebrow" color="fg3">
              Statistiques de base
            </Text>
            <Text variant="caption" color="fg3" mono>
              BST {bst}
            </Text>
          </View>
          {STAT_ROWS.map((row) => {
            const val = p[row.key] as number
            return (
              <View key={row.key} style={styles.statRow}>
                <Text variant="caption" color="fg3" style={styles.statLabel}>
                  {row.label}
                </Text>
                <RollingCounter value={val} variant="caption" weight="semibold" style={styles.statVal} />
                <View style={{ flex: 1 }}>
                  <Progress value={val / MAX_BASE} color={statColor(val)} height={8} />
                </View>
              </View>
            )
          })}
        </View>

        <View style={styles.section}>
          <Accordion title="Faiblesses & résistances" icon="shield-half-outline" defaultOpen>
            <MatchupGroup label="Faible contre" items={matchups.weak} tone="danger" />
            <MatchupGroup label="Résiste à" items={matchups.resist} tone="success" />
            {matchups.immune.length > 0 && (
              <MatchupGroup label="Immunisé contre" items={matchups.immune} tone="info" />
            )}
          </Accordion>
        </View>

        {p.abilities.length > 0 && (
          <View style={styles.section}>
            <Text variant="eyebrow" color="fg3">
              Talents
            </Text>
            <View style={styles.chips}>
              {p.abilities.map((a) => (
                <View key={a} style={styles.chip}>
                  <Text variant="caption" color="fg2">
                    {a}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.fab, { bottom: insets.bottom + spacing.base }]}>
        <Button
          label="Ajouter à une équipe"
          icon="add"
          fullWidth
          onPress={() => router.push('/(tabs)/teams/builder')}
        />
      </View>
    </Screen>
  )
}

interface Matchup {
  type: PokemonType
  mult: number
}

function MatchupGroup({
  label,
  items,
  tone,
}: {
  label: string
  items: Matchup[]
  tone: 'danger' | 'success' | 'info'
}) {
  if (items.length === 0) return null
  const toneColor = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : colors.info
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text variant="caption" style={{ color: toneColor, marginBottom: spacing.xs }} weight="semibold">
        {label}
      </Text>
      <View style={styles.chips}>
        {items.map((m) => (
          <View key={m.type} style={[styles.matchChip, { borderColor: toneColor }]}>
            <TypeBadge type={m.type} size="xs" />
            <Text variant="caption" color="fg3" mono>
              ×{m.mult}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.back}>
      <Ionicons name="chevron-back" size={24} color={colors.fg1} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  radial: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 0.08,
  },
  content: { paddingHorizontal: spacing.base, gap: spacing.lg },
  back: { marginTop: spacing.sm, alignSelf: 'flex-start' },
  hero: { alignItems: 'center', gap: spacing.xs },
  types: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  section: { gap: spacing.sm },
  statHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statLabel: { width: 56 },
  statVal: { width: 36, textAlign: 'right' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  matchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  fab: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
  },
})
