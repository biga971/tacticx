import vine from '@vinejs/vine'

export const upsertProfileValidator = vine.compile(
  vine.object({
    level: vine.enum(['casual', 'competitive', 'tryhard']),
    format: vine.enum(['vgc', '3v3', 'both']),
    style: vine.enum(['offense', 'control', 'balance']),
    objective: vine.enum(['learn', 'rankup', 'tournament']),
  })
)
