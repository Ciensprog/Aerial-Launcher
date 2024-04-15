import { z } from 'zod'

/**
 * Schema for client credential
 */
export const clientCredentialSchema = z.object({
  clientId: z.string().length(32),
  secret: z.string().length(32),
  auth: z.string().length(88),
})

export const defaultClientCredentialSchema = z.object({
  use: clientCredentialSchema,
})
