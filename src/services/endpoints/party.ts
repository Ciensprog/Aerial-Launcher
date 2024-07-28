import type {
  FetchPartyResponse,
  PartyInviteResponse,
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

export function invite({
  accessToken,
  friendAccountId,
  partyId,
}: {
  accessToken: string
  friendAccountId: string
  partyId: string
}) {
  return partyService.post<PartyInviteResponse>(
    `/parties/${partyId}/invites/${friendAccountId}?sendPing=true`,
    {
      'urn:epic:invite:platformdata_s': '',
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
}

export function removeInvite({
  accessToken,
  friendAccountId,
  partyId,
}: {
  accessToken: string
  friendAccountId: string
  partyId: string
}) {
  return partyService.delete<PartyInviteResponse>(
    `/parties/${partyId}/invites/${friendAccountId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
}
