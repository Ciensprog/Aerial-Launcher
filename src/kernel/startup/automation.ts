import type {
  AutomationAccountData,
  AutomationAccountFileData,
  AutomationAccountServerData,
  AutomationServiceActionConfig,
  AutomationServiceStatusResponse,
} from '../../types/automation'

import { Collection } from '@discordjs/collection'

import { AutomationStatusType } from '../../config/constants/automation'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { AccountService } from '../core/automation/account-service'
import { MCPStorageTransfer } from '../core/mcp/storage-transfer'
import { Authentication } from '../core/authentication'
import { ClaimRewards } from '../core/claim-rewards'
import { Party } from '../core/party'
import { MainWindow } from './windows/main'
import { AccountsManager } from './accounts'
import { DataDirectory } from './data-directory'
import { SettingsManager } from './settings'

import { AutomationState } from '../../state/stw-operations/automation'

import { getQueryProfile } from '../../services/endpoints/mcp'
import { fetchParty } from '../../services/endpoints/party'

import {
  isMCPQueryProfileChangesCardPack,
  isMCPQueryProfileChangesQuest,
} from '../../lib/check-objects'

const maxRetries = 3

export class Automation {
  private static _accounts: Collection<
    string,
    AutomationAccountServerData
  > = new Collection()
  private static _services: Collection<string, AccountService> =
    new Collection()
  private static _retryCounters: Collection<string, number> =
    new Collection()

  private static _activeChecks: Record<string, NodeJS.Timeout | null> = {}
  private static _missionActive: Record<string, boolean> = {}

