import { z } from 'zod'

import { AutomationStatusType } from '../../../config/constants/automation'

export const automationServerDataSchema = z.object({
  accountId: z.string().min(1),
  actions: z.object({
    claim: z.boolean().default(false),
    kick: z.boolean().default(false),
    transferMats: z.boolean().default(false),
  }),
  status: z.nativeEnum(AutomationStatusType).nullable(),
})
export const automationServerSchema = z.record(
  z.string(),
  automationServerDataSchema
)

export const automationFileDataSchema = z.object({
  accountId: z.string().min(1),
  actions: z.object({
    claim: z.boolean().default(false),
    kick: z.boolean().default(false),
    transferMats: z.boolean().default(false),
  }),
})
export const automationFileSchema = z.record(
  z.string(),
  automationFileDataSchema
)
