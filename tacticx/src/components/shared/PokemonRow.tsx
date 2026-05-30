import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import type { ApiPokemon } from '@/lib/api/types'
import { colors, radii, spacing } from '@/lib/theme'

export interface PokemonRowProps {
  pokemon: ApiPokemon
  onPress?: () => void
  right?: React.ReactNode
}

/** List row: sprite + dex number + name + type badges. */
export function PokemonRow({ pokemon, onPress, right }: PokemonRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <PokemonSprite uri={pokemon.spriteUrl} pokemonId={pokemon.id} size={52} />
      <View style={styles.body}>
        <Text variant="caption" color="fg3" mono>
          #{String(pokemon.id).padStart(4, '0')}
        </Text>
        <Text variant="title">{pokemon.nameFr}</Text>
        <View style={styles.types}>
          <TypeBadge type={pokemon.type1} size="xs" />
          {pokemon.type2 ? <TypeBadge type={pokemon.type2} size="xs" /> : null}
        </View>
      </View>
      {right}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  pressed: { opacity: 0.8 },
  body: { flex: 1, gap: 2 },
  types: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
})
