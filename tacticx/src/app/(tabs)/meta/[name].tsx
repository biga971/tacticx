import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { Progress } from '@/components/ui/progress'
import { Accordion } from '@/components/ui/accordion'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { useMetaDetail } from '@/lib/api/hooks/useMeta'
import { useFormatStore } from '@/lib/store/formatStore'
import type { ApiUsageEntry, ApiSpreadEntry, ApiMetaMove, ApiMetaTeammate } from '@/lib/api/types'
import { typeColors, colors, radii, spacing, type PokemonType } from '@/lib/theme'

function pct(v: number | null | undefined): string {
  return v != null ? `${(v * 100).toFixed(1)}%` : '—'
}

/** Icon per move category (physical / special / status). */
const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  physical: 'barbell-outline',
  special: 'flash-outline',
  status: 'shield-half-outline',
}

function typeColor(type: string | null | undefined): { fg: string; bg: string } {
  if (!type) return { fg: colors.fg3, bg: colors.surfaceHigh }
  return typeColors[type.toLowerCase() as PokemonType] ?? { fg: colors.fg3, bg: colors.surfaceHigh }
}

export default function MetaDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { format } = useFormatStore()
  const { data: res, isLoading } = useMetaDetail(format, name ?? null)
  const entry = res?.data

  if (isLoading || !entry) {
    return (
      <Screen padded edges={['top']}>
        <BackButton onPress={() => router.back()} />
        <Shimmer width={120} height={120} radius={60} style={{ alignSelf: 'center', marginVertical: spacing.lg }} />
        <Shimmer height={24} width={160} style={{ alignSelf: 'center' }} />
        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} height={48} radius={14} />
          ))}
        </View>
      </Screen>
    )
  }

  const p = entry.pokemon
  const heroColor = p ? typeColor(p.type1).fg : colors.accent

  return (
    <Screen edges={['top']}>
      <View style={[styles.radial, { backgroundColor: heroColor }]} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={() => router.back()} />

        <View style={styles.hero}>
          {p ? (
            <>
              <PokemonSprite uri={p.spriteUrl} pokemonId={p.id} size={120} />
              <Text variant="h1">{p.nameFr}</Text>
              <View style={styles.types}>
                <TypeBadge type={p.type1} size="md" />
                {p.type2 ? <TypeBadge type={p.type2} size="md" /> : null}
              </View>
            </>
          ) : (
            <Text variant="h1">{entry.pokemonName}</Text>
          )}
        </View>

        {/* Top-line stats: rank / usage / winrate */}
        <View style={styles.statBar}>
          <StatPill label="Rang" value={entry.rank != null ? `#${entry.rank}` : '—'} color={heroColor} />
          <StatPill label="Usage" value={pct(entry.usageRate)} color={heroColor} />
          <StatPill label="Winrate" value={pct(entry.winRate)} color={heroColor} />
        </View>

        {/* Collapsible sections */}
        <View style={styles.sections}>
          {entry.moves?.length ? (
            <Accordion title="Attaques" icon="flash-outline" defaultOpen>
              {entry.moves.map((m) => (
                <MoveRow key={m.name} move={m} />
              ))}
            </Accordion>
          ) : null}

          {entry.teammates?.length ? (
            <Accordion title="Coéquipiers" icon="people-outline">
              {entry.teammates.map((t) => (
                <TeammateRow key={t.name} teammate={t} color={heroColor} />
              ))}
            </Accordion>
          ) : null}

          {entry.items?.length ? (
            <Accordion title="Objets" icon="briefcase-outline">
              {entry.items.map((it) => (
                <UsageRow key={it.name} name={it.name} usageRate={it.usageRate} color={heroColor} />
              ))}
            </Accordion>
          ) : null}

          {entry.abilities?.length ? (
            <Accordion title="Talents" icon="sparkles-outline">
              {entry.abilities.map((a) => (
                <UsageRow key={a.name} name={a.name} usageRate={a.usageRate} color={heroColor} />
              ))}
            </Accordion>
          ) : null}

          {entry.spreads?.length ? (
            <Accordion title="Répartitions d'EV" icon="options-outline">
              {entry.spreads.map((s, i) => (
                <SpreadRow key={`${s.spreadString}-${i}`} spread={s} color={heroColor} />
              ))}
            </Accordion>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.pill}>
      <Text variant="caption" color="fg3">
        {label}
      </Text>
      <Text variant="stat" style={{ color }}>
        {value}
      </Text>
    </View>
  )
}

/** Move row: type-colored chip + category icon + usage bar. */
function MoveRow({ move }: { move: ApiMetaMove }) {
  const tc = typeColor(move.type)
  const catIcon = move.category ? CATEGORY_ICON[move.category] : null
  return (
    <View style={styles.moveRow}>
      <View style={styles.moveHead}>
        <View style={[styles.typeDot, { backgroundColor: tc.fg }]} />
        <Text variant="caption" color="fg2" numberOfLines={1} style={{ flex: 1 }}>
          {move.nameFr}
        </Text>
        {catIcon ? <Ionicons name={catIcon} size={14} color={tc.fg} /> : null}
        <Text variant="caption" color="fg3" mono>
          {pct(move.usageRate)}
        </Text>
      </View>
      <Progress value={move.usageRate} color={tc.fg} height={6} />
    </View>
  )
}

/** Teammate row: sprite + name + usage. */
function TeammateRow({ teammate, color }: { teammate: ApiMetaTeammate; color: string }) {
  return (
    <View style={styles.teammateRow}>
      {teammate.spriteUrl ? (
        <PokemonSprite uri={teammate.spriteUrl} pokemonId={teammate.pokemonId ?? 0} size={40} />
      ) : (
        <View style={styles.teammateFallback}>
          <Ionicons name="help" size={18} color={colors.fg3} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.usageHead}>
          <Text variant="caption" color="fg2" numberOfLines={1} style={{ flex: 1 }}>
            {teammate.nameFr}
          </Text>
          <Text variant="caption" color="fg3" mono>
            {pct(teammate.usageRate)}
          </Text>
        </View>
        <Progress value={teammate.usageRate} color={color} height={6} />
      </View>
    </View>
  )
}

function UsageRow({ name, usageRate, color }: { name: string; usageRate: number; color: string }) {
  return (
    <View style={styles.usageRow}>
      <View style={styles.usageHead}>
        <Text variant="caption" color="fg2" numberOfLines={1} style={{ flex: 1 }}>
          {name}
        </Text>
        <Text variant="caption" color="fg3" mono>
          {pct(usageRate)}
        </Text>
      </View>
      <Progress value={usageRate} color={color} height={6} />
    </View>
  )
}

function SpreadRow({ spread, color }: { spread: ApiSpreadEntry; color: string }) {
  return (
    <View style={styles.spreadRow}>
      <View style={{ flex: 1 }}>
        <Text variant="caption" color="fg2" mono>
          {spread.spreadString}
        </Text>
        {spread.nature ? (
          <Text variant="caption" color="fg3">
            {spread.nature}
          </Text>
        ) : null}
      </View>
      <Text variant="caption" style={{ color }} mono>
        {pct(spread.usageRate)}
      </Text>
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
  statBar: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
  },
  sections: { gap: spacing.sm },
  moveRow: { gap: spacing.xs, marginTop: spacing.sm },
  moveHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  teammateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  teammateFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  usageRow: { gap: spacing.xs, marginTop: spacing.sm },
  usageHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
})
