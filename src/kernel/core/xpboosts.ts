import type { MCPQueryProfileProfileChangesConsumableAccountItem } from '../../types/services/mcp'
import type { AccountData } from '../../types/accounts'
import type {
  XPBoostsConsumePersonalData,
  XPBoostsConsumePersonalResponse,
  XPBoostsConsumeTeammateData,
  XPBoostsConsumeTeammateResponse,
  XPBoostsData,
  XPBoostsSearchUserConfig,
  XPBoostsSearchUserResponse,
} from '../../types/xpboosts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Authentication } from './authentication'
import { LookupManager } from './lookup'

import {
  getQueryProfile,
  getQueryPublicProfile,
  setActivateConsumable,
} from '../../services/endpoints/mcp'

import { calculateTeammateXPBoostsToUse } from '../../lib/calculations/xpboosts'
import { isMCPQueryProfileChangesConsumableAccountItem } from '../../lib/check-objects'

export class XPBoostsManager {
  static async requestAccounts(
    currentWindow: BrowserWindow,
    accounts: Array<AccountData>
  ) {
    try {
      const queryProfileResponse = await Promise.allSettled(
        accounts.map(async (account) => {
          const defaultValue: XPBoostsData = {
            accountId: account.accountId,
            available: true,
            items: {
              personal: {
                itemId: null,
                quantity: 0,
              },
              teammate: {
                itemId: null,
                quantity: 0,
              },
            },
          }

          try {
            const accessToken = await Authentication.verifyAccessToken(
              account,
              currentWindow
            )

            if (!accessToken) {
              return defaultValue
            }

            const queryProfileResponse = await getQueryProfile({
              accessToken,
              accountId: account.accountId,
            })

            if (!queryProfileResponse.data) {
              return defaultValue
            }

            const items = Object.entries(
              queryProfileResponse.data.profileChanges?.[0]?.profile.items
            ).filter(([, data]) =>
              isMCPQueryProfileChangesConsumableAccountItem(data)
            ) as
              | Array<
                  [
                    string,
                    MCPQueryProfileProfileChangesConsumableAccountItem,
                  ]
                >
              | undefined

            if (items) {
              const response = items.reduce(
                (accumulator, [id, data]) => {
                  const key =
                    data.templateId ===
                    'ConsumableAccountItem:smallxpboost'
                      ? 'personal'
                      : data.templateId ===
                          'ConsumableAccountItem:smallxpboost_gift'
                        ? 'teammate'
                        : null

                  if (key) {
                    accumulator[key].itemId = id
                    accumulator[key].quantity = data.quantity
                  }

                  return accumulator
                },
                {
                  personal: {
                    itemId: null,
                    quantity: 0,
                  },
                  teammate: {
                    itemId: null,
                    quantity: 0,
                  },
                } as XPBoostsData['items']
              )
              defaultValue.items = response

              return defaultValue
            }

            return defaultValue
          } catch (error) {
            //
          }

          return defaultValue
        })
      )
      const queryProfiles = queryProfileResponse
        .filter((response) => response.status === 'fulfilled')
        .map((response) => response.value)

      currentWindow.webContents.send(
        ElectronAPIEventKeys.XPBoostsAccountProfileResponse,
        queryProfiles
      )

      return
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.XPBoostsAccountProfileResponse,
      []
    )
  }

  static async consumePersonal(
    currentWindow: BrowserWindow,
    data: XPBoostsConsumePersonalData
  ) {
    const defaultResponse: XPBoostsConsumePersonalResponse = {
      total: {
        accounts: data.accounts.length,
        xpBoosts: {
          current: 0,
          expected: 0,
        },
      },
    }

    try {
      const { total } = data

      await Promise.allSettled(
        data.accounts
          .filter((item) => item.account)
          .map(async ({ account, accountId, items }) => {
            const { personal } = items
            const currentTotal =
              personal.quantity > total ? total : personal.quantity

            defaultResponse.total.xpBoosts.expected += currentTotal

            await Promise.allSettled(
              Array.from({ length: currentTotal }, () => null).map(
                async () => {
                  const accessToken =
                    await Authentication.verifyAccessToken(
                      account as AccountData,
                      currentWindow
                    )

                  if (!accessToken) {
                    return false
                  }

                  const mcpResponse = await setActivateConsumable({
                    accessToken,
                    accountId,
                    targetAccountId: accountId,
                    targetItemId: `${personal.itemId}`,
                  })
                  const isValid =
                    (mcpResponse.data.profileChanges?.length ?? 0) > 0

                  if (!isValid) {
                    return false
                  }

                  defaultResponse.total.xpBoosts.current++

                  return true
                }
              )
            )
          })
      )

      await XPBoostsManager.requestAccounts(
        currentWindow,
        data.originalAccounts
      )
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.XPBoostsConsumePersonalNotification,
      defaultResponse
    )
  }

