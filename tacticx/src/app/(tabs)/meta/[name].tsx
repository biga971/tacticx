import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { Progress } from '@/components/ui/progress'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { useMetaDetail } from '@/lib/api/hooks/useMeta'
import { useFormatStore } from '@/lib/store/formatStore'
import type { ApiUsageEntry, ApiSpreadEntry } from '@/lib/api/types'
import { typeColors, colors, radii, spacing, type PokemonType } from '@/lib/theme'

function pct(v: number | null | undefined): string {
  return v != null ? `${(v * 100).toFixed(1)}%` : '—'
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
            <Shimmer key={i} height={20} />
          ))}
        </View>
      </Screen>
    )
  }

  const p = entry.pokemon
  const typeColor = p
    ? typeColors[p.type1.toLowerCase() as PokemonType]?.fg ?? colors.accent
    : colors.accent

  return (
    <Screen edges={['top']}>
      <View style={[styles.radial, { backgroundColor: typeColor }]} />
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
          <StatPill label="Rang" value={entry.rank != null ? `#${entry.rank}` : '—'} color={typeColor} />
          <StatPill label="Usage" value={pct(entry.usageRate)} color={typeColor} />
          <StatPill label="Winrate" value={pct(entry.winRate)} color={typeColor} />
        </View>

        <UsageSection title="Attaques" icon="flash-outline" items={entry.moves} color={typeColor} />
        <UsageSection title="Objets" icon="briefcase-outline" items={entry.items} color={typeColor} />
        <UsageSection title="Talents" icon="sparkles-outline" items={entry.abilities} color={typeColor} />
        <UsageSection title="Coéquipiers" icon="people-outline" items={entry.teammates} color={typeColor} />
        <SpreadSection title="Répartitions d'EV" spreads={entry.spreads} color={typeColor} />
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

function UsageSection({
  title,
  icon,
  items,
  color,
}: {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  items: ApiUsageEntry[]
  color: string
}) {
  if (!items?.length) return null
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={16} color={colors.fg3} />
        <Text variant="eyebrow" color="fg3">
          {title}
        </Text>
      </View>
      {items.map((it) => (
        <UsageRow key={it.name} name={it.name} usageRate={it.usageRate} color={color} />
      ))}
    </View>
  )
}

function SpreadSection({
  title,
  spreads,
  color,
}: {
  title: string
  spreads: ApiSpreadEntry[]
  color: string
}) {
  if (!spreads?.length) return null
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name="options-outline" size={16} color={colors.fg3} />
        <Text variant="eyebrow" color="fg3">
          {title}
        </Text>
      </View>
      {spreads.map((s, i) => (
        <View key={`${s.spreadString}-${i}`} style={styles.spreadRow}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color="fg2" mono>
              {s.spreadString}
            </Text>
            {s.nature ? (
              <Text variant="caption" color="fg3">
                {s.nature}
              </Text>
            ) : null}
          </View>
          <Text variant="caption" style={{ color }} mono>
            {pct(s.usageRate)}
          </Text>
        </View>
      ))}
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
  section: { gap: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  usageRow: { gap: spacing.xs },
  usageHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
})
