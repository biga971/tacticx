import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { SearchBar } from '@/components/ui/search-bar'
import { Text } from '@/components/ui/text'
import { colors, radii, spacing, TOUCH_TARGET } from '@/lib/theme'

export interface DropdownOption<T extends string | number> {
  label: string
  value: T
  sublabel?: string
}

export interface DropdownProps<T extends string | number> {
  label: string
  value: T | null
  options: DropdownOption<T>[]
  onChange: (value: T | null) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
}

/** Select control that opens a searchable bottom-sheet list. */
export function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Choisir…',
  searchable,
  clearable,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    if (!search) return options
    const t = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(t))
  }, [options, search])

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text variant="body" color={selected ? 'fg1' : 'fg3'} numberOfLines={1} style={{ flex: 1 }}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.fg3} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} heightRatio={0.7} title={label}>
        {searchable && (
          <SearchBar value={search} onChangeText={setSearch} placeholder="Filtrer…" />
        )}
        <ScrollView style={{ marginTop: searchable ? spacing.md : 0 }} showsVerticalScrollIndicator={false}>
          {clearable && (
            <Pressable
              style={styles.option}
              onPress={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              <Text variant="body" color="fg3">
                Aucun
              </Text>
            </Pressable>
          )}
          {filtered.map((o) => {
            const active = o.value === value
            return (
              <Pressable
                key={String(o.value)}
                style={styles.option}
                onPress={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="body" color={active ? 'accent' : 'fg1'}>
                    {o.label}
                  </Text>
                  {o.sublabel ? (
                    <Text variant="caption" color="fg3">
                      {o.sublabel}
                    </Text>
                  ) : null}
                </View>
                {active && <Ionicons name="checkmark" size={18} color={colors.accent} />}
              </Pressable>
            )
          })}
        </ScrollView>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: TOUCH_TARGET,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: TOUCH_TARGET,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
})
