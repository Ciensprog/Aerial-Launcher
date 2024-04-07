import { z } from 'zod'

export const accountBasicInformationSchema = z.object({
  accountId: z.string().min(1),
  deviceId: z.string().min(1),
  displayName: z.string().min(1),
  secret: z.string().min(1),
})

export const accountDataSchema = z.intersection(
  accountBasicInformationSchema,
  z.object({
    provider: z.string().nullable().optional(),
    token: z.string().nullable().optional(),
  })
)

export const accountListSchema = z.array(accountBasicInformationSchema)
export const accountDataListSchema = z.array(accountDataSchema)
