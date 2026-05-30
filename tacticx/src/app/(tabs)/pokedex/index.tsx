import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { SearchBar } from '@/components/ui/search-bar'
import { Shimmer } from '@/components/ui/shimmer'
import { Text } from '@/components/ui/text'
import { PokemonRow } from '@/components/shared/PokemonRow'
import { usePokemonInfinite } from '@/lib/api/hooks/usePokemon'
import { useDebounced } from '@/lib/hooks/useDebounced'
import type { ApiPokemon } from '@/lib/api/types'
import { spacing } from '@/lib/theme'

export default function PokedexScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const debounced = useDebounced(search, 300)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePokemonInfinite({
    search: debounced || undefined,
  })

  const items = useMemo<ApiPokemon[]>(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  )

  return (
    <Screen padded>
      <ScreenHeader title="Pokédex" subtitle="Régulation M-A · Champions" />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Nom FR ou EN…" />

      {isLoading ? (
        <View style={styles.loading}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Shimmer key={i} height={72} radius={14} />
          ))}
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(it) => String(it.id)}
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
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  loading: { gap: spacing.sm, marginTop: spacing.md },
  list: { paddingTop: spacing.md, paddingBottom: spacing['3xl'] },
})
