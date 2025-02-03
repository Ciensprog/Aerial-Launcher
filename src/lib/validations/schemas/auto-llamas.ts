import { z } from 'zod'

export const autoLlamasDataSchema = z.object({
  accountId: z.string().min(1),
  actions: z.object({
    survivors: z.boolean().default(false),
  }),
})
export const autoLlamasDataRecordSchema = z.record(
  z.string(),
  autoLlamasDataSchema
)
