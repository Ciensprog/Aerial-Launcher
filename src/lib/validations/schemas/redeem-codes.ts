import { z } from 'zod'

export const redeemCodeAccountSchema = z.object({
  offerId: z.string().min(1),
  accountId: z.string().min(1),
  identityId: z.string().min(1),
  details: z.array(
    z.object({
      entitlementId: z.string().min(1),
      entitlementName: z.string().min(1),
      itemId: z.string().min(1),
      namespace: z.string().min(1),
      country: z.string().min(1),
    })
  ),
})
