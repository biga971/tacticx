import vine from '@vinejs/vine'

const slotSchema = vine.object({
  slotIndex: vine.number().min(0).max(5),
  pokemonId: vine.number().positive(),
  nickname: vine.string().maxLength(50).nullable().optional(),
  nature: vine.string().maxLength(20),
  ability: vine.string().maxLength(100),
  item: vine.string().maxLength(100).nullable().optional(),
  move1: vine.string().maxLength(100).nullable().optional(),
  move2: vine.string().maxLength(100).nullable().optional(),
  move3: vine.string().maxLength(100).nullable().optional(),
  move4: vine.string().maxLength(100).nullable().optional(),
  spHp: vine.number().min(0).max(32),
  spAtk: vine.number().min(0).max(32),
  spDef: vine.number().min(0).max(32),
  spSpa: vine.number().min(0).max(32),
  spSpd: vine.number().min(0).max(32),
  spSpe: vine.number().min(0).max(32),
})

export const storeTeamValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255),
    format: vine.enum(['vgc', '3v3']),
    style: vine.string().maxLength(20).nullable().optional(),
    description: vine.string().maxLength(2000).nullable().optional(),
    regulation: vine.string().maxLength(20).nullable().optional(),
    slots: vine.array(slotSchema).maxLength(6),
  })
)

export const updateTeamValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(255).optional(),
    format: vine.enum(['vgc', '3v3']).optional(),
    style: vine.string().maxLength(20).nullable().optional(),
    description: vine.string().maxLength(2000).nullable().optional(),
    regulation: vine.string().maxLength(20).nullable().optional(),
    slots: vine.array(slotSchema).maxLength(6).optional(),
  })
)

export const storeCommentValidator = vine.compile(
  vine.object({
    content: vine.string().minLength(1).maxLength(500),
  })
)
