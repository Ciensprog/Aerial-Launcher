import { z } from 'zod'

export const settingsSchema = z.object({
  path: z.string().min(1),
})
