import type {
  FetchFriendResponse,
  FriendsSummaryResponse,
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

export function getFriendsSummary({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return friendsService.get<FriendsSummaryResponse>(
    `/${accountId}/summary`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}

export function getFriendsBlocklist({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return friendsService.get(`/${accountId}/blocklist`, {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}

export function getFriendsSettings({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return friendsService.get(`/${accountId}/settings`, {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
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
