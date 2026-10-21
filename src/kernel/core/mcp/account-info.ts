import type { AccountData } from '../../../types/accounts'
import type {
  AccountInfoAccountData,
  AccountInfoActionResult,
  AccountInfoProfileId,
} from '../../../types/account-info'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

import { MainWindow } from '../../startup/windows/main'
import { Authentication } from '../authentication'

import {
  getQueryProfile,
  queryProfile,
  recycleItemBatch,
  upgradeItem,
} from '../../../services/endpoints/mcp'
import {
  emptyAccountInfo,
  parseAccountInfo,
} from '../../../lib/stw/account-info'

function profileFromResponse(response: { data?: { profileChanges?: Array<{ profile?: unknown }> } }) {
  return (response.data?.profileChanges?.[0]?.profile ?? null) as {
    items?: Record<string, unknown>
    stats?: { attributes?: Record<string, unknown> }
  } | null
}

export class MCPAccountInfo {
  static async request(accounts: Array<AccountData>) {
    try {
      const responses = await Promise.allSettled(
        accounts.map(async (account) => {
          return MCPAccountInfo.requestAccount(account)
        })
      )

      const data = responses
        .filter(isFulfilledResult)
        .map((response) => response.value)

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AccountInfoNotification,
        data
      )

      return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.AccountInfoNotification,
      []
    )
  }

  static async recycle(
    account: AccountData,
    itemId: string,
    profileId: AccountInfoProfileId = 'campaign'
  ) {
    await MCPAccountInfo.runAction(account, itemId, 'recycle', profileId)
  }

  static async upgrade(
    account: AccountData,
    itemId: string,
    profileId: AccountInfoProfileId = 'campaign'
  ) {
    await MCPAccountInfo.runAction(account, itemId, 'upgrade', profileId)
  }

  private static async runAction(
    account: AccountData,
    itemId: string,
    action: 'recycle' | 'upgrade',
    profileId: AccountInfoProfileId
  ) {
    const result: AccountInfoActionResult = {
      accountId: account.accountId,
      success: false,
      action,
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.errorMessage = 'Unknown Error'
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.AccountInfoActionNotification,
          result
        )

        return
      }

      if (action === 'recycle') {
        await recycleItemBatch({
          accessToken,
          accountId: account.accountId,
          targetItemIds: [itemId],
          profileId,
        })
      } else {
        await upgradeItem({
          accessToken,
          accountId: account.accountId,
          targetItemId: itemId,
          profileId,
        })
      }

      result.success = true
      result.data = await MCPAccountInfo.requestAccount(account)
    } catch (error) {
      result.errorMessage =
        error instanceof Error ? error.message : 'Unknown Error'
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.AccountInfoActionNotification,
      result
    )
  }

  private static async requestAccount(
    account: AccountData
  ): Promise<AccountInfoAccountData> {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return emptyAccountInfo(account.accountId, false)
      }

      const [campaignRes, backpackRes, storageRes, venturesRes, athenaRes] =
        await Promise.allSettled([
          getQueryProfile({
            accessToken,
            accountId: account.accountId,
          }),
          queryProfile({
            accessToken,
            accountId: account.accountId,
            profileId: 'theater0',
          }),
          queryProfile({
            accessToken,
            accountId: account.accountId,
            profileId: 'outpost0',
          }),
          queryProfile({
            accessToken,
            accountId: account.accountId,
            profileId: 'theater2',
          }),
          queryProfile({
            accessToken,
            accountId: account.accountId,
            profileId: 'athena',
          }),
        ])

      if (campaignRes.status !== 'fulfilled') {
        return emptyAccountInfo(account.accountId, false)
      }

      const campaign = profileFromResponse(campaignRes.value)
      const backpack =
        backpackRes.status === 'fulfilled'
          ? profileFromResponse(backpackRes.value)
          : null
      const storage =
        storageRes.status === 'fulfilled'
          ? profileFromResponse(storageRes.value)
          : null
      const ventures =
        venturesRes.status === 'fulfilled'
          ? profileFromResponse(venturesRes.value)
          : null
      const athena =
        athenaRes.status === 'fulfilled'
          ? profileFromResponse(athenaRes.value)
          : null

      return parseAccountInfo(
        account.accountId,
        campaign,
        backpack,
        storage,
        ventures,
        athena
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return emptyAccountInfo(account.accountId, false)
    }
  }
}

function isFulfilledResult<T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled'
}
