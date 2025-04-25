import type { AccountDataList } from '../../types/accounts'
import type {
  AutoLlamasData,
  AutoLlamasRecord,
} from '../../types/auto-llamas'
import type { MCPQueryProfileProfileChangesPrerollData } from '../../types/services/mcp'
import type { RewardsNotification } from '../../types/notifications'

import { Collection } from '@discordjs/collection'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import {
  RarityType,
  survivorsJson,
  survivorsMythicLeadsJson,
} from '../../config/constants/resources'

import { Authentication } from '../core/authentication'
import { Storefront } from '../core/storefront'
import { MainWindow } from './windows/main'
import { AccountsManager } from './accounts'
import { DataDirectory } from './data-directory'

import {
  AutoLlamasAccountAddParams,
  AutoLlamasAccountUpdateParams,
  AutoLlamasBulkAction,
} from '../../state/stw-operations/auto/llamas'

import {
  getQueryProfile,
  getQueryProfileMainProfile,
  populatePrerolledOffers,
  purchaseCatalogEntry,
} from '../../services/endpoints/mcp'
import { getCatalog } from '../../services/endpoints/storefront'

import { getKey, parseRarity } from '../../lib/parsers/resources'
import { isMCPQueryProfileChangesPrerollData } from '../../lib/check-objects'
import { getDateWithDefaultFormat } from '../../lib/dates'
import { sleep } from '../../lib/timers'

export enum ProcessLlamaType {
  FreeUpgrade = 'free-upgrade-llama',
  Survivor = 'survivor',
}

export class AutoLlamas {
  private static _accounts: Collection<string, AutoLlamasData> =
    new Collection()

  static async load() {
    const { autoLlamas } = await DataDirectory.getAutoLlamasFile()

    Object.values(autoLlamas).forEach(({ accountId, actions }) => {
      AutoLlamas._accounts.set(accountId, {
        accountId,
        actions,
      })
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.AutoLlamasLoadAccountsResponse,
      autoLlamas
    )
  }

  static async addAccount(accounts: AutoLlamasAccountAddParams) {
    const result = await DataDirectory.getAutoLlamasFile()

    await DataDirectory.updateAutoLlamasFile({
      ...result.autoLlamas,
      ...Object.entries(accounts ?? {}).reduce(
        (accumulator, [accountId, value]) => {
          accumulator[accountId] = {
            accountId,
            actions: {
              survivors: value.actions?.survivors ?? false,
              'free-llamas': value.actions?.['free-llamas'] ?? false,
              'use-token': value.actions?.['use-token'] ?? false,
            },
          }

          AutoLlamas._accounts.set(accountId, accumulator[accountId])

          return accumulator
        },
        {} as AutoLlamasRecord
      ),
    })
  }

  static async removeAccounts(data: Array<string> | null) {
    if (data === null) {
      await DataDirectory.updateAutoLlamasFile({})

      AutoLlamas._accounts.clear()

      return
    }

    const accounts = AutoLlamas._accounts.reduce(
      (accumulator, { accountId, actions }) => {
        if (data.includes(accountId)) {
          AutoLlamas._accounts.delete(accountId)
        } else {
          accumulator[accountId] = {
            accountId,
            actions,
          }
        }

        return accumulator
      },
      {} as AutoLlamasRecord
    )

    await DataDirectory.updateAutoLlamasFile(accounts)
  }

  static async updateAccounts(data: AutoLlamasAccountUpdateParams) {
    if (
      data === AutoLlamasBulkAction.EnableBuy ||
      data === AutoLlamasBulkAction.DisableBuy
    ) {
      const accounts = AutoLlamas._accounts.reduce(
        (accumulator, { accountId, actions }) => {
          const newState = (type: keyof AutoLlamasData['actions']) =>
            data === AutoLlamasBulkAction.EnableBuy
              ? true
              : data === AutoLlamasBulkAction.DisableBuy
                ? false
                : actions[type]

          accumulator[accountId] = {
            accountId,
            actions: {
              ...actions,
              // survivors: newState('survivors'),
              'free-llamas': newState('free-llamas'),
              // 'use-token': newState('use-token'),
            },
          }

          AutoLlamas._accounts.set(accountId, accumulator[accountId])

          return accumulator
        },
        {} as AutoLlamasRecord
      )

      await DataDirectory.updateAutoLlamasFile(accounts)

      return
    }

    const accounts = AutoLlamas._accounts.reduce(
      (accumulator, { accountId, actions }) => {
        accumulator[accountId] = {
          accountId,
          actions,
        }

        const current = data[accountId] as
          | (typeof data)[string]
          | undefined

        if (current) {
          accumulator[accountId].actions[current.config.type] =
            current.config.value === 'toggle'
              ? !accumulator[accountId].actions[current.config.type]
              : current.config.value

          AutoLlamas._accounts.set(accountId, {
            ...accumulator[accountId],
            actions: {
              ...accumulator[accountId].actions,
              [current.config.type]:
                accumulator[accountId].actions[current.config.type],
            },
          })
        }

        return accumulator
      },
      {} as AutoLlamasRecord
    )

    await DataDirectory.updateAutoLlamasFile(accounts)
  }

  static findById(accountId: string) {
    return AutoLlamas._accounts.find(
      (item) => item.accountId === accountId
    )
  }

  static getAccounts(config?: { type: ProcessLlamaType }) {
    if (config?.type !== undefined) {
      return AutoLlamas._accounts.clone().filter((item) => {
        if (config.type === ProcessLlamaType.FreeUpgrade) {
          return item.actions['free-llamas']
        } else if (config.type === ProcessLlamaType.Survivor) {
          return item.actions.survivors
        }

        return false
      })
    }

    return AutoLlamas._accounts.clone()
  }

  static getAccountsByAction({
    action,
  }: {
    action: keyof AutoLlamasData['actions']
  }) {
    return AutoLlamas.getAccounts().filter(
      (account) => account.actions[action] === true
    )
  }

  static async check() {
    Storefront.checkUpgradeFreeLlama().then((available) => {
      if (available) {
        ProcessAutoLlamas.start({
          selected: AutoLlamas.getAccounts({
            type: ProcessLlamaType.FreeUpgrade,
          }),
          type: ProcessLlamaType.FreeUpgrade,
        })
      }
    })

    ProcessAutoLlamas.start({
      selected: AutoLlamas.getAccounts({
        type: ProcessLlamaType.Survivor,
      }),
      type: ProcessLlamaType.Survivor,
    })

    sleep(2).then(() => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AutoLlamasAccountCheckLoading
      )
    })
  }
}

