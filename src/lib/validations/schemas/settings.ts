import { z } from 'zod'

export const settingsSchema = z.object({
  path: z.string().min(1),
  systemTray: z.boolean().default(false).optional(),
  userAgent: z.string().min(1).optional(),
})
