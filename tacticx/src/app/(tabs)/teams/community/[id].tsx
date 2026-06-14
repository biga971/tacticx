import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { Button } from '@/components/ui/button'
import { Accordion } from '@/components/ui/accordion'
import { ActionSheet } from '@/components/ui/action-sheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { useToast } from '@/components/ui/toast'
import {
  useCommunityTeam,
  useToggleLike,
  useComments,
  useAddComment,
  useReportComment,
  useBlockUser,
  type ReportReason,
} from '@/lib/api/hooks/useCommunity'
import { useMe } from '@/lib/api/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'
import { useRewardedGate } from '@/lib/hooks/useRewardedGate'
import { formatRelativeDate, formatShortDate } from '@/lib/format/date'
import { colors, radii, spacing } from '@/lib/theme'

export default function CommunityTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const teamId = Number(id)
  const { data: team, isLoading } = useCommunityTeam(teamId)
  const toggleLike = useToggleLike()
  const { data: comments } = useComments(teamId)
  const addComment = useAddComment(teamId)
  const { data: me } = useMe()
  const toast = useToast()
  const isGuest = useAuthStore((s) => s.isGuest)
  const authToken = useAuthStore((s) => s.token)
  const runWithAd = useRewardedGate()
  const [draft, setDraft] = useState('')
  // Users blocked during this session — filtered out locally without a reload.
  const [blockedIds, setBlockedIds] = useState<Set<number>>(new Set())

  const visibleComments = comments?.data.filter((c) => !blockedIds.has(c.userId)) ?? []

  const onLike = () => {
    if (isGuest || !authToken) {
      toast.show('Connecte-toi pour liker une équipe', 'error')
      return
    }
    toggleLike.mutate(teamId)
  }

  const author = team?.user?.fullName ?? team?.user?.initials ?? 'Anonyme'

  const submitComment = () => {
    if (!draft.trim()) return
    addComment.mutate(draft.trim(), {
      onSuccess: () => {
        setDraft('')
        toast.show('Commentaire publié', 'success')
      },
      onError: () => toast.show('Connecte-toi pour commenter', 'error'),
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
        <Pressable onPress={onLike} hitSlop={8} style={styles.like} disabled={toggleLike.isPending}>
          <Ionicons
            name={team?.liked ? 'heart' : 'heart-outline'}
            size={20}
            color={colors.danger}
          />
          <Text variant="caption" color="fg2">
            {team?.likesCount ?? 0}
          </Text>
        </Pressable>
      </View>

      {isLoading || !team ? (
        <Shimmer height={260} radius={14} style={{ marginTop: spacing.md }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing['3xl'] }}>
          <View style={styles.meta}>
            <Ionicons name="person-circle-outline" size={16} color={colors.fg3} />
            <Text variant="caption" color="fg2">
              {author}
            </Text>
            {team.createdAt ? (
              <Text variant="caption" color="fg3">
                · {formatShortDate(team.createdAt)}
              </Text>
            ) : null}
          </View>

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
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {visibleComments.map((c) => {
                const isMine = me?.id != null && c.userId === me.id
                return (
                  <View key={c.id} style={styles.comment}>
                    <View style={styles.commentHead}>
                      <Text variant="caption" weight="semibold" color="fg1">
                        {c.user?.fullName ?? c.user?.initials ?? 'Anonyme'}
                      </Text>
                      <View style={styles.commentMeta}>
                        <Text variant="caption" color="fg3">
                          {formatRelativeDate(c.createdAt)}
                        </Text>
                        {!isMine ? (
                          <CommentMenu
                            commentId={c.id}
                            authorId={c.userId}
                            authorName={c.user?.fullName ?? c.user?.initials ?? 'cet utilisateur'}
                            teamId={teamId}
                            onBlocked={(uid) =>
                              setBlockedIds((prev) => new Set(prev).add(uid))
                            }
                          />
                        ) : null}
                      </View>
                    </View>
                    <Text variant="caption" color="fg2">
                      {c.content}
                    </Text>
                  </View>
                )
              })}
            </View>
          </Accordion>

          <View style={styles.footer}>
            <Button
              label="Ouvrir dans le builder"
              icon="construct-outline"
              fullWidth
              onPress={() =>
                runWithAd(() =>
                  router.push({ pathname: '/(tabs)/teams/builder', params: { importId: String(teamId) } })
                )
              }
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

/** Per-comment "…" menu: report (with reason) or block the author. */
function CommentMenu({
  commentId,
  authorId,
  authorName,
  teamId,
  onBlocked,
}: {
  commentId: number
  authorId: number
  authorName: string
  teamId: number
  onBlocked: (userId: number) => void
}) {
  const toast = useToast()
  const report = useReportComment()
  const block = useBlockUser(teamId)
  const [menu, setMenu] = useState(false)
  const [reasons, setReasons] = useState(false)
  const [confirmBlock, setConfirmBlock] = useState(false)

  const doReport = (reason: ReportReason) => {
    setReasons(false)
    report.mutate(
      { commentId, reason },
      {
        onSuccess: () => toast.show('Commentaire signalé', 'success'),
        onError: () => toast.show('Échec du signalement', 'error'),
      }
    )
  }

  const doBlock = () => {
    setConfirmBlock(false)
    block.mutate(authorId, {
      onSuccess: () => {
        onBlocked(authorId)
        toast.show('Utilisateur bloqué', 'info')
      },
      onError: () => toast.show('Échec du blocage', 'error'),
    })
  }

  return (
    <>
      <Pressable onPress={() => setMenu(true)} hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={18} color={colors.fg3} />
      </Pressable>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        options={[
          {
            label: 'Signaler ce commentaire',
            icon: 'flag-outline',
            onPress: () => {
              setMenu(false)
              setReasons(true)
            },
          },
          {
            label: 'Bloquer cet utilisateur',
            icon: 'person-remove-outline',
            destructive: true,
            onPress: () => {
              setMenu(false)
              setConfirmBlock(true)
            },
          },
        ]}
      />

      <ActionSheet
        visible={reasons}
        title="Signaler le commentaire"
        message="Pour quelle raison ?"
        onClose={() => setReasons(false)}
        options={[
          { label: 'Spam', icon: 'mail-unread-outline', onPress: () => doReport('spam') },
          { label: 'Harcèlement', icon: 'sad-outline', onPress: () => doReport('harassment') },
          { label: 'Contenu inapproprié', icon: 'warning-outline', onPress: () => doReport('inappropriate') },
          { label: 'Autre', icon: 'help-circle-outline', onPress: () => doReport('other') },
        ]}
      />

      <ConfirmDialog
        visible={confirmBlock}
        title={`Bloquer ${authorName} ?`}
        message="Ses commentaires ne seront plus visibles."
        confirmLabel="Bloquer"
        destructive
        loading={block.isPending}
        onConfirm={doBlock}
        onCancel={() => setConfirmBlock(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
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
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  commentHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footer: { gap: spacing.sm },
})
