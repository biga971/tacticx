import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { Button } from '@/components/ui/button'
import { Accordion } from '@/components/ui/accordion'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { PremiumLock } from '@/components/shared/PremiumLock'
import { useToast } from '@/components/ui/toast'
import { useCommunityTeam, useToggleLike, useComments, useAddComment } from '@/lib/api/hooks/useCommunity'
import { colors, radii, spacing } from '@/lib/theme'

export default function CommunityTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const teamId = Number(id)
  const { data: team, isLoading } = useCommunityTeam(teamId)
  const toggleLike = useToggleLike()
  const { data: comments } = useComments(teamId)
  const addComment = useAddComment(teamId)
  const toast = useToast()
  const [draft, setDraft] = useState('')

  const submitComment = () => {
    if (!draft.trim()) return
    addComment.mutate(draft.trim(), {
      onSuccess: () => {
        setDraft('')
        toast.show('Commentaire publié', 'success')
      },
      onError: () => toast.show('Premium requis pour commenter', 'error'),
    })
  }

  return (
    <Screen padded edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.fg1} />
        </Pressable>
        <Text variant="h2" style={{ flex: 1 }} numberOfLines={1}>
          {team?.name ?? 'Équipe'}
        </Text>
        <Pressable onPress={() => toggleLike.mutate(teamId)} hitSlop={8} style={styles.like}>
          <Ionicons name="heart-outline" size={20} color={colors.danger} />
          <Text variant="caption" color="fg2">
            {team?.likesCount ?? 0}
          </Text>
        </Pressable>
      </View>

      {isLoading || !team ? (
        <Shimmer height={260} radius={14} style={{ marginTop: spacing.md }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing['3xl'] }}>
          <View style={styles.cards}>
            {team.slots.map((s) => (
              <View key={s.id} style={styles.card}>
                <PokemonSprite uri={s.pokemon?.spriteUrl} pokemonId={s.pokemonId} size={56} />
                <Text variant="caption" weight="semibold" numberOfLines={1}>
                  {s.pokemon?.nameFr ?? `#${s.pokemonId}`}
                </Text>
                {s.pokemon ? (
                  <View style={styles.cardTypes}>
                    <TypeBadge type={s.pokemon.type1} size="xs" />
                    {s.pokemon.type2 ? <TypeBadge type={s.pokemon.type2} size="xs" /> : null}
                  </View>
                ) : null}
                {s.item ? (
                  <Text variant="caption" color="fg3" numberOfLines={1}>
                    @ {s.item}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          {team.description ? (
            <View style={styles.reasoning}>
              <Text variant="eyebrow" color="fg3">
                Stratégie
              </Text>
              <Text variant="body" color="fg2">
                {team.description}
              </Text>
            </View>
          ) : null}

          <Accordion title={`Commentaires (${comments?.meta.total ?? 0})`} icon="chatbubbles-outline">
            <PremiumLock featureName="les commentaires" featureIcon="chatbubbles-outline">
              <View style={styles.commentBox}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Ajouter un commentaire…"
                  placeholderTextColor={colors.fg3}
                  style={styles.commentInput}
                  multiline
                />
                <Button label="Publier" size="sm" onPress={submitComment} loading={addComment.isPending} />
              </View>
            </PremiumLock>
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {comments?.data.map((c) => (
                <View key={c.id} style={styles.comment}>
                  <Text variant="caption" weight="semibold" color="fg2">
                    {c.user?.initials ?? '??'}
                  </Text>
                  <Text variant="caption" color="fg2">
                    {c.content}
                  </Text>
                </View>
              ))}
            </View>
          </Accordion>

          <View style={styles.footer}>
            <Button
              label="Ouvrir dans le builder"
              icon="construct-outline"
              fullWidth
              onPress={() => router.push('/(tabs)/teams/builder')}
            />
            <Button
              label="Importer Pokepaste"
              icon="clipboard-outline"
              variant="secondary"
              fullWidth
              onPress={() => toast.show('Import Pokepaste bientôt disponible', 'info')}
            />
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  like: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  card: {
    width: '31%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  cardTypes: { flexDirection: 'row', gap: 2, flexWrap: 'wrap', justifyContent: 'center' },
  reasoning: { gap: spacing.sm },
  commentBox: { gap: spacing.sm, padding: spacing.md },
  commentInput: {
    color: colors.fg1,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  comment: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  footer: { gap: spacing.sm },
})
