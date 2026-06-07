import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Shimmer } from '@/components/ui/shimmer'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { useToast } from '@/components/ui/toast'
import { useTeams, usePublishTeam } from '@/lib/api/hooks/useTeams'
import { useRewardedGate } from '@/lib/hooks/useRewardedGate'
import { colors, radii, spacing } from '@/lib/theme'

export default function SubmitScreen() {
  const router = useRouter()
  const toast = useToast()
  const { data: teams, isLoading } = useTeams()
  const publish = usePublishTeam()
  const runWithAd = useRewardedGate()
  const [selected, setSelected] = useState<number | null>(null)

  const submit = () => {
    if (!selected) {
      toast.show('Sélectionne une équipe', 'error')
      return
    }
    runWithAd(() => {
      publish.mutate(selected, {
        onSuccess: () => {
          toast.show('Équipe publiée !', 'success')
          router.back()
        },
        onError: () => toast.show('Échec de la publication', 'error'),
      })
    })
  }

  const Body = (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing['3xl'] }}>
      <Text variant="body" color="fg3">
        Choisis une équipe à partager avec la communauté.
      </Text>
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <Shimmer key={i} height={90} radius={14} />)
      ) : (
        teams?.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setSelected(t.id)}
            style={[styles.team, selected === t.id && styles.teamActive]}
          >
            <View style={styles.teamHead}>
              <Text variant="title" style={{ flex: 1 }}>
                {t.name}
              </Text>
              {selected === t.id && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
            </View>
            <View style={styles.sprites}>
              {t.slots?.map((s) => (
                <PokemonSprite key={s.id} uri={s.pokemon?.spriteUrl} pokemonId={s.pokemonId} size={36} />
              ))}
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  )

  return (
    <Screen padded edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.fg1} />
        </Pressable>
        <Text variant="h2" style={{ flex: 1 }}>
          Publier
        </Text>
      </View>

      <View style={{ flex: 1, marginTop: spacing.md }}>{Body}</View>

      <Button label="Publier l'équipe" icon="cloud-upload-outline" fullWidth loading={publish.isPending} onPress={submit} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  team: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  teamActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  teamHead: { flexDirection: 'row', alignItems: 'center' },
  sprites: { flexDirection: 'row', gap: spacing.xs },
})
