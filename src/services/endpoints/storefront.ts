import type { StorefrontCatalogResponse } from '../../types/services/storefront'

import { storefrontService } from '../config/storefront'

export function getCatalog({ accessToken }: { accessToken: string }) {
  return storefrontService.get<StorefrontCatalogResponse>('/catalog', {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}

export function getAccountReceipts({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return storefrontService.get(
    `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/receipts/v1/account/${accountId}/receipts`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    },
  )
}
