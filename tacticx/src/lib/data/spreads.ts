/**
 * Popular SP spreads (archetypes) applied in one tap from the editor sheet.
 * Champions uses a 66-point SP budget (max 32 per stat). Each spread sets a
 * nature + the six SP values. Pokémon-agnostic but cover the common roles.
 */

export interface SpreadSp {
  spHp: number
  spAtk: number
  spDef: number
  spSpa: number
  spSpd: number
  spSpe: number
}

export interface PopularSpread {
  id: string
  label: string
  note: string
  nature: string
  sp: SpreadSp
}

const zero: SpreadSp = { spHp: 0, spAtk: 0, spDef: 0, spSpa: 0, spSpd: 0, spSpe: 0 }

export const POPULAR_SPREADS: PopularSpread[] = [
  {
    id: 'phys-sweeper',
    label: 'Sweeper physique',
    note: 'Attaque et vitesse au maximum',
    nature: 'Jolly',
    sp: { ...zero, spAtk: 32, spSpe: 32, spHp: 2 },
  },
  {
    id: 'spec-sweeper',
    label: 'Sweeper spécial',
    note: 'Attaque spéciale et vitesse au maximum',
    nature: 'Timid',
    sp: { ...zero, spSpa: 32, spSpe: 32, spHp: 2 },
  },
  {
    id: 'phys-tank',
    label: 'Mur physique',
    note: 'Encaisse les coups physiques',
    nature: 'Impish',
    sp: { ...zero, spHp: 32, spDef: 32, spSpd: 2 },
  },
  {
    id: 'spec-tank',
    label: 'Mur spécial',
    note: 'Encaisse les coups spéciaux',
    nature: 'Calm',
    sp: { ...zero, spHp: 32, spSpd: 32, spDef: 2 },
  },
  {
    id: 'bulky-offense',
    label: 'Offensif équilibré',
    note: 'Compromis bulk / dégâts / vitesse',
    nature: 'Adamant',
    sp: { ...zero, spHp: 22, spAtk: 22, spSpe: 22 },
  },
]
