import type { AccountData } from '../../../types/accounts'
import type {
  DqWeaponsAccountData,
  DqWeaponsFavoriteAccountResult,
} from '../../../types/dq-weapons'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

import { MainWindow } from '../../startup/windows/main'
import { Authentication } from '../authentication'

import {
  getQueryProfile,
  setItemFavoriteStatusBatch,
} from '../../../services/endpoints/mcp'
import {
  bestLampWeapons,
  collectLampWeaponItemIds,
  emptyKindMap,
} from '../../../lib/stw/dq-weapons'

export class MCPDqWeapons {
  static async request(accounts: Array<AccountData>) {
    try {
      const responses = await Promise.allSettled(
        accounts.map(async (account) => {
          return MCPDqWeapons.requestAccount(account)
        })
      )

      const data = responses
        .filter(isFulfilledResult)
        .map((response) => response.value)

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.DqWeaponsNotification,
        data
      )

      return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.DqWeaponsNotification,
      []
    )
  }

  private static async requestAccount(
    account: AccountData
  ): Promise<DqWeaponsAccountData> {
    const weapons = emptyKindMap()
    const result: DqWeaponsAccountData = {
      accountId: account.accountId,
      available: true,
      weapons,
      haveCount: 0,
      complete: false,
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.available = false
        result.errorMessage = 'Unknown Error'

        return result
      }

      const profileResponse = await getQueryProfile({
        accessToken,
        accountId: account.accountId,
      })
      const profile =
        profileResponse.data.profileChanges?.[0]?.profile ?? null

      if (!profile) {
        result.available = false
        result.errorMessage = 'Unknown Error'

        return result
      }

      Object.assign(weapons, bestLampWeapons(profile.items ?? {}))

      result.haveCount = Object.values(weapons).filter(Boolean).length
      result.complete = result.haveCount === 6

      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      result.available = false
      result.errorMessage =
        error?.response?.data?.errorMessage ?? 'Unknown Error'
    }

    return result
  }

  static async favorite(accounts: Array<AccountData>) {
    try {
      const responses = await Promise.allSettled(
        accounts.map(async (account) => {
          return MCPDqWeapons.favoriteAccount(account)
        })
      )

      const data = responses
        .filter(isFulfilledResult)
        .map((response) => response.value)

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.DqWeaponsFavoriteNotification,
        data
      )

      return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.DqWeaponsFavoriteNotification,
      []
    )
  }

  private static async favoriteAccount(
    account: AccountData
  ): Promise<DqWeaponsFavoriteAccountResult> {
    const result: DqWeaponsFavoriteAccountResult = {
      accountId: account.accountId,
      already: 0,
      favorited: 0,
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.errorMessage = 'Unknown Error'

        return result
      }

      const profileResponse = await getQueryProfile({
        accessToken,
        accountId: account.accountId,
      })
      const profile =
        profileResponse.data.profileChanges?.[0]?.profile ?? null

      if (!profile) {
        result.errorMessage = 'Unknown Error'

        return result
      }

      const items = (profile.items ?? {}) as Record<
        string,
        { templateId?: string; attributes?: Record<string, unknown> }
      >
      const lampIds = collectLampWeaponItemIds(items)
      const toFavorite = lampIds.filter((itemId) => {
        return items[itemId]?.attributes?.favorite !== true
      })

      result.already = lampIds.length - toFavorite.length

      if (toFavorite.length <= 0) {
        return result
      }

      const chunkSize = 32

      for (let index = 0; index < toFavorite.length; index += chunkSize) {
        const chunk = toFavorite.slice(index, index + chunkSize)

        await setItemFavoriteStatusBatch({
          accessToken,
          accountId: account.accountId,
          itemIds: chunk,
          itemFavStatus: chunk.map(() => true),
        })

        result.favorited += chunk.length
      }

      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      result.errorMessage =
        error?.response?.data?.errorMessage ?? 'Unknown Error'
    }

    return result
  }
}

function isFulfilledResult<T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled'
}
