import type {
  EpicFriend,
  FriendsSummary,
} from '../../types/services/friends'

import { friendsService } from '../config/friends'

export function getFriend({
  accessToken,
  accountId,
  friendId,
}: {
  accessToken: string
  accountId: string
  friendId: string
}) {
  return friendsService.get<EpicFriend>(
    `/${accountId}/friends/${friendId}`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}

export function addFriend({
  accessToken,
  accountId,
  friendId,
}: {
  accessToken: string
  accountId: string
  friendId: string
}) {
  return friendsService.post(
    `/${accountId}/friends/${friendId}`,
    {},
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}

export function blockFriend({
  accessToken,
  accountId,
  friendId,
}: {
  accessToken: string
  accountId: string
  friendId: string
}) {
  return friendsService.post(
    `/${accountId}/blocklist/${friendId}`,
    {},
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}

export function getFriendsSummary({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return friendsService.get<FriendsSummary>(`/${accountId}/summary`, {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}
