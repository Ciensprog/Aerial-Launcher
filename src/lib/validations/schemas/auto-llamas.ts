import { z } from 'zod'

export const autoLlamasDataSchema = z.object({
  accountId: z.string().min(1),
  actions: z.object({
    free: z.boolean().default(false),
    survivors: z.boolean().default(false),
  }),
})
