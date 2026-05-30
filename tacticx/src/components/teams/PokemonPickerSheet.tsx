import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SearchBar } from '@/components/ui/search-bar'
import { Shimmer } from '@/components/ui/shimmer'
import { PokemonRow } from '@/components/shared/PokemonRow'
import { usePokemonInfinite } from '@/lib/api/hooks/usePokemon'
import { useDebounced } from '@/lib/hooks/useDebounced'
import type { ApiPokemon } from '@/lib/api/types'
import { spacing } from '@/lib/theme'

export interface PokemonPickerSheetProps {
  visible: boolean
  onClose: () => void
  onSelect: (pokemon: ApiPokemon) => void
}

/** Bottom-sheet Pokémon search + pick. */
export function PokemonPickerSheet({ visible, onClose, onSelect }: PokemonPickerSheetProps) {
  const [search, setSearch] = useState('')
  const debounced = useDebounced(search, 300)
  const { data, isLoading, fetchNextPage, hasNextPage } = usePokemonInfinite({
    search: debounced || undefined,
  })
  const items = useMemo<ApiPokemon[]>(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.85} title="Choisir un Pokémon">
      <SearchBar value={search} onChangeText={setSearch} placeholder="Nom FR ou EN…" autoFocus />
      <View style={{ flex: 1, marginTop: spacing.md }}>
        {isLoading ? (
          <View style={{ gap: spacing.sm }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} height={72} radius={14} />
            ))}
          </View>
        ) : (
          <FlashList
            data={items}
            keyExtractor={(it) => String(it.id)}
            renderItem={({ item }) => (
              <PokemonRow
                pokemon={item}
                onPress={() => {
                  onSelect(item)
                  onClose()
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </BottomSheet>
  )
}
