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
import { usePokemonInfinite } from '@/lib/api/hooks/usePokemon'
import { useFormatStore, type Format } from '@/lib/store/formatStore'
import type { ApiPokemon } from '@/lib/api/types'
import { colors, radii, spacing } from '@/lib/theme'

type MetaTab = 'usage' | 'winrate' | 'cores'

export default function MetaScreen() {
  const router = useRouter()
  const { format, setFormat } = useFormatStore()
  const [tab, setTab] = useState<MetaTab>('usage')

  const { data, isLoading, fetchNextPage, hasNextPage } = usePokemonInfinite({ inRegMa: true })
  const items = useMemo<ApiPokemon[]>(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

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
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item, index }) => (
            <PokemonRow
              pokemon={item}
              onPress={() => router.push(`/(tabs)/pokedex/${item.id}`)}
              right={
                <Text variant="stat" color="fg3" style={{ width: 32 }}>
                  {index + 1}
                </Text>
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text variant="body" color="fg3" center style={{ marginTop: spacing['2xl'] }}>
              Données méta indisponibles.
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
})
