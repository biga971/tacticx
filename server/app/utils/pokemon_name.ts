/**
 * Central Pokémon name normalisation.
 *
 * Names differ across sources (Pikalytics "Arcanine-Hisui", Smogon
 * "Sinistcha-Masterpiece", PokeAPI "arcanine-hisui"). This is THE reference
 * used everywhere so meta rows, roster rows and PokeAPI lookups join cleanly.
 *
 * Output: lowercase-kebab-case PokeAPI-style slug.
 */

/**
 * Known source → PokeAPI slug overrides. Add cases here as they surface; this
 * map is the single source of truth for irregular names.
 */
const SPECIAL_CASES: Record<string, string> = {
  // Cosmetic / form-name mismatches between Smogon/Pikalytics and PokeAPI.
  'sinistcha-masterpiece': 'sinistcha',
  'sinistcha-unremarkable': 'sinistcha',
  'poltchageist-artisan': 'poltchageist',
  'maushold-four': 'maushold-family-of-four',
  'maushold-three': 'maushold-family-of-three',
  'maushold-family-of-four': 'maushold-family-of-four',
  'tatsugiri-droopy': 'tatsugiri',
  'tatsugiri-stretchy': 'tatsugiri',
  'dudunsparce-three-segment': 'dudunsparce-three-segment',
  'dudunsparce-two-segment': 'dudunsparce',
  'gastrodon-east': 'gastrodon',
  'gastrodon-west': 'gastrodon',
  'urshifu-rapid-strike': 'urshifu-rapid-strike',
  'urshifu-single-strike': 'urshifu',
  'urshifu': 'urshifu',
  'indeedee-f': 'indeedee-female',
  'indeedee-m': 'indeedee',
  'meowstic-f': 'meowstic-female',
  'meowstic-m': 'meowstic',
  'basculegion-f': 'basculegion-female',
  'basculegion-m': 'basculegion',
  // Gendered / cosmetic suffixes PokeAPI ignores.
  'toxtricity-low-key': 'toxtricity-low-key',
  'toxtricity-amped': 'toxtricity',
}

/** True when the raw slug is a Mega Evolution (handled as a separate entry). */
export function isMegaName(name: string): boolean {
  return /(^|-)mega(-|$)/.test(name.trim().toLowerCase())
}

export function normalizePokemonName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/['.’]/g, '') // drop apostrophes/dots (Farfetch'd, Mr. Mime)
    .replace(/[\s_]+/g, '-') // spaces/underscores → dash
    .replace(/[^a-z0-9-]/g, '') // drop remaining punctuation
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-|-$/g, '') // trim dashes

  return SPECIAL_CASES[slug] ?? slug
}
