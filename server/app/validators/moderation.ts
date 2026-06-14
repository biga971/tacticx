import vine from '@vinejs/vine'

export const reportCommentValidator = vine.compile(
  vine.object({
    reason: vine.enum(['spam', 'harassment', 'inappropriate', 'other']),
  })
)