  static async load() {
    const { automation } = await DataDirectory.getAutomationFile()
    const accounts = AccountsManager.getAccounts()

    Object.values(automation).forEach((data) => {
      if (accounts.has(data.accountId)) {
        Automation._accounts.set(data.accountId, {
          ...data,
          status: AutomationStatusType.LOADING,
        })
        Automation.start(data)
      }
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.AutomationServiceResponseData,
      automation,
      false,
    )
  }

  static async addAccount(accountId: string) {
    const result = await DataDirectory.getAutomationFile()
    const data = {
      accountId,
      actions: {
        claim: false,
        kick: false,
        transferMats: false,
      },
    }

    await DataDirectory.updateAutomationFile({
      ...result.automation,
      [accountId]: data,
    })
    Automation._accounts.set(data.accountId, {
      ...data,
      status: AutomationStatusType.LOADING,
    })
    Automation.start(data)
  }

  static async removeAccount(accountId: string) {
    Automation.updateAccountData(accountId, {
      status: AutomationStatusType.LOADING,
    })
    // Automation.getProcessByAccountId(accountId)?.clearMissionIntervalId()
    Automation.getServiceByAccountId(accountId)?.destroy()

    await Automation.refreshData(accountId, true)
  }

  static async updateAction(
    accountId: string,
    config: AutomationServiceActionConfig,
  ) {
    Automation.updateAccountData(accountId, {
      actions: {
        [config.type]: config.value,
      },
    })

    const current = Automation._accounts.get(accountId)

    if (!current) {
      return
    }

    const result = await DataDirectory.getAutomationFile()
    const data = {
      accountId,
      actions: {
        ...current.actions,
        [config.type]: config.value,
      },
    }

    await DataDirectory.updateAutomationFile({
      ...result.automation,
      [accountId]: data,
    })
  }

  static start(data: AutomationAccountFileData) {
    const setNewStatus = (status: AutomationStatusType) => {
      Automation.updateAccountData(data.accountId, {
        status,
      })
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AutomationServiceStartNotification,
        {
          accountId: data.accountId,
          status,
        } as AutomationServiceStatusResponse,
      )
    }

    setNewStatus(AutomationStatusType.LOADING)

    const account = AccountsManager.getAccountById(data.accountId)!

    Authentication.verifyAccessToken(account)
      .then((accessToken) => {
        if (accessToken) {
          const accountService = new AccountService({
            accessToken,
            account,
          })

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const reAuth = (error: any) => {
            const restartErrors = [
              'disconnect',
              'invalid_refresh_token',
              'party_not_found',
            ].some((code) => error?.code?.toLowerCase().includes(code))

            if (restartErrors) {
              if (error?.code === 'disconnect') {
                if (
                  (Automation._retryCounters.get(account.accountId) ?? 0) <
                  maxRetries
                ) {
                  Automation.reload(account.accountId)
                } else {
                  this.clearActiveChecks([account.accountId])
                  Automation._retryCounters.delete(account.accountId)
                }
              } else {
                Automation.reload(account.accountId)
              }
            }
          }
          const disconnect = () => {
            setNewStatus(AutomationStatusType.DISCONNECTED)

            if (!Automation._retryCounters.has(account.accountId)) {
              Automation._retryCounters.set(account.accountId, 0)
            }

            Automation._retryCounters.set(
              account.accountId,
              (Automation._retryCounters.get(account.accountId) ?? 0) + 1,
            )

            reAuth({ code: 'disconnect' })
          }

          const initTimeout = setTimeout(() => {
            setNewStatus(AutomationStatusType.ERROR)
            disconnect()
          }, 10_000) // 10 seconds

          accountService.onceSessionStarted(async () => {
            setNewStatus(AutomationStatusType.LISTENING)
            clearTimeout(initTimeout)

            try {
              const response = await fetchParty({
                accessToken,
                accountId: account.accountId,
              })
              const party = response.data.current?.[0]

              if (party) {
                this.checkJoiningExistingSession({
                  accountId: account.accountId,
                  meta: party.meta,
                })
              }
            } catch (error) {
              //
            }
          })

          accountService.onDisconnected(() => {
            disconnect()
          })
          accountService.onMemberDisconnected((member) => {
            if (!member.ns || member.ns?.toLowerCase() !== 'fortnite') {
              return
            }

            if (member.account_id === accountService.accountId) {
              disconnect()
            }
          })
          accountService.onMemberExpired((member) => {
            if (!member.ns || member.ns?.toLowerCase() !== 'fortnite') {
              return
            }

            if (member.account_id === accountService.accountId) {
              disconnect()
            }
          })

          accountService.onPartyUpdated(async (value) => {
            try {
              this.checkJoiningExistingSession({
                accountId: account.accountId,
                meta: value.party_state_updated,
              })
            } catch (errro) {
              //
            }
          })

          accountService.onMemberJoined((member) => {
            if (!member.ns || member.ns?.toLowerCase() !== 'fortnite') {
              return
            }

            if (member.account_id === accountService.accountId) {
              setTimeout(async () => {
                try {
                  const account = AccountsManager.getAccountById(
                    accountService.accountId,
                  )

                  if (!account) {
                    return
                  }

                  const accessToken =
                    await Authentication.verifyAccessToken(account)

                  if (!accessToken) {
                    return
                  }

                  const response = await fetchParty({
                    accessToken,
                    accountId: account.accountId,
                  })
                  const party = response.data.current?.[0]

                  if (party) {
                    this.checkJoiningExistingSession({
                      accountId: account.accountId,
                      meta: party.meta,
                    })
                  }
                } catch (error) {
                  //
                }
              }, 8000)
            }
          })

          Automation._services.set(
            accountService.accountId,
            accountService,
          )

          return
        }

        setNewStatus(AutomationStatusType.ERROR)
      })
      .catch(() => {
        setNewStatus(AutomationStatusType.ERROR)
      })
  }

  static async reload(accountId: string) {
    const current = Automation._accounts.get(accountId)

    if (!current) {
      return
    }

    Automation.getServiceByAccountId(accountId)?.destroy()
    Automation._services.delete(accountId)
    this.clearActiveChecks([current.accountId])

    Automation.start(current)
  }

  static getAccountById(
    accountId: string,
  ): AutomationAccountServerData | undefined {
    return Automation._accounts.get(accountId)
  }

  static getServices() {
    return Automation._services.clone()
  }

