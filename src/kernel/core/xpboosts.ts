import type { MCPQueryProfileProfileChangesConsumableAccountItem } from '../../types/services/mcp'
import type { AccountData } from '../../types/accounts'
import type {
  XPBoostsConsumePersonalData,
  XPBoostsConsumePersonalResponse,
  XPBoostsData,
} from '../../types/xpboosts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Authentication } from './authentication'

import {
  getQueryProfile,
  setActivateConsumable,
} from '../../services/endpoints/mcp'

import { isMCPQueryProfileProfileChangesConsumableAccountItem } from '../../lib/check-objects'

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
            const accessToken =
              await Authentication.verifyAccessToken(account)

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
              isMCPQueryProfileProfileChangesConsumableAccountItem(data)
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

            const mcpResponses = await Promise.allSettled(
              Array.from({ length: currentTotal }, () => null).map(
                async () => {
                  const accessToken =
                    await Authentication.verifyAccessToken(
                      account as AccountData
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

                  return true
                }
              )
            )
            const filteredResponses = mcpResponses.filter(
              (item) => item.status === 'fulfilled' && item.value
            )

            if (filteredResponses.length > 0) {
              mcpResponses.forEach((item) => {
                if (item.status === 'fulfilled' && item.value) {
                  defaultResponse.total.xpBoosts.current++
                }
              })
            }
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
}
