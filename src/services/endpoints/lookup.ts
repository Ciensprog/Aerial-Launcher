import type {
  LookupFindManyByDisplayNameResponse,
  LookupFindOneByDisplayNameResponse,
} from '../../types/services/lookup'

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

export function findUserByExternalDisplayName({
  accessToken,
  displayName,
  externalAuthType,
}: {
  accessToken: string
  displayName: string
  externalAuthType: 'psn' | 'xbl'
}) {
  return publicAccountService.get<LookupFindManyByDisplayNameResponse>(
    `/lookup/externalAuth/${externalAuthType}/displayName/${displayName}?caseInsensitive=true`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}
