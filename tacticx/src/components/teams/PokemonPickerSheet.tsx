import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SearchBar } from '@/components/ui/search-bar'
import { Shimmer } from '@/components/ui/shimmer'
import { Text } from '@/components/ui/text'
import { PokemonRow } from '@/components/shared/PokemonRow'
import { usePokemonInfinite } from '@/lib/api/hooks/usePokemon'
import { useRosterInfinite } from '@/lib/api/hooks/useRoster'
import { useDebounced } from '@/lib/hooks/useDebounced'
import type { ApiPokemon } from '@/lib/api/types'
import { colors, radii, spacing } from '@/lib/theme'

type Scope = 'pokemon' | 'roster'

export interface PokemonPickerSheetProps {
  visible: boolean
  onClose: () => void
  onSelect: (pokemon: ApiPokemon) => void
  /** Initial data source: 'pokemon' (national dex) or 'roster' (Champions). Default 'pokemon'. */
  source?: Scope
  /**
   * When true, shows an in-sheet Champions/National toggle (like the Pokédex
   * page) so the user can switch source. Defaults the scope to Champions.
   */
  scopeToggle?: boolean
}

/** Bottom-sheet Pokémon search + pick. */
export function PokemonPickerSheet({
  visible,
  onClose,
  onSelect,
  source = 'pokemon',
  scopeToggle = false,
}: PokemonPickerSheetProps) {
  const [search, setSearch] = useState('')
  const debounced = useDebounced(search, 300)
  const [scope, setScope] = useState<Scope>(scopeToggle ? 'roster' : source)
  const isRoster = scope === 'roster'
  const national = usePokemonInfinite({ search: debounced || undefined }, !isRoster)
  const roster = useRosterInfinite({ search: debounced || undefined }, isRoster)
  const { data, isLoading, fetchNextPage, hasNextPage } = isRoster ? roster : national
  const items = useMemo<ApiPokemon[]>(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.85} title="Choisir un Pokémon">
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Nom FR ou EN…" autoFocus />
        </View>
        {scopeToggle && (
          <Pressable
            onPress={() => setScope((s) => (s === 'roster' ? 'pokemon' : 'roster'))}
            style={[styles.scope, isRoster && styles.scopeOn]}
            accessibilityRole="switch"
            accessibilityState={{ checked: isRoster }}
          >
            <Ionicons
              name={isRoster ? 'trophy' : 'globe-outline'}
              size={16}
              color={isRoster ? colors.accent : colors.fg3}
            />
            <Text variant="caption" weight="semibold" color={isRoster ? 'accent' : 'fg3'}>
              {isRoster ? 'Champions' : 'National'}
            </Text>
          </Pressable>
        )}
      </View>
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
            keyExtractor={(it) => ('key' in it ? (it as { key: string }).key : String(it.id))}
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
})
