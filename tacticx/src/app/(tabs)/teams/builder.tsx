import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { PokemonSprite } from '@/components/shared/PokemonSprite'
import { TeamAnalysis, type AnalysisSlot } from '@/components/teams/TeamAnalysis'
import { PokemonPickerSheet } from '@/components/teams/PokemonPickerSheet'
import { PokemonEditorSheet } from '@/components/teams/PokemonEditorSheet'
import { useToast } from '@/components/ui/toast'
import { useCreateTeam, useUpdateTeam, useTeam, type TeamSlotInput } from '@/lib/api/hooks/useTeams'
import { useFormatStore, type Format } from '@/lib/store/formatStore'
import type { ApiPokemon } from '@/lib/api/types'
import { colors, radii, spacing, type PokemonType } from '@/lib/theme'

interface DraftSlot extends TeamSlotInput {
  pokemon: ApiPokemon
}

const SP_BUDGET = 66

function emptySlot(pokemon: ApiPokemon, slotIndex: number): DraftSlot {
  return {
    pokemon,
    slotIndex,
    pokemonId: pokemon.id,
    nature: 'Hardy',
    ability: pokemon.abilities[0] ?? '',
    item: null,
    move1: null,
    move2: null,
    move3: null,
    move4: null,
    spHp: 0,
    spAtk: 0,
    spDef: 0,
    spSpa: 0,
    spSpd: 0,
    spSpe: 0,
  }
}

export default function BuilderScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const { format, setFormat } = useFormatStore()

  // Edit mode when an `id` param is present.
  const { id } = useLocalSearchParams<{ id?: string }>()
  const teamId = id ? Number(id) : null
  const { data: team } = useTeam(teamId)
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam(teamId ?? 0)

  const [name, setName] = useState('Nouvelle équipe')
  const [slots, setSlots] = useState<DraftSlot[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [prefilled, setPrefilled] = useState(false)

  // Hydrate the draft from the loaded team once (edit mode).
  useEffect(() => {
    if (!team || prefilled) return
    setName(team.name)
    setFormat(team.format)
    setSlots(
      team.slots
        .filter((s) => s.pokemon)
        .map((s) => ({
          pokemon: s.pokemon!,
          slotIndex: s.slotIndex,
          pokemonId: s.pokemonId,
          nickname: s.nickname,
          nature: s.nature,
          ability: s.ability,
          item: s.item,
          move1: s.move1,
          move2: s.move2,
          move3: s.move3,
          move4: s.move4,
          spHp: s.spHp,
          spAtk: s.spAtk,
          spDef: s.spDef,
          spSpa: s.spSpa,
          spSpd: s.spSpd,
          spSpe: s.spSpe,
        }))
    )
    setPrefilled(true)
  }, [team, prefilled, setFormat])

  const analysisSlots = useMemo<AnalysisSlot[]>(
    () =>
      slots.map((s) => ({
        pokemonId: s.pokemonId,
        name: s.pokemon.nameFr,
        spriteUrl: s.pokemon.spriteUrl,
        types: [s.pokemon.type1, s.pokemon.type2].filter(Boolean) as PokemonType[],
        base: {
          hp: s.pokemon.baseHp,
          atk: s.pokemon.baseAtk,
          def: s.pokemon.baseDef,
          spa: s.pokemon.baseSpa,
          spd: s.pokemon.baseSpd,
          spe: s.pokemon.baseSpe,
        },
        sp: { hp: s.spHp, atk: s.spAtk, def: s.spDef, spa: s.spSpa, spd: s.spSpd, spe: s.spSpe },
        nature: s.nature,
      })),
    [slots]
  )

  const addPokemon = (p: ApiPokemon) => setSlots((prev) => [...prev, emptySlot(p, prev.length)])
  const removeSlot = (i: number) =>
    setSlots((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, slotIndex: idx })))
  const updateSlot = (i: number, patch: Partial<DraftSlot>) =>
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const save = () => {
    if (slots.length === 0) {
      toast.show('Ajoute au moins un Pokémon', 'error')
      return
    }
    const payload = {
      name,
      format,
      slots: slots.map(({ pokemon: _p, ...rest }) => rest),
    }
    const handlers = {
      onSuccess: () => {
        toast.show('Équipe sauvegardée', 'success')
        router.back()
      },
      onError: () => toast.show('Échec de la sauvegarde', 'error'),
    }
    if (teamId) updateTeam.mutate(payload, handlers)
    else createTeam.mutate(payload, handlers)
  }

  const gridCols = format === 'vgc' ? 2 : 3

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.fg1} />
        </Pressable>
        <TextInput value={name} onChangeText={setName} style={styles.nameInput} selectTextOnFocus />
        <View style={{ width: 130 }}>
          <SegmentedControl<Format>
            value={format}
            onChange={setFormat}
            options={[
              { label: 'VGC', value: 'vgc' },
              { label: 'Singles', value: '3v3' },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {slots.map((s, i) => (
            <Pressable
              key={i}
              style={[styles.slot, gridCols === 2 ? styles.slotHalf : styles.slotThird]}
              onPress={() => setEditIndex(i)}
            >
              <Pressable style={styles.remove} onPress={() => removeSlot(i)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={colors.fg3} />
              </Pressable>
              <PokemonSprite uri={s.pokemon.spriteUrl} pokemonId={s.pokemonId} size={56} />
              <Text variant="caption" weight="semibold" numberOfLines={1}>
                {s.pokemon.nameFr}
              </Text>
              <Text variant="caption" color="fg3" mono>
                {s.spHp + s.spAtk + s.spDef + s.spSpa + s.spSpd + s.spSpe}/{SP_BUDGET} SP
              </Text>
            </Pressable>
          ))}

          {slots.length < 6 && (
            <Pressable
              style={[styles.slot, styles.addSlot, gridCols === 2 ? styles.slotHalf : styles.slotThird]}
              onPress={() => setPickerOpen(true)}
            >
              <Ionicons name="add" size={28} color={colors.fg3} />
              <Text variant="caption" color="fg3">
                Ajouter
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text variant="eyebrow" color="fg3">
            Analyse d'équipe
          </Text>
          <TeamAnalysis slots={analysisSlots} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { bottom: 0 }]}>
        <Button
          label="Sauvegarder"
          icon="save-outline"
          fullWidth
          loading={createTeam.isPending || updateTeam.isPending}
          onPress={save}
        />
      </View>

      <PokemonPickerSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addPokemon} />

      {editIndex !== null && (
        <PokemonEditorSheet
          visible={editIndex !== null}
          onClose={() => setEditIndex(null)}
          slot={slots[editIndex]}
          pokemon={slots[editIndex].pokemon}
          onChange={(patch) => updateSlot(editIndex, patch)}
        />
      )}
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
  nameInput: {
    flex: 1,
    color: colors.fg1,
    fontSize: 18,
    fontWeight: '600',
  },
  content: { paddingHorizontal: spacing.base, gap: spacing.lg, paddingTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
    minHeight: 120,
    justifyContent: 'center',
  },
  slotHalf: { width: '48%' },
  slotThird: { width: '31.5%' },
  addSlot: { borderStyle: 'dashed' },
  remove: { position: 'absolute', top: 6, right: 6, zIndex: 1 },
  section: { gap: spacing.sm },
  footer: { position: 'absolute', left: spacing.base, right: spacing.base },
})
