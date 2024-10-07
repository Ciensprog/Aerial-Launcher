import { z } from 'zod'

import { RedeemCodesStatus } from '../state/management/redeem-code'

import { redeemCodeAccountSchema } from '../lib/validations/schemas/redeem-codes'

export type RedeemCodeAccountResponse = z.infer<
  typeof redeemCodeAccountSchema
>

export type RedeemCodeAccountNotification = {
  accountId: string
  code: string
  status: RedeemCodesStatus
}
