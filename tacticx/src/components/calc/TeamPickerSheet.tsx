import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Shimmer } from '@/components/ui/shimmer'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { useTeams } from '@/lib/api/hooks/useTeams'
import type { ApiTeamSlot } from '@/lib/api/types'
import type { BaseStats } from '@/lib/calc/types'
import { colors, radii, spacing } from '@/lib/theme'

export interface TeamPick {
  pokemonId: number
  sp: BaseStats
  nature: string
}

export interface TeamPickerSheetProps {
  visible: boolean
  onClose: () => void
  /** Prefilled with the slot's SP/nature; pokemon resolved by the caller. */
  onSelect: (pick: TeamPick, slot: ApiTeamSlot) => void
}

function slotSp(s: ApiTeamSlot): BaseStats {
  return { hp: s.spHp, atk: s.spAtk, def: s.spDef, spa: s.spSpa, spd: s.spSpd, spe: s.spSpe }
}

/** Bottom-sheet listing the user's teams; tap a slot to prefill SP + nature. */
export function TeamPickerSheet({ visible, onClose, onSelect }: TeamPickerSheetProps) {
  const { data: teams, isLoading } = useTeams()

  return (
    <BottomSheet visible={visible} onClose={onClose} heightRatio={0.75} title="Choisir depuis mon équipe">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: spacing.sm }}>
        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} height={96} radius={radii.lg} />
            ))}
          </View>
        ) : !teams?.length ? (
          <Text variant="body" color="fg3" center style={{ marginTop: spacing.lg }}>
            Aucune équipe enregistrée.
          </Text>
        ) : (
          teams.map((team) => (
            <View key={team.id} style={styles.group}>
              <View style={styles.gname}>
                <Text variant="eyebrow" color="fg3" numberOfLines={1} style={{ flex: 1 }}>
                  {team.name}
                </Text>
                <Badge label={team.format.toUpperCase()} bg={colors.accentSoft} fg={colors.accent} size="xs" />
              </View>
              <View style={styles.pokes}>
                {team.slots.map((slot) => (
                  <Pressable
                    key={slot.id}
                    style={styles.poke}
                    onPress={() => {
                      onSelect({ pokemonId: slot.pokemonId, sp: slotSp(slot), nature: slot.nature }, slot)
                      onClose()
                    }}
                  >
                    <View style={styles.sprite}>
                      <PokemonSprite uri={slot.pokemon?.spriteUrl} pokemonId={slot.pokemonId} size={48} />
                    </View>
                    <Text variant="caption" color="fg2" numberOfLines={1} style={styles.pn}>
                      {slot.pokemon?.nameFr ?? slot.nickname ?? '—'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.lg },
  gname: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  pokes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  poke: { width: 60, alignItems: 'center', gap: spacing.xs },
  sprite: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pn: { textAlign: 'center', fontSize: 9 },
})
