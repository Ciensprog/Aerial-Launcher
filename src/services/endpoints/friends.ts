import type { FetchFriendResponse } from '../../types/services/friends'

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
  return friendsService.get<FetchFriendResponse>(
    `/${accountId}/friends/${friendId}`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    },
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
    },
  )
}

export function removeFriend({
  accessToken,
  accountId,
  friendId,
}: {
  accessToken: string
  accountId: string
  friendId: string
}) {
  return friendsService.delete(`/${accountId}/friends/${friendId}`, {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}
