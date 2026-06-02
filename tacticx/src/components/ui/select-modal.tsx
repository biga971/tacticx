import { useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { SearchBar } from '@/components/ui/search-bar'
import { colors, radii, spacing } from '@/lib/theme'

export interface SelectOption {
  key: string
  label: string
  sublabel?: string
  imageUrl?: string | null
}

export interface SelectModalProps {
  visible: boolean
  title: string
  options: SelectOption[]
  selectedKey?: string | null
  /** Show a "None" row at the top to clear the value. */
  allowNone?: boolean
  noneLabel?: string
  onSelect: (key: string | null) => void
  onClose: () => void
}

/** Full-screen searchable single-select list. */
export function SelectModal({
  visible,
  title,
  options,
  selectedKey,
  allowNone,
  noneLabel = 'Aucun',
  onSelect,
  onClose,
}: SelectModalProps) {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q))
  }, [options, query])

  const pick = (key: string | null) => {
    onSelect(key)
    setQuery('')
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text variant="h3" style={{ flex: 1 }}>
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.fg1} />
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} autoFocus />
        </View>
        <FlashList
          data={filtered}
          keyExtractor={(o) => o.key}
          ListHeaderComponent={
            allowNone ? (
              <Row label={noneLabel} selected={!selectedKey} onPress={() => pick(null)} muted />
            ) : null
          }
          renderItem={({ item }) => (
            <Row
              label={item.label}
              sublabel={item.sublabel}
              imageUrl={item.imageUrl}
              selected={item.key === selectedKey}
              onPress={() => pick(item.key)}
            />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg, paddingHorizontal: spacing.base }}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  )
}

function Row({
  label,
  sublabel,
  imageUrl,
  selected,
  muted,
  onPress,
}: {
  label: string
  sublabel?: string
  imageUrl?: string | null
  selected: boolean
  muted?: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.thumb} contentFit="contain" transition={120} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text variant="body" color={muted ? 'fg3' : 'fg1'} weight={selected ? 'semibold' : 'regular'}>
          {label}
        </Text>
        {sublabel ? (
          <Text variant="caption" color="fg3">
            {sublabel}
          </Text>
        ) : null}
      </View>
      {selected && <Ionicons name="checkmark" size={20} color={colors.accent} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  searchWrap: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  thumb: { width: 28, height: 28 },
})
