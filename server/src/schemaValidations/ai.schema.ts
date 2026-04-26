import { z } from 'zod'

export const AiChatBody = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'ai']),
        content: z.string()
      })
    )
    .optional()
})

export type AiChatBodyType = z.infer<typeof AiChatBody>

export const AiChatRes = z.object({
  message: z.string(),
  data: z.string()
})

export type AiChatResType = z.infer<typeof AiChatRes>
