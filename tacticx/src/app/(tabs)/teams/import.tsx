import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useCreateTeam } from '@/lib/api/hooks/useTeams'
import { useRewardedGate } from '@/lib/hooks/useRewardedGate'
import { useFormatStore } from '@/lib/store/formatStore'
import { resolveShowdownTeam } from '@/lib/showdown/import'
import { colors, radii, spacing } from '@/lib/theme'

const PLACEHOLDER = `Colle ton équipe au format Pokémon Showdown, ex :

Great Tusk @ Booster Energy
Ability: Protosynthesis
Level: 50
EVs: 252 Atk / 4 Def / 252 Spe
Adamant Nature
- Headlong Rush
- Close Combat
- Ice Spinner
- Protect`

/** Paste-a-Showdown-team importer. Converts the paste into a saved team. */
export default function ImportTeamScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { format } = useFormatStore()
  const createTeam = useCreateTeam()
  const runWithAd = useRewardedGate()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const onImport = () => {
    if (!text.trim()) {
      toast.show('Colle d’abord une équipe', 'error')
      return
    }
    runWithAd(() => doImport())
  }

  const doImport = async () => {
    setBusy(true)
    try {
      const result = await resolveShowdownTeam(text)
      const payload = {
        name: result.name?.trim() || 'Équipe importée',
        format,
        slots: result.slots.map(({ pokemon: _p, ...rest }) => rest),
      }
      createTeam.mutate(payload, {
        onSuccess: (team) => {
          const msg = result.warnings.length
            ? `Équipe importée (${result.warnings.length} avertissement${result.warnings.length > 1 ? 's' : ''})`
            : 'Équipe importée'
          toast.show(msg, result.warnings.length ? 'info' : 'success')
          router.replace(`/(tabs)/teams/builder?id=${team.id}`)
        },
        onError: () => toast.show('Échec de la sauvegarde', 'error'),
        onSettled: () => setBusy(false),
      })
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Import impossible', 'error')
      setBusy(false)
    }
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.fg1} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1 }}>
          Importer depuis Showdown
        </Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
      >
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.fg3} />
          <Text variant="caption" color="fg3" style={{ flex: 1 }}>
            Les EVs sont convertis en budget SP. Les objets, talents et capacités non reconnus sont
            ignorés — tu pourras les ajuster ensuite.
          </Text>
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={PLACEHOLDER}
          placeholderTextColor={colors.fg3}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </ScrollView>

      <View style={[styles.footer, { bottom: 0, paddingBottom: insets.bottom + spacing.sm }]}>
        <Button
          label="Importer l’équipe"
          icon="download-outline"
          fullWidth
          loading={busy || createTeam.isPending}
          onPress={onImport}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  hint: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  input: {
    minHeight: 300,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    color: colors.fg1,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  footer: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
  },
})
