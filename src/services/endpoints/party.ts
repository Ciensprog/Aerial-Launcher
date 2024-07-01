import type {
  FetchPartyResponse,
  PartyKickResponse,
} from '../../types/services/party'

import { partyService } from '../config/party'

export function fetchParty({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return partyService.get<FetchPartyResponse>(`/user/${accountId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function kick({
  accessToken,
  accountId,
  partyId,
}: {
  accessToken: string
  accountId: string
  partyId: string
}) {
  return partyService.delete<PartyKickResponse>(
    `/parties/${partyId}/members/${accountId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
}
