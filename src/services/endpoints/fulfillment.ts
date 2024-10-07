import type { RedeemCodeAccountResponse } from '../../types/redeem-codes'

import { fulfillmentService } from '../config/fulfillment'

export function redeemCodeAccount({
  accessToken,
  accountId,
  code,
}: {
  accessToken: string
  accountId: string
  code: string
}) {
  return fulfillmentService.post<RedeemCodeAccountResponse>(
    `/accounts/${accountId}/codes/${code}`,
    {},
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}
