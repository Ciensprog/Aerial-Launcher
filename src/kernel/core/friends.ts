import type {
  EpicFriend,
  FriendBlock,
  FriendIncoming,
  FriendOutgoing,
  FriendsSummary,
} from '../../types/services/friends'
import type { AccountData } from '../../types/accounts'

import split from 'just-split'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { Authentication } from './authentication'

import { getFriendsSummary } from '../../services/endpoints/friends'
import { queryAccountsByIds } from '../../services/endpoints/lookup'

import { getRawDateWithTZ } from '../../lib/dates'
import { localeCompareForSorting } from '../../lib/utils'

export class FriendsManagement {
  static async getSummary(account: AccountData) {
    const notificationKey = ElectronAPIEventKeys.GetFriendsSummaryResponse

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        MainWindow.instance.webContents.send(
          notificationKey,
          account.accountId,
          null
        )

        return
      }

      // const response = preloadedResults
      const response = await getFriendsSummary({
        accessToken,
        accountId: account.accountId,
      })

      const friends = toObject(response.data.friends, 'accountId')
      const incoming = toObject(response.data.incoming, 'accountId')
      const outgoing = toObject(response.data.outgoing, 'accountId')
      const blocklist = toObject(response.data.blocklist, 'accountId')

      await Promise.allSettled([
        queryIds(
          Object.keys(friends),
          accessToken,
          (accountId, displayName) => {
            if (friends[accountId] !== undefined) {
              friends[accountId].displayName = displayName
            }
          }
        ),
        queryIds(
          Object.keys(incoming),
          accessToken,
          (accountId, displayName) => {
            if (incoming[accountId] !== undefined) {
              incoming[accountId].displayName = displayName
            }
          }
        ),
        queryIds(
          Object.keys(outgoing),
          accessToken,
          (accountId, displayName) => {
            if (outgoing[accountId] !== undefined) {
              outgoing[accountId].displayName = displayName
            }
          }
        ),
        queryIds(
          Object.keys(blocklist),
          accessToken,
          (accountId, displayName) => {
            if (blocklist[accountId] !== undefined) {
              blocklist[accountId].displayName = displayName
            }
          }
        ),
      ])

      const results: FriendsSummary = {
        blocklist: sortValues(Object.values(blocklist)),
        friends: sortValues(Object.values(friends)),
        incoming: sortValues(Object.values(incoming)),
        outgoing: sortValues(Object.values(outgoing)),
        suggested: [],
        limitsReached: response.data.limitsReached ?? null,
        settings: response.data.settings ?? null,
      }

      MainWindow.instance.webContents.send(
        notificationKey,
        account.accountId,
        results
      )

      return

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      notificationKey,
      account.accountId,
      null
    )
  }

  static async blockFriends(
    account: AccountData,
    blocklist: Array<EpicFriend | FriendIncoming | FriendOutgoing>,
    origin?: 'incoming' | 'outgoing'
  ) {
    const notificationKey = ElectronAPIEventKeys.BlockFriendsResponse

    FriendsManagement.checkAccessToken(
      account,
      notificationKey,
      async () => {
        MainWindow.instance.webContents.send(
          notificationKey,
          account,
          blocklist.map((friend) => {
            return {
              accountId: friend.accountId,
              created: getRawDateWithTZ().toISOString(),
              displayName: friend.displayName,
            } as FriendBlock
          }),
          origin
        )
      }
    )
  }

  static async unblock(
    account: AccountData,
    unblocklist: 'full' | Array<FriendBlock>
  ) {
    const notificationKey = ElectronAPIEventKeys.UnblockFriendsResponse

    FriendsManagement.checkAccessToken(
      account,
      notificationKey,
      async () => {
        MainWindow.instance.webContents.send(
          notificationKey,
          account,
          unblocklist
        )
      }
    )
  }

  static async addFriends(
    account: AccountData,
    friends: Array<EpicFriend>,
    context?: 'incoming'
  ) {
    const notificationKey = ElectronAPIEventKeys.AddFriendsResponse

    FriendsManagement.checkAccessToken(
      account,
      notificationKey,
      async () => {
        MainWindow.instance.webContents.send(
          notificationKey,
          account,
          friends,
          context
        )
      }
    )
  }

  static async removeFriends(
    account: AccountData,
    friends: 'full' | Array<EpicFriend>,
    context?: 'incoming' | 'outgoing'
  ) {
    const notificationKey = ElectronAPIEventKeys.RemoveFriendsResponse

    FriendsManagement.checkAccessToken(
      account,
      notificationKey,
      async () => {
        MainWindow.instance.webContents.send(
          notificationKey,
          account,
          friends,
          context
        )
      }
    )
  }

  private static async checkAccessToken(
    account: AccountData,
    notificationKey: ElectronAPIEventKeys,
    callback: (accessToken: string) => Promise<void>
  ) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        MainWindow.instance.webContents.send(notificationKey, account, [])

        return
      }

      await callback(accessToken)

      return
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(notificationKey, account, [])

    return
  }
}

const toObject = <Data extends Record<string, unknown>>(
  data: Array<Data>,
  key: keyof Data
) =>
  data.reduce(
    (accumulator, current) => {
      if (
        typeof current[key] === 'string' &&
        current[key].trim().length > 0
      ) {
        accumulator[current[key]] = {
          ...current,
          displayName: current[key],
        }
      }

      return accumulator
    },
    {} as Record<string, Data>
  )
const queryIds = async (
  ids: Array<string>,
  accessToken: string,
  callback: (accoundId: string, displayName: string) => void
) => {
  const queryFriends = await Promise.allSettled(
    split(ids, 100).map((ids) =>
      queryAccountsByIds({
        accessToken,
        ids,
      })
    )
  )

  queryFriends.map((response) => {
    if (response.status === 'fulfilled') {
      response.value.data.forEach((item) => {
        const displayName =
          item.displayName ??
          item.externalAuths?.xbl?.externalDisplayName ??
          item.externalAuths?.psn?.externalDisplayName ??
          item.id

        callback?.(item.id, displayName)
      })
    }
  })
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sortValues = <Data>(data: Array<Record<string, any>>): Data =>
  data.toSorted((itemA, itemB) =>
    localeCompareForSorting(itemA.displayName!, itemB.displayName!)
  ) as Data
