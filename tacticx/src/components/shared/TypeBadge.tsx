import { Badge, type BadgeSize } from '@/components/ui/badge'
import { typeColors, type PokemonType } from '@/lib/theme'

const FR: Partial<Record<PokemonType, string>> = {
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  electric: 'Élec',
  grass: 'Plante',
  ice: 'Glace',
  fighting: 'Combat',
  poison: 'Poison',
  ground: 'Sol',
  flying: 'Vol',
  psychic: 'Psy',
  bug: 'Insecte',
  rock: 'Roche',
  ghost: 'Spectre',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  steel: 'Acier',
  fairy: 'Fée',
}

export interface TypeBadgeProps {
  type: string
  size?: BadgeSize
}

/** Colored type pill using theme type colors (French label). */
export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  const key = type.toLowerCase() as PokemonType
  const c = typeColors[key]
  return (
    <Badge
      label={FR[key] ?? type}
      bg={c?.bg ?? undefined}
      fg={c?.fg ?? undefined}
      size={size}
      uppercase
    />
  )
}
