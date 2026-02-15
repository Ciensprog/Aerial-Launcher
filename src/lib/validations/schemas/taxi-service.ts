import { z } from 'zod'

import { AutomationStatusType } from '../../../config/constants/automation'

export const taxiServiceServerDataSchema = z.object({
  accountId: z.string().min(1),
  actions: z.object({
    high: z.boolean().default(true),
    denyFriendsRequests: z.boolean().default(true),
    activeStatus: z.string().default(''),
    busyStatus: z.string().default(''),
  }),
  status: z.nativeEnum(AutomationStatusType).nullable(),
})
export const taxiServiceServerSchema = z.record(
  z.string(),
  taxiServiceServerDataSchema,
)

export const taxiServiceFileDataSchema = z.object({
  accountId: z.string().min(1),
  actions: z.object({
    high: z.boolean().default(true),
    denyFriendsRequests: z.boolean().default(true),
    activeStatus: z.string().default(''),
    busyStatus: z.string().default(''),
  }),
})
export const taxiServiceFileSchema = z.record(
  z.string(),
  taxiServiceFileDataSchema,
)
