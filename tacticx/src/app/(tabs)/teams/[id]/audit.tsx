import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeCoverageTable } from '@/components/teams/TypeCoverageTable'
import { useTeam } from '@/lib/api/hooks/useTeams'
import type { PokemonSlot } from '@/lib/calc/types'
import { colors, spacing, type PokemonType } from '@/lib/theme'

export default function AuditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: team, isLoading } = useTeam(Number(id))

  const coverageSlots = useMemo<(PokemonSlot | null)[]>(() => {
    if (!team?.slots) return []
    return team.slots
      .filter((s) => s.pokemon)
      .map((s) => ({
        pokemonId: s.pokemonId,
        types: [s.pokemon!.type1, s.pokemon!.type2].filter(Boolean) as PokemonType[],
        base: {
          hp: s.pokemon!.baseHp,
          atk: s.pokemon!.baseAtk,
          def: s.pokemon!.baseDef,
          spa: s.pokemon!.baseSpa,
          spd: s.pokemon!.baseSpd,
          spe: s.pokemon!.baseSpe,
        },
        sp: { hp: s.spHp, atk: s.spAtk, def: s.spDef, spa: s.spSpa, spd: s.spSpd, spe: s.spSpe },
        nature: s.nature,
      }))
  }, [team])

  return (
    <Screen padded edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.fg1} />
        </Pressable>
        <Text variant="h2" style={{ flex: 1 }}>
          {team?.name ?? 'Audit'}
        </Text>
      </View>

      {isLoading || !team ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Shimmer height={90} radius={14} />
          <Shimmer height={300} radius={14} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing['3xl'] }}>
          <View style={styles.sprites}>
            {team.slots.map((s) => (
              <PokemonSprite key={s.id} uri={s.pokemon?.spriteUrl} pokemonId={s.pokemonId} size={48} />
            ))}
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text variant="eyebrow" color="fg3">
              Couverture défensive
            </Text>
            <TypeCoverageTable slots={coverageSlots} />
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  sprites: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
})
