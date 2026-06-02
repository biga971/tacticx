import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { SearchBar } from '@/components/ui/search-bar'
import { Shimmer } from '@/components/ui/shimmer'
import { Text } from '@/components/ui/text'
import { PokemonRow } from '@/components/shared/PokemonRow'
import { usePokemonInfinite } from '@/lib/api/hooks/usePokemon'
import { useRosterInfinite } from '@/lib/api/hooks/useRoster'
import { useDebounced } from '@/lib/hooks/useDebounced'
import type { ApiPokemon, ApiRosterPokemon } from '@/lib/api/types'
import { colors, radii, spacing } from '@/lib/theme'

type Scope = 'champions' | 'national'

export default function PokedexScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<Scope>('champions')
  const debounced = useDebounced(search, 300)

  // National dex → pokemon_data; Champions → pokemon_roster (incl. Megas).
  const national = usePokemonInfinite({ search: debounced || undefined }, scope === 'national')
  const champions = useRosterInfinite({ search: debounced || undefined }, scope === 'champions')
  const active = scope === 'champions' ? champions : national
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = active
  const isLoading = active.isLoading

  const items = useMemo<(ApiPokemon | ApiRosterPokemon)[]>(
    () => active.data?.pages.flatMap((p) => p.data) ?? [],
    [active.data]
  )

  return (
    <Screen padded>
      <ScreenHeader title="Pokédex" subtitle="Régulation M-A · Champions" />
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Nom FR ou EN…" />
        </View>
        <Pressable
          onPress={() => setScope((s) => (s === 'champions' ? 'national' : 'champions'))}
          style={[styles.scope, scope === 'champions' && styles.scopeOn]}
          accessibilityRole="switch"
          accessibilityState={{ checked: scope === 'champions' }}
        >
          <Ionicons
            name={scope === 'champions' ? 'trophy' : 'globe-outline'}
            size={16}
            color={scope === 'champions' ? colors.accent : colors.fg3}
          />
          <Text
            variant="caption"
            weight="semibold"
            color={scope === 'champions' ? 'accent' : 'fg3'}
          >
            {scope === 'champions' ? 'Champions' : 'National'}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Shimmer key={i} height={72} radius={14} />
          ))}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            data={items}
            keyExtractor={(it) => ('key' in it ? it.key : String(it.id))}
            renderItem={({ item }) => (
              <PokemonRow pokemon={item} onPress={() => router.push(`/(tabs)/pokedex/${item.id}`)} />
            )}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <Text variant="body" color="fg3" center style={{ marginTop: spacing['2xl'] }}>
                Aucun Pokémon trouvé.
              </Text>
            }
            ListFooterComponent={
              isFetchingNextPage ? <Shimmer height={72} radius={14} style={{ marginTop: spacing.sm }} /> : null
            }
          />
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scope: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  scopeOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  loading: { gap: spacing.sm, marginTop: spacing.md },
  list: { paddingTop: spacing.md, paddingBottom: spacing['3xl'] },
})
