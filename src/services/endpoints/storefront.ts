import type { StorefrontCatalogResponse } from '../../types/services/storefront'

import { storefrontService } from '../config/storefront'

export function getCatalog({ accessToken }: { accessToken: string }) {
  return storefrontService.get<StorefrontCatalogResponse>('/catalog', {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}
