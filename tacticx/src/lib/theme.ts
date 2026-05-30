/**
 * Tacticx — design tokens (React Native).
 * Dark-only MVP. Mirrors model/tokens.css. Single source of truth.
 * Rule: zero hardcoded values in the app — always reference this file.
 */

export const colors = {
  // Surfaces
  bg: '#0B0D10',
  surface: '#13161B',
  surfaceHigh: '#1C2027',
  surfaceSunken: '#080A0D',

  // Borders
  border: '#262A32',
  borderStrong: '#363B45',
  divider: '#1B1E24',

  // Brand accent
  accent: '#5B8DEF',
  accentMuted: '#3A5A99',
  accentSoft: '#1A2238',

  // Text
  fg1: '#ECEEF1',
  fg2: '#A1A8B3',
  fg3: '#6B7280',
  fgFaint: '#4A5260',
  fgInverse: '#0B0D10',

  // Semantic
  success: '#5FA978',
  successSoft: '#15241C',
  danger: '#D46A6A',
  dangerSoft: '#2A1818',
  warning: '#D9A55A',
  warningSoft: '#2A2014',
  info: '#6FA8C7',
  infoSoft: '#15222A',
} as const

/** Pokémon type → { fg, bg }. Keys are lowercase English type names. */
export const typeColors = {
  normal: { fg: '#B8B0A4', bg: '#23211E' },
  fire: { fg: '#D98C6A', bg: '#2A1D17' },
  water: { fg: '#6FA0CC', bg: '#172230' },
  grass: { fg: '#7FA978', bg: '#1A241B' },
  electric: { fg: '#D9C26A', bg: '#2A2616' },
  ice: { fg: '#8FC0C7', bg: '#172729' },
  fighting: { fg: '#C77878', bg: '#2A1A1A' },
  poison: { fg: '#A988C2', bg: '#22192A' },
  ground: { fg: '#C29A6A', bg: '#2A2117' },
  flying: { fg: '#A0B0D4', bg: '#1B1F2A' },
  psychic: { fg: '#D48BA8', bg: '#2A1A23' },
  bug: { fg: '#A8B86A', bg: '#222614' },
  rock: { fg: '#B89C7A', bg: '#26211A' },
  ghost: { fg: '#9080B8', bg: '#1F1A2A' },
  dragon: { fg: '#7B8FD9', bg: '#181D2E' },
  dark: { fg: '#8A8478', bg: '#1F1D1A' },
  steel: { fg: '#9BA8B5', bg: '#1D2127' },
  fairy: { fg: '#D49AB8', bg: '#2A1D24' },
} as const

export type PokemonType = keyof typeof typeColors

/** Ordered list of the 18 types (canonical index for the type chart). */
export const TYPE_ORDER: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

/** Competitive tier → { fg, bg }. */
export const tierColors = {
  s: { fg: '#E0C58A', bg: '#26200F' },
  a: { fg: '#B8C4D4', bg: '#1A1F26' },
  b: { fg: '#B89A78', bg: '#241D15' },
  c: { fg: '#7A7F87', bg: '#181B1F' },
} as const

export type Tier = keyof typeof tierColors

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 28,
  '2xl': 40,
  '3xl': 56,
} as const

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const

export const lineHeight = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.45,
  relaxed: 1.6,
} as const

export const letterSpacing = {
  tight: -0.4,
  wide: 0.4,
  wider: 1.2,
} as const

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

/**
 * Font families. Inter is loaded via expo-font in the root layout.
 * Falls back to platform system font until loaded.
 */
export const fonts = {
  sans: 'Inter',
  mono: 'JetBrainsMono',
} as const

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
} as const

/** Minimum touch target per the guide (Phase 14). */
export const TOUCH_TARGET = 44

export const theme = {
  colors,
  typeColors,
  tierColors,
  spacing,
  radii,
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
  fonts,
  shadows,
  TYPE_ORDER,
  TOUCH_TARGET,
} as const

export type Theme = typeof theme
export default theme