export class ProcessAutoLlamas {
  static start({
    selected,
    type,
  }: {
    selected: Collection<string, AutoLlamasData>
    type: ProcessLlamaType
  }) {
    if (selected.size <= 0) {
      return
    }

    const accounts = selected.reduce((accumulator, current) => {
      const account = AccountsManager.getAccountById(current.accountId)

      if (account) {
        accumulator.push(account)
      }

      return accumulator
    }, [] as AccountDataList)
    const accountsRecord = selected.reduce(
      (accumulator, current) => {
        accumulator[current.accountId] = current

        return accumulator
      },
      {} as Record<string, AutoLlamasData>
    )

    accounts.forEach((account) => {
      Authentication.verifyAccessToken(account).then(
        async (initialAccessToken) => {
          if (!initialAccessToken) {
            return
          }

          const current = accountsRecord[account.accountId]

          if (type === ProcessLlamaType.Survivor) {
            if (!current.actions.survivors) {
              return
            }
          } else if (type === ProcessLlamaType.FreeUpgrade) {
            if (!current.actions['free-llamas']) {
              return
            }
          }

          // eslint-disable-next-line no-constant-condition
          while (true) {
            let success = true

            try {
              const accessToken =
                await Authentication.verifyAccessToken(account)

              if (!accessToken) {
                break
              }

              try {
                await populatePrerolledOffers({
                  accessToken,
                  accountId: account.accountId,
                })

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (error) {
                //
              }

              const queryProfile = await getQueryProfile({
                accessToken,
                accountId: account.accountId,
              })
              const profileChanges =
                queryProfile.data.profileChanges[0] ?? null

              const xRayTickets =
                Object.values(profileChanges?.profile.items).find(
                  (item) =>
                    (item.templateId as string) ===
                    'AccountResource:currency_xrayllama'
                )?.quantity ?? 0
              const llamaTokens =
                Object.values(profileChanges?.profile.items).find(
                  (item) =>
                    (item.templateId as string) ===
                    'AccountResource:voucher_cardpack_bronze'
                )?.quantity ?? 0

              let currencyTotal: number | null = null
              let currencySubType = 'AccountResource:currency_xrayllama'

              if (type === ProcessLlamaType.Survivor) {
                if (current.actions.survivors) {
                  if (current.actions['use-token']) {
                    if (llamaTokens > 0) {
                      currencySubType =
                        'AccountResource:voucher_cardpack_bronze'
                      currencyTotal = 1
                    } else if (xRayTickets > 50) {
                      currencyTotal = 50
                    }
                  } else {
                    if (xRayTickets > 50) {
                      currencyTotal = 50
                    }
                  }
                }
              } else if (type === ProcessLlamaType.FreeUpgrade) {
                if (current.actions['free-llamas']) {
                  currencyTotal = 0
                }
              }

              if (currencyTotal === null) {
                break
              }

              const catalog = await getCatalog({
                accessToken,
              })
              const cardPacks = catalog.data.storefronts.find(
                (item) => item.name === 'CardPackStorePreroll'
              )

              if (!cardPacks) {
                break
              }

              const llama = cardPacks.catalogEntries.find((item) => {
                if (type === ProcessLlamaType.Survivor) {
                  return (
                    item.devName === 'Always.UpgradePack.01' &&
                    item.dailyLimit === 50 &&
                    item.prices[0]?.regularPrice === 50 &&
                    item.prices[0]?.finalPrice === 50
                  )
                }

                return (
                  (item.devName.toLowerCase().includes('free') ||
                    item.title.toLowerCase().includes('free')) &&
                  item.prices[0]?.regularPrice === 50 &&
                  item.prices[0]?.finalPrice === 0
                )
              })

              if (!llama) {
                break
              }

              if (type === ProcessLlamaType.Survivor) {
                const mainProfile = await getQueryProfileMainProfile({
                  accessToken,
                  accountId: account.accountId,
                })
                const totalPurchases =
                  mainProfile.data.profileChanges[0]?.profile.stats
                    .attributes.daily_purchases.purchaseList[
                    llama.offerId
                  ] ?? 0

                if (totalPurchases >= 50) {
                  break
                }
              }

              const prerollData = Object.values(
                profileChanges.profile.items ?? {}
              ).find(
                (item) =>
                  isMCPQueryProfileChangesPrerollData(item) &&
                  item.attributes.offerId === llama.offerId
              ) as MCPQueryProfileProfileChangesPrerollData | undefined

              if (!prerollData) {
                break
              }

              const canPurchase =
                type === ProcessLlamaType.FreeUpgrade
                  ? true
                  : prerollData.attributes.items.some(({ itemType }) => {
                      const newKey = itemType
                        .replace(
                          /_((very)?low|medium|(very)?high|extreme)$/gi,
                          ''
                        )
                        .replace('AccountResource:', '')
                        .replace('CardPack:zcp_', '')
                      const survivor = getKey(newKey, survivorsJson)
                      const mythicSurvivor = getKey(
                        newKey,
                        survivorsMythicLeadsJson
                      )
                      const isWorker = newKey.startsWith('Worker:')
                      const rarity = parseRarity(newKey)

                      return (
                        survivor ||
                        mythicSurvivor ||
                        (isWorker &&
                          [
                            RarityType.Legendary,
                            RarityType.Mythic,
                          ].includes(rarity.rarity))
                      )
                    })

              if (!canPurchase) {
                break
              }

              const response = await purchaseCatalogEntry({
                accessToken,
                currencySubType,
                accountId: account.accountId,
                offerId: llama.offerId,
                expectedTotalPrice: currencyTotal,
              })
              const responseNotifications =
                response.data.notifications ?? []

              const notifications: Array<{
                itemType: string
                quantity: number
              }> = []

              responseNotifications?.forEach((notification) => {
                if (notification.loot) {
                  if (notification.loot.items) {
                    notification.loot.items.forEach((loot) => {
                      notifications.push({
                        itemType: loot.itemType,
                        quantity: loot.quantity,
                      })
                    })
                  } else if (notification.loot.lootGranted) {
                    notification.loot.lootGranted.items.forEach((loot) => {
                      notifications.push({
                        itemType: loot.itemType,
                        quantity: loot.quantity,
                      })
                    })
                  }
                } else if (notification.lootGranted) {
                  notification.lootGranted?.items.forEach((loot) => {
                    notifications.push({
                      itemType: loot.itemType,
                      quantity: loot.quantity,
                    })
                  })
                } else if (notification.lootResult) {
                  notification.lootResult?.items.forEach((loot) => {
                    notifications.push({
                      itemType: loot.itemType,
                      quantity: loot.quantity,
                    })
                  })
                }
              })

              const rewards: RewardsNotification['rewards'] = {}

              notifications.forEach(({ itemType, quantity }) => {
                if (!itemType.toLowerCase().startsWith('accolades:')) {
                  const newItemType =
                    itemType === 'AccountResource:campaign_event_currency'
                      ? profileChanges.profile.stats.attributes
                          .event_currency?.templateId ?? itemType
                      : itemType

                  if (!rewards[newItemType]) {
                    rewards[newItemType] = 0
                  }

                  rewards[newItemType] += quantity
                }
              })

              const result: RewardsNotification = {
                accolades: {
                  totalMissionXPRedeemed: 0,
                  totalQuestXPRedeemed: 0,
                },
                rewards,
                createdAt: getDateWithDefaultFormat(),
                id: crypto.randomUUID(),
                accountId: account.accountId,
              }

              MainWindow.instance.webContents.send(
                ElectronAPIEventKeys.ClaimRewardsClientGlobalSyncNotification,
                [result]
              )
              // MainWindow.instance.webContents.send(
              //   ElectronAPIEventKeys.ClaimRewardsClientGlobalAutoClaimedNotification
              // )

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              success = false
            }

            if (!success) {
              break
            }
          }
        }
      )
    })
  }
}
