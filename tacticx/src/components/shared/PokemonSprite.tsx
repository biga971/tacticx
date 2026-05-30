import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { Shimmer } from '@/components/ui/shimmer'

export interface PokemonSpriteProps {
  /** Pre-built home sprite URL (preferred). */
  uri?: string
  /** Or a PokeAPI id to build the home sprite URL. */
  pokemonId?: number
  size: number
}

const HOME = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home'

/** Cached Pokémon sprite with shimmer placeholder. */
export function PokemonSprite({ uri, pokemonId, size }: PokemonSpriteProps) {
  const [loaded, setLoaded] = useState(false)
  const source = uri ?? (pokemonId ? `${HOME}/${pokemonId}.png` : undefined)

  return (
    <View style={{ width: size, height: size }}>
      {!loaded && <Shimmer width={size} height={size} radius={size / 2} style={styles.abs} />}
      {source && (
        <Image
          source={source}
          style={{ width: size, height: size }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={150}
          onLoadEnd={() => setLoaded(true)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  abs: { position: 'absolute', top: 0, left: 0 },
})