  static async consumeTeammate(
    currentWindow: BrowserWindow,
    data: XPBoostsConsumeTeammateData
  ) {
    const defaultResponse: XPBoostsConsumeTeammateResponse = {
      total: {
        accounts: 0,
        destinationAccount: data.destinationAccount,
        xpBoosts: {
          current: 0,
          expected: 0,
        },
      },
    }

    try {
      const result = calculateTeammateXPBoostsToUse({
        amountToSend: data.total,
        data: data.accounts,
      })
      const accounts = data.accounts.filter((item) => {
        const isNotDestination =
          item &&
          item.accountId !== data.destinationAccount.id &&
          result[item.accountId] !== undefined

        if (isNotDestination) {
          defaultResponse.total.accounts++
        }

        return isNotDestination
      })
      const newTotal = Object.entries(result).reduce(
        (accumulator, [accountId, quantity]) => {
          let currentQuantity = quantity

          if (accountId === data.destinationAccount.id) {
            currentQuantity = 0
          }

          return accumulator + currentQuantity
        },
        0
      )

      defaultResponse.total.xpBoosts.expected = newTotal

      await Promise.allSettled(
        accounts.map(async ({ account, accountId, items }) => {
          const { teammate } = items
          const currentTotal =
            teammate.quantity > result[accountId]
              ? result[accountId]
              : teammate.quantity

          await Promise.allSettled(
            Array.from({ length: currentTotal }, () => null).map(
              async () => {
                const accessToken = await Authentication.verifyAccessToken(
                  account as AccountData,
                  currentWindow
                )

                if (!accessToken) {
                  return false
                }

                const mcpResponse = await setActivateConsumable({
                  accessToken,
                  accountId,
                  targetAccountId: data.destinationAccount.id,
                  targetItemId: `${teammate.itemId}`,
                })
                const isValid =
                  (mcpResponse.data.profileChanges?.length ?? 0) > 0

                if (!isValid) {
                  return false
                }

                currentWindow.webContents.send(
                  ElectronAPIEventKeys.XPBoostsConsumeTeammateProgressionNotification
                )

                defaultResponse.total.xpBoosts.current++

                return true
              }
            )
          )
        })
      )

      await XPBoostsManager.requestAccounts(
        currentWindow,
        data.originalAccounts
      )
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.XPBoostsConsumeTeammateNotification,
      defaultResponse
    )
  }

  static async generalSearchUser(
    currentWindow: BrowserWindow,
    config: XPBoostsSearchUserConfig
  ) {
    await XPBoostsManager.searchUser(
      ElectronAPIEventKeys.XPBoostsGeneralSearchUserNotification,
      currentWindow,
      config
    )
  }

  static async searchUser(
    notificationId: ElectronAPIEventKeys,
    currentWindow: BrowserWindow,
    config: XPBoostsSearchUserConfig
  ) {
    const defaultResponse: XPBoostsSearchUserResponse = {
      data: null,
      errorMessage: null,
      isPrivate: false,
      success: false,
    }
    const sendDefaultResponse = () => {
      currentWindow.webContents.send(notificationId, defaultResponse)
    }

    const response = await LookupManager.searchUserByDisplayName({
      ...config,
      currentWindow,
    })

    if (response.success) {
      defaultResponse.data = {
        lookup: response.data,
      }

      try {
        const accountDestinationInLauncher = config.originalAccounts.find(
          (item) => item.accountId === response.data.id
        )
        const accessToken = await Authentication.verifyAccessToken(
          accountDestinationInLauncher ?? config.account,
          currentWindow
        )

        if (!accessToken) {
          sendDefaultResponse()

          return
        }

        const queryProfileResponse = await getQueryPublicProfile({
          accessToken,
          accountId: response.data.id,
        })
        const profileChanges =
          queryProfileResponse.data.profileChanges[0] ?? null

        if (profileChanges) {
          currentWindow.webContents.send(notificationId, {
            data: {
              profileChanges,
              lookup: response.data,
            },
            errorMessage: null,
            isPrivate: false,
            success: true,
          } as XPBoostsSearchUserResponse)

          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const response =
          (error?.response?.data as Record<string, number | string>) ?? {}

        if (
          response.errorCode ===
          'errors.com.epicgames.fortnite.operation_forbidden'
        ) {
          defaultResponse.isPrivate = true
        } else {
          defaultResponse.data = null
          defaultResponse.errorMessage = null
          defaultResponse.isPrivate = false
          defaultResponse.success = false
        }
      }
    } else {
      defaultResponse.errorMessage = `${response.errorMessage}`
    }

    sendDefaultResponse()
  }
}
