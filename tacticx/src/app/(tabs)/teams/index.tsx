import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import { Screen, ScreenHeader } from '@/components/ui/screen'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Text } from '@/components/ui/text'
import { Shimmer } from '@/components/ui/shimmer'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { ImportTeamSheet } from '@/components/teams/ImportTeamSheet'
import { useTeams, useDeleteTeam } from '@/lib/api/hooks/useTeams'
import { useCommunityFeed } from '@/lib/api/hooks/useCommunity'
import { useAuthStore } from '@/lib/store/authStore'
import { formatRelativeDate } from '@/lib/format/date'
import type { ApiTeam } from '@/lib/api/types'
import { colors, radii, spacing } from '@/lib/theme'
import { TAB_BAR_HEIGHT } from '@/components/ui/morphing-tabbar'

type View2 = 'mine' | 'community'

export default function TeamsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isGuest = useAuthStore((s) => s.isGuest)
  const token = useAuthStore((s) => s.token)
  const [view, setView] = useState<View2>('mine')
  const [importOpen, setImportOpen] = useState(false)

  // Publishing is gated behind an account; guests get pushed to sign-in.
  const onPublish = () =>
    isGuest || !token ? router.push('/(auth)/sign-in') : router.push('/(tabs)/teams/community/submit')

  return (
    <Screen padded>
      <ScreenHeader title="Équipes" />
      <SegmentedControl<View2>
        value={view}
        onChange={setView}
        options={[
          { label: 'Mes équipes', value: 'mine' },
          { label: 'Communauté', value: 'community' },
        ]}
      />
      <View style={{ flex: 1, marginTop: spacing.md }}>
        {view === 'mine' ? <MyTeams /> : <CommunityFeed />}
      </View>

      <View style={[styles.fab, { bottom: 0 }]}>
        {view === 'mine' ? (
          <View style={styles.fabRow}>
            <Button
              label="Nouvelle équipe"
              icon="add"
              style={{ flex: 1 }}
              onPress={() => router.push('/(tabs)/teams/builder')}
            />
            <Button
              label="Importer"
              icon="download-outline"
              variant="secondary"
              onPress={() => setImportOpen(true)}
            />
          </View>
        ) : (
          <Button
            label="Publier une équipe"
            icon="cloud-upload-outline"
            fullWidth
            onPress={onPublish}
          />
        )}
      </View>

      <ImportTeamSheet visible={importOpen} onClose={() => setImportOpen(false)} />
    </Screen>
  )
}

function MyTeams() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { data, isLoading } = useTeams()
  const deleteTeam = useDeleteTeam()
  const [confirm, setConfirm] = useState<ApiTeam | null>(null)

  if (isLoading) return <ListSkeleton />
  if (!data || data.length === 0) {
    return (
      <Empty
        icon="people-outline"
        title="Aucune équipe"
        subtitle="Crée ta première équipe pour commencer à théorycrafter."
      />
    )
  }

  const onConfirmDelete = () => {
    if (!confirm) return
    deleteTeam.mutate(confirm.id, {
      onSuccess: () => {
        toast.show('Équipe supprimée', 'success')
        setConfirm(null)
      },
      onError: () => toast.show('Échec de la suppression', 'error'),
    })
  }

  return (
    <>
      <FlashList
        data={data}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            onPress={() => router.push(`/(tabs)/teams/builder?id=${item.id}`)}
            onDelete={() => setConfirm(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 64 }}
      />
      <ConfirmDialog
        visible={confirm !== null}
        title="Supprimer l'équipe ?"
        message={confirm ? `« ${confirm.name} » sera définitivement supprimée. Action irréversible.` : undefined}
        confirmLabel="Supprimer"
        destructive
        loading={deleteTeam.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  )
}

function CommunityFeed() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data, isLoading, fetchNextPage, hasNextPage } = useCommunityFeed({ sort: 'likes' })
  const items = useMemo<ApiTeam[]>(() => data?.pages.flatMap((p) => p.data) ?? [], [data])

  if (isLoading) return <ListSkeleton />
  if (items.length === 0) {
    return <Empty icon="globe-outline" title="Communauté vide" subtitle="Sois le premier à publier une équipe." />
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(t) => String(t.id)}
      renderItem={({ item }) => (
        <TeamCard team={item} community onPress={() => router.push(`/(tabs)/teams/community/${item.id}`)} />
      )}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 64 }}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
    />
  )
}

function TeamCard({
  team,
  onPress,
  community,
  onDelete,
}: {
  team: ApiTeam
  onPress: () => void
  community?: boolean
  onDelete?: () => void
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.cardHeader}>
        <Text variant="title" style={{ flex: 1 }}>
          {team.name}
        </Text>
        <Text variant="eyebrow" color="accent">
          {team.format.toUpperCase()}
        </Text>
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={10} style={styles.trash}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        )}
      </View>
      <View style={styles.sprites}>
        {team.slots?.slice(0, 6).map((s) => (
          <PokemonSprite key={s.id} uri={s.pokemon?.spriteUrl} pokemonId={s.pokemonId} size={40} />
        ))}
      </View>
      {community && (
        <View style={styles.cardFooter}>
          <Ionicons name="heart-outline" size={14} color={colors.fg3} />
          <Text variant="caption" color="fg3">
            {team.likesCount}
          </Text>
          {team.user?.fullName || team.user?.initials ? (
            <Text variant="caption" color="fg3" style={{ marginLeft: spacing.sm }}>
              par {team.user.fullName ?? team.user.initials}
            </Text>
          ) : null}
          {team.createdAt ? (
            <Text variant="caption" color="fg3" style={{ marginLeft: 'auto' }}>
              {formatRelativeDate(team.createdAt)}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  )
}

function ListSkeleton() {
  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Shimmer key={i} height={110} radius={14} />
      ))}
    </View>
  )
}

function Empty({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.fg3} />
      <Text variant="title">{title}</Text>
      <Text variant="caption" color="fg3" center>
        {subtitle}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  trash: { padding: 2 },
  sprites: { flexDirection: 'row', gap: spacing.xs },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing['3xl'] },
  fab: { position: 'absolute', left: spacing.base, right: spacing.base },
  fabRow: { flexDirection: 'row', gap: spacing.sm },
})