  static getServiceByAccountId(accountId: string) {
    return Automation._services.find(
      (accountService) => accountService.accountId === accountId,
    )
  }

  static async checkJoiningExistingSession({
    accountId,
    meta,
  }: {
    accountId: string
    meta: Partial<Record<string, string>>
  }) {
    try {
      const automationAccount = Automation.getAccountById(accountId)

      if (!automationAccount) {
        return
      }

      if (
        !automationAccount.actions.kick &&
        !automationAccount.actions.claim &&
        !automationAccount.actions.transferMats
      ) {
        return
      }

      const defaultCampaignInfo = JSON.parse(
        meta['Default:CampaignInfo_j'] ?? '{}',
      )
      const campaignInfo = defaultCampaignInfo?.CampaignInfo

      if (campaignInfo) {
        if (campaignInfo.matchmakingState === 'JoiningExistingSession') {
          if (Automation._missionActive[accountId]) {
            return
          }

          if (Automation._missionActive[accountId] === undefined) {
            Automation._missionActive[accountId] = false
          }

          const settings = await SettingsManager.getData()
          const missionInterval = Number(settings.missionInterval)

          Automation._missionActive[accountId] = true
          Automation._activeChecks[accountId] = setInterval(async () => {
            try {
              const account = AccountsManager.getAccountById(accountId)

              if (!account) {
                this.clearActiveChecks([accountId])

                return
              }

              const accessToken =
                await Authentication.verifyAccessToken(account)

              if (!accessToken) {
                this.clearActiveChecks([accountId])

                return
              }

              const response = await getQueryProfile({
                accessToken,
                accountId,
              })
              const profileChanges =
                response.data.profileChanges[0] ?? null

              const pendingMissionAlertRewardsTotal =
                profileChanges?.profile.stats.attributes
                  .mission_alert_redemption_record
                  ?.pendingMissionAlertRewards?.items.length ?? 0
              const pendingDifficultyIncreaseRewardsTotal =
                profileChanges?.profile.stats.attributes
                  .difficulty_increase_rewards_record?.pendingRewards
                  .length ?? 0

              const items = Object.entries(
                profileChanges?.profile?.items ?? {},
              )
              const pendingRewards = items
                .filter(
                  ([, itemValue]) =>
                    (isMCPQueryProfileChangesCardPack(itemValue) &&
                      (itemValue.attributes.match_statistics ||
                        itemValue.attributes.pack_source ===
                          'ItemCache')) ||
                    (isMCPQueryProfileChangesQuest(itemValue) &&
                      itemValue.attributes.quest_state === 'Completed'),
                )
                .map(([itemKey]) => itemKey)

              if (
                pendingMissionAlertRewardsTotal > 0 ||
                pendingDifficultyIncreaseRewardsTotal > 0 ||
                pendingRewards.length > 0
              ) {
                const automationAccount =
                  Automation.getAccountById(accountId)

                if (!automationAccount) {
                  this.clearActiveChecks([accountId])

                  return
                }

                if (
                  automationAccount.actions.kick ||
                  automationAccount.actions.claim
                ) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const tasks: Array<Promise<any>> = []

                  if (automationAccount.actions.kick) {
                    const accounts = AccountsManager.getAccounts()

                    tasks.push(
                      Party.kickPartyMembers(
                        account,
                        [...accounts.values()],
                        automationAccount.actions.claim ?? false,
                        {
                          useGlobalNotification: true,
                        },
                      ),
                    )
                  }

                  if (automationAccount.actions.claim) {
                    tasks.push(ClaimRewards.start([account], true))
                  }

                  await Promise.allSettled(tasks)
                  this.clearActiveChecks([accountId])
                } else if (automationAccount.actions.transferMats) {
                  this.clearActiveChecks([accountId])
                  MCPStorageTransfer.buildingMaterials(account).catch(
                    () => {},
                  )
                }
              }
            } catch (error) {
              //
            }
          }, missionInterval * 1_000)
        } else if (Automation._missionActive[accountId]) {
          const removeCheck = async () => {
            try {
              const account = AccountsManager.getAccountById(accountId)

              if (!account) {
                return true
              }

              const accessToken =
                await Authentication.verifyAccessToken(account)

              if (!accessToken) {
                return true
              }

              const response = await fetchParty({
                accessToken,
                accountId: account.accountId,
              })
              const party = response.data.current?.[0]

              if (party) {
                const defaultCampaignInfo = JSON.parse(
                  meta['Default:CampaignInfo_j'] ?? '{}',
                )
                const campaignInfo = defaultCampaignInfo?.CampaignInfo

                if (
                  campaignInfo &&
                  campaignInfo.matchmakingState ===
                    'JoiningExistingSession'
                ) {
                  return false
                }
              }
            } catch (error) {
              //
            }

            return true
          }

          const remove = await removeCheck()

          if (remove) {
            Automation._missionActive[accountId] = false

            this.clearActiveChecks([accountId])
          }
        }
      }
    } catch (error) {
      //
    }
  }

  static clearActiveChecks(accountIds: Array<string> | null) {
    const ids =
      accountIds === null
        ? Object.keys(Automation._activeChecks)
        : accountIds

    ids.forEach((accountId) => {
      if (
        Automation._activeChecks[accountId] !== undefined &&
        Automation._activeChecks[accountId] !== null
      ) {
        clearInterval(Automation._activeChecks[accountId])
        Automation._activeChecks[accountId] = null
      }
    })
  }

  private static async refreshData(
    accountId: string,
    removeAccount?: boolean,
  ) {
    const automation = Automation._accounts
      .filter((account) => account.accountId !== accountId)
      .map((account) => account)
      .reduce(
        (accumulator, account) => {
          accumulator[account.accountId] = {
            ...account,
          }

          return accumulator
        },
        {} as Parameters<AutomationState['refreshAccounts']>[0],
      )

    if (removeAccount) {
      Automation._accounts.delete(accountId)
      Automation._services.delete(accountId)
    }

    await DataDirectory.updateAutomationFile(automation)

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.AutomationServiceResponseData,
      automation,
      true,
    )
  }

  private static updateAccountData(
    accountId: string,
    data: Partial<{
      actions: Partial<AutomationAccountData['actions']>
      status: Partial<AutomationAccountData['status']>
    }>,
  ) {
    const automationAccount = Automation.getAccountById(accountId)

    if (automationAccount) {
      const actionsNewValueClaim =
        data.actions?.claim ?? automationAccount.actions.claim
      const actionsNewValueKick =
        data.actions?.kick ?? automationAccount.actions.kick
      const actionsNewValueTransferMats =
        data.actions?.transferMats ??
        automationAccount.actions.transferMats

      if (data.actions) {
        if (
          (!automationAccount.actions.claim && actionsNewValueClaim) ||
          (!automationAccount.actions.kick && actionsNewValueKick) ||
          (!automationAccount.actions.transferMats &&
            actionsNewValueTransferMats)
        ) {
          if (typeof Automation._activeChecks[accountId] !== 'number') {
            const check = async () => {
              try {
                const account = AccountsManager.getAccountById(accountId)

                if (!account) {
                  return
                }

                const accessToken =
                  await Authentication.verifyAccessToken(account)

                if (!accessToken) {
                  return
                }

                const response = await fetchParty({
                  accessToken,
                  accountId,
                })
                const party = response.data.current?.[0]

                if (party) {
                  this.checkJoiningExistingSession({
                    accountId,
                    meta: party.meta,
                  })
                }
              } catch (error) {
                //
              }
            }

            check()
          }
        } else if (!actionsNewValueClaim && !actionsNewValueKick) {
          this.clearActiveChecks([accountId])
        }
      }

      Automation._accounts.set(accountId, {
        accountId,
        actions: {
          claim: actionsNewValueClaim,
          kick: actionsNewValueKick,
          transferMats: actionsNewValueTransferMats,
        },
        status: data.status ?? automationAccount.status,
      })
    }
  }
}
