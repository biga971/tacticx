import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SearchBar } from '@/components/ui/search-bar'
import { Shimmer } from '@/components/ui/shimmer'
import { Text } from '@/components/ui/text'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { usePokemon } from '@/lib/api/hooks/usePokemon'
import type { ApiMove } from '@/lib/api/types'
import { colors, radii, spacing, TOUCH_TARGET } from '@/lib/theme'

const CAT_ICON: Record<ApiMove['category'], keyof typeof Ionicons.glyphMap> = {
  physical: 'barbell-outline',
  special: 'flash-outline',
  status: 'ellipse-outline',
}
const CAT_COLOR: Record<ApiMove['category'], string> = {
  physical: colors.danger,
  special: colors.info,
  status: colors.fg3,
}

export interface MovePickerSheetProps {
  visible: boolean
  /** Pokédex ID of the attacker whose learnset to load. */
  pokemonId: number | null
  onClose: () => void
  onSelect: (move: ApiMove) => void
}

/** Bottom-sheet move picker — lists a Pokémon's learnset from its detail. */
export function MovePickerSheet({ visible, pokemonId, onClose, onSelect }: MovePickerSheetProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePokemon(visible ? pokemonId : null)
  const moves = data?.moveDetails ?? []

  const filtered = useMemo(() => {
    const list = [...moves].sort((a, b) => a.nameFr.localeCompare(b.nameFr))
    if (!search) return list
    const t = search.toLowerCase()
    return list.filter((m) => m.nameFr.toLowerCase().includes(t) || m.nameEn.toLowerCase().includes(t))
  }, [moves, search])

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.8} title="Choisir une capacité">
      <SearchBar value={search} onChangeText={setSearch} placeholder="Nom de capacité…" />
      <ScrollView style={{ marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ gap: spacing.sm }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Shimmer key={i} height={TOUCH_TARGET} radius={radii.md} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <Text variant="body" color="fg3" center style={{ marginTop: spacing.lg }}>
            Aucune capacité.
          </Text>
        ) : (
          filtered.map((m) => (
            <Pressable
              key={m.id}
              style={styles.row}
              onPress={() => {
                onSelect(m)
                onClose()
              }}
            >
              <View style={[styles.cat, { backgroundColor: colors.surfaceHigh }]}>
                <Ionicons name={CAT_ICON[m.category]} size={14} color={CAT_COLOR[m.category]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" color="fg1" numberOfLines={1}>
                  {m.nameFr}
                </Text>
                <View style={styles.meta}>
                  <TypeBadge type={m.type} size="xs" />
                  <Text variant="caption" color="fg3" mono>
                    {m.power ? `${m.power} pw` : '—'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.fgFaint} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: TOUCH_TARGET,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  cat: { width: 28, height: 28, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
})
