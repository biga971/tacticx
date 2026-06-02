import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Tabs } from '@/components/ui/tabs'
import { Shimmer } from '@/components/ui/shimmer'
import { Text } from '@/components/ui/text'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { PokemonRow } from '@/components/shared/PokemonRow'
import { useMeta } from '@/lib/api/hooks/useMeta'
import { useFormatStore, type Format } from '@/lib/store/formatStore'
import type { ApiMetaEntry } from '@/lib/api/types'
import { colors, radii, spacing } from '@/lib/theme'

type MetaTab = 'usage' | 'winrate' | 'cores'

/** Right-aligned stat per row, depending on the active tab. */
function rowStat(entry: ApiMetaEntry, tab: MetaTab): string {
  if (tab === 'winrate') return entry.winRate != null ? `${(entry.winRate * 100).toFixed(1)}%` : '—'
  return entry.usageRate != null ? `${(entry.usageRate * 100).toFixed(1)}%` : '—'
}

export default function MetaScreen() {
  const router = useRouter()
  const { format, setFormat } = useFormatStore()
  const [tab, setTab] = useState<MetaTab>('usage')

  const sort = tab === 'winrate' ? 'winrate' : 'usage'
  const { data, isLoading } = useMeta(format, sort)
  const items = useMemo<ApiMetaEntry[]>(() => (data?.data ?? []).filter((e) => e.pokemon), [data])

  return (
    <Screen padded>
      <ScreenHeader
        title="Méta"
        right={
          <View style={{ width: 150 }}>
            <SegmentedControl<Format>
              value={format}
              onChange={setFormat}
              options={[
                { label: 'VGC', value: 'vgc' },
                { label: 'Singles', value: '3v3' },
              ]}
            />
          </View>
        }
      />

      <PremiumLock featureName="l'historique méta" featureIcon="analytics-outline">
        <View style={styles.sparkCard}>
          <Text variant="eyebrow" color="fg3">
            Tendance 30 jours
          </Text>
          <View style={styles.sparkline}>
            {[12, 18, 9, 22, 16, 28, 20, 32, 25, 38].map((h, i) => (
              <View key={i} style={[styles.bar, { height: h }]} />
            ))}
          </View>
        </View>
      </PremiumLock>

      <View style={{ marginVertical: spacing.md }}>
        <Tabs<MetaTab>
          value={tab}
          onChange={setTab}
          items={[
            { label: 'Usage', value: 'usage' },
            { label: 'Winrate', value: 'winrate' },
            { label: 'Cores', value: 'cores' },
          ]}
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Shimmer key={i} height={72} radius={14} />
          ))}
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(it) => it.pokemonName}
          renderItem={({ item }) => (
            <PokemonRow
              pokemon={item.pokemon!}
              onPress={() => router.push(`/(tabs)/pokedex/${item.pokemon!.id}`)}
              right={
                <View style={styles.statCol}>
                  <Text variant="stat">{rowStat(item, tab)}</Text>
                  {item.rank != null ? (
                    <Text variant="caption" color="fg3">
                      #{item.rank}
                    </Text>
                  ) : null}
                </View>
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text variant="body" color="fg3" center style={{ marginTop: spacing['2xl'] }}>
              Données méta indisponibles. Lance la synchro côté serveur.
            </Text>
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  sparkCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  sparkline: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 40 },
  bar: { flex: 1, backgroundColor: colors.accent, borderRadius: 2 },
  loading: { gap: spacing.sm },
  list: { paddingBottom: spacing['3xl'] },
  statCol: { alignItems: 'flex-end', minWidth: 52 },
})
