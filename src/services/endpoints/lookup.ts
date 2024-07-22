import type { LookupFindOneByDisplayNameResponse } from '../../types/services/lookup'

import { publicAccountService } from '../config/public-account'

export function findUserByDisplayName({
  accessToken,
  displayName,
}: {
  accessToken: string
  displayName: string
}) {
  return publicAccountService.get<LookupFindOneByDisplayNameResponse>(
    `/displayName/${displayName}`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}
