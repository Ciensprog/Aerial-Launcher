import type {
  TaxiServiceAccountData,
  TaxiServiceAccountFileData,
  TaxiServiceAccountFileDataList,
  TaxiServiceAccountServerData,
  TaxiServiceServiceActionConfig,
  TaxiServiceServiceStatusResponse,
} from '../../types/taxi-service'

import { Collection } from '@discordjs/collection'
import { Client } from 'fnbr'

import { AutomationStatusType } from '../../config/constants/automation'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Authentication } from '../core/authentication'
import { LookupManager } from '../core/lookup'
import { MainWindow } from './windows/main'
import { AccountsManager } from './accounts'
import { DataDirectory } from './data-directory'

import {
  TaxiServiceNotificationEventFriendAdded,
  TaxiServiceNotificationEventFriendRequestSend,
  TaxiServiceNotificationEventPartyInvite,
  TaxiServiceNotificationEventPartyMemberJoined,
  TaxiServiceNotificationType,
} from '../../state/stw-operations/taxi-service'

import { addFriend, removeFriend } from '../../services/endpoints/friends'

import { getExtendedDateFormat } from '../../lib/dates'
import { parseCustomDisplayName } from '../../lib/utils'

export enum AccountPresence {
  Active = 'active',
  DnD = 'dnd',
  Unknown = 'unknown',
}

export enum AccountStatus {
  Offline = 'offline',
  Online = 'online',
}

export enum FORTStatsNumber {
  LOW = 0,
  HIGH = 92765,
}

export enum MatchmakingResult {
  NotStarted = 'NotStarted',
  Success = 'Success',
}

export enum MatchmakingState {
  FindingEmptyServer = 'FindingEmptyServer',
  JoiningExistingSession = 'JoiningExistingSession',
  NotMatchmaking = 'NotMatchmaking',
  TestingEmptyServers = 'TestingEmptyServers',
}

export type PartyMetaSchema = {
  'Default:CampaignInfo_j': {
    CampaignInfo: {
      matchmakingResult: MatchmakingResult
      matchmakingState: MatchmakingState
    }
  }
  'Default:ZoneInstanceId_s'?: {
    /**
     * Main zone Id: Stonewood, Plankerton, Canny Valley, Twine Peaks, etc
     */
    theaterId: string
    /**
     * Mission Alert Id (one-time extra reward)
     */
    theaterMissionAlertId: string
    /**
     * Mission Id
     */
    theaterMissionId: string
    worldId: string
    zoneThemeClass: string
  }
}

type AccountService = {
  accountId: string
  status: AccountPresence
  client: Client
  currentTimeout?: NodeJS.Timeout | null
}

const maxRetries = 3

export class TaxiService {
  private static _accounts: Collection<
    string,
    TaxiServiceAccountServerData
  > = new Collection()
  private static _services: Collection<string, AccountService> =
    new Collection()
  private static _retryCounters: Collection<string, number> =
    new Collection()
  private static _reJoinTo: Collection<string, string> = new Collection()

  static async load() {
    const { taxiService } = await DataDirectory.getTaxiServiceFile()
    const accounts = AccountsManager.getAccounts()

    Object.values(taxiService).forEach((data) => {
      if (accounts.has(data.accountId)) {
        TaxiService._accounts.set(data.accountId, {
          ...data,
          status: AutomationStatusType.LOADING,
        })
        TaxiService.start(data)
      }
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.TaxiServiceServiceResponseData,
      taxiService,
      false,
    )
  }

  static async sendRequests(
    origin: Array<string>,
    destination: Array<string>,
  ) {
    origin.map(async (accountId) => {
      const account = AccountsManager.getAccountById(accountId)

      if (!account) {
        return
      }

      const response = await Promise.all(
        destination.map(async (displayName) => {
          const result = await LookupManager.searchUserByDisplayName({
            account,
            displayName,
          })

          if (!result.success) {
            return {
              displayName,
              accountId: displayName,
              error: result.errorCode,
            } as TaxiServiceNotificationEventFriendRequestSend['accounts'][number]
          }

          const accessToken =
            await Authentication.verifyAccessToken(account)

          if (!accessToken) {
            return {
              displayName,
              accountId: displayName,
              error: 'invalid_access_token',
            } as TaxiServiceNotificationEventFriendRequestSend['accounts'][number]
          }

          try {
            await addFriend({
              accessToken,
              accountId,
              friendId: result.data.id,
            })

            return {
              accountId: result.data.id,
              displayName: result.data.displayName,
            } as TaxiServiceNotificationEventFriendRequestSend['accounts'][number]

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            const response =
              (error?.response?.data as Record<string, number | string>) ??
              {}

            return {
              accountId: result.data.id,
              displayName: result.data.displayName,
              error:
                `${response.errorCode}`?.split('.')?.at(-1) ?? 'UNKNOWN',
            } as TaxiServiceNotificationEventFriendRequestSend['accounts'][number]
          }
        }),
      )

      const data = {
        id: crypto.randomUUID(),
        accounts: response,
        createdAt: getExtendedDateFormat(),
        me: {
          accountId: account.accountId,
          displayName: parseCustomDisplayName(account),
        },
        type: TaxiServiceNotificationType.FriendRequestSend,
        withErrors: response.some((item) => item.error !== undefined),
      } as TaxiServiceNotificationEventFriendRequestSend

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.TaxiServiceServiceNotifications,
        data,
      )
    })
  }

  static async addAccount(accountId: string) {
    const result = await DataDirectory.getTaxiServiceFile()
    const data = {
      accountId,
      actions: {
        high: true,
        denyFriendsRequests: true,
        activeStatus: '',
        busyStatus: '',
      },
    }

    await DataDirectory.updateTaxiServiceFile({
      ...result.taxiService,
      [accountId]: data,
    })
    TaxiService._accounts.set(data.accountId, {
      ...data,
      status: AutomationStatusType.LOADING,
    })
    TaxiService.start(data)
  }

  static async removeAccount(accountId: string) {
    const currentTimeout =
      TaxiService.getServiceByAccountId(accountId)?.currentTimeout

    if (currentTimeout !== null && currentTimeout !== undefined) {
      TaxiService.getServiceByAccountId(accountId)?.client.clearTimeout(
        currentTimeout,
      )
    }

    TaxiService.updateAccountData(accountId, {
      status: AutomationStatusType.LOADING,
    })
    TaxiService.getServiceByAccountId(
      accountId,
    )?.client.removeAllListeners()
    TaxiService.getServiceByAccountId(accountId)?.client.xmpp.disconnect()
    TaxiService.getServiceByAccountId(accountId)?.client.logout()

    await TaxiService.refreshData(accountId, true)
  }

  static async updateAction(
    accountId: string,
    config: TaxiServiceServiceActionConfig,
  ) {
    TaxiService.updateAccountData(accountId, {
      actions: {
        [config.type]: config.value,
      },
    })

    const current = TaxiService._accounts.get(accountId)

    if (!current) {
      return
    }

    const result = await DataDirectory.getTaxiServiceFile()
    const data = {
      accountId,
      actions: {
        ...current.actions,
        [config.type]: config.value,
      },
    }

    await DataDirectory.updateTaxiServiceFile({
      ...result.taxiService,
      [accountId]: data,
    })
  }

  static start(data: TaxiServiceAccountFileData) {
    const setNewStatus = (status: AutomationStatusType) => {
      TaxiService.updateAccountData(data.accountId, {
        status,
      })
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.TaxiServiceServiceStartNotification,
        {
          accountId: data.accountId,
          status,
        } as TaxiServiceServiceStatusResponse,
      )
    }

    setNewStatus(AutomationStatusType.LOADING)

    const defaultStatuses = {
      active: () => {
        const info = TaxiService._accounts.get(data.accountId)

        if (!info) {
          return 'Libre'
        }

        return info.actions.activeStatus.trim().length > 0
          ? info.actions.activeStatus.trim()
          : 'Libre'
      },
      busy: () => {
        const info = TaxiService._accounts.get(data.accountId)

        if (!info) {
          return 'Ocupado'
        }

        return info.actions.busyStatus.trim().length > 0
          ? info.actions.busyStatus.trim()
          : 'Ocupado'
      },
    }
    const account = AccountsManager.getAccountById(data.accountId)!

    const accountService: AccountService = {
      accountId: account.accountId,
      status: AccountPresence.Unknown,
      currentTimeout: null as undefined | NodeJS.Timeout | null,
      client: new Client({
        auth: {
          deviceAuth: {
            accountId: account.accountId,
            deviceId: account.deviceId,
            secret: account.secret,
          },
          authClient: 'fortniteAndroidGameClient',
          createLauncherSession: false,
          killOtherTokens: false,
        },
        partyConfig: {
          chatEnabled: false,
          discoverability: 'INVITED_ONLY',
          joinability: 'INVITE_AND_FORMER',
          joinConfirmation: true,
          maxSize: 4,
          privacy: {
            acceptingMembers: true,
            invitePermission: 'AnyMember',
            inviteRestriction: 'AnyMember',
            onlyLeaderFriendsCanJoin: false,
            partyType: 'Private',
            presencePermission: 'Anyone',
          },
        },
        defaultOnlineType: 'away',
        defaultStatus: defaultStatuses.active(),
        restRetryLimit: 3,
        xmppMaxConnectionRetries: 3,
      }),
    }

    const clearCurrentTimeout = () => {
      if (
        accountService.currentTimeout !== null &&
        accountService.currentTimeout !== undefined
      ) {
        accountService.client.clearTimeout(accountService.currentTimeout)
      }
    }
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
            (TaxiService._retryCounters.get(account.accountId) ?? 0) <
            maxRetries
          ) {
            TaxiService.reload([account.accountId])
          } else {
            TaxiService._retryCounters.delete(account.accountId)
          }
        } else {
          TaxiService.reload([account.accountId])
        }
      }
    }
    const disconnect = () => {
      setNewStatus(AutomationStatusType.DISCONNECTED)

      if (!TaxiService._retryCounters.has(account.accountId)) {
        TaxiService._retryCounters.set(account.accountId, 0)
      }

      accountService.status = AccountPresence.Unknown
      TaxiService._retryCounters.set(
        account.accountId,
        (TaxiService._retryCounters.get(account.accountId) ?? 0) + 1,
      )

      reAuth({ code: 'disconnect' })
    }

    const initTimeout = setTimeout(() => {
      setNewStatus(AutomationStatusType.ERROR)
      accountService.status = AccountPresence.Unknown
      disconnect()
    }, 10_000) // 10 seconds

    accountService.client.once('ready', () => {
      setNewStatus(AutomationStatusType.LISTENING)
      accountService.status = AccountPresence.Active
      clearTimeout(initTimeout)

      const denyFriendsRequests =
        TaxiService._accounts.get(accountService.accountId)?.actions
          .denyFriendsRequests ?? true

      if (denyFriendsRequests) {
        const pendingList =
          accountService.client.friend.pendingList.filter(
            (item) => item.direction === 'INCOMING',
          )

        Authentication.verifyAccessToken(account).then((accessToken) => {
          if (!accessToken) {
            return
          }

          pendingList.forEach((pending) => {
            removeFriend({
              accessToken,
              accountId: account.accountId,
              friendId: pending.id,
            })
          })
        })
      }

      if (TaxiService._reJoinTo.has(account.accountId)) {
        accountService.client.friend
          .resolve(TaxiService._reJoinTo.get(account.accountId)!)
          ?.sendJoinRequest()
          .catch(() => {})
        TaxiService._reJoinTo.delete(account.accountId)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accountService.client.on('xmpp:message:error', (error: any) => {
      reAuth(error)
    })
    accountService.client.on('disconnected', () => {
      disconnect()
    })
    accountService.client.on('party:member:disconnected', (member) => {
      if (member.id === accountService.accountId) {
        disconnect()
      }
    })
    accountService.client.on('party:member:expired', (member) => {
      if (member.id === accountService.accountId) {
        disconnect()
      }
    })
    accountService.client.on('party:member:kicked', (member) => {
      if (member.id === accountService.accountId) {
        clearCurrentTimeout()
        accountService.status = AccountPresence.Active
        accountService.client.setStatus(defaultStatuses.active(), 'away')
      }
    })
    accountService.client.on('party:member:left', (member) => {
      if (
        member.id === accountService.accountId ||
        (member.party.members.size === 1 &&
          member.party.members.first()?.id === accountService.accountId)
      ) {
        clearCurrentTimeout()
        accountService.status = AccountPresence.Active
        accountService.client.setStatus(defaultStatuses.active(), 'away')
      }
    })

    accountService.client.on('friend:request', (incoming) => {
      const denyFriendsRequests =
        TaxiService._accounts.get(accountService.accountId)?.actions
          .denyFriendsRequests ?? true

      Authentication.verifyAccessToken(account).then((accessToken) => {
        if (!accessToken) {
          return
        }

        const data = {
          accessToken,
          accountId: accountService.accountId,
          friendId: incoming.id,
        }

        if (denyFriendsRequests) {
          removeFriend(data)
        } else {
          addFriend(data)
        }
      })
    })

    accountService.client.on('party:member:joined', async (member) => {
      try {
        const partyMetaSchema: Record<string, string> =
          member.party.meta.schema
        const defaultCampaignInfo: PartyMetaSchema['Default:CampaignInfo_j'] =
          JSON.parse(partyMetaSchema['Default:CampaignInfo_j'])
        const { matchmakingState } = defaultCampaignInfo.CampaignInfo

        if (
          matchmakingState !== MatchmakingState.NotMatchmaking &&
          member.id === accountService.accountId
        ) {
          member.client.leaveParty().catch(() => {})
          clearCurrentTimeout()

          accountService.status = AccountPresence.DnD
          member.client.setStatus(defaultStatuses.active(), 'away')

          return
        }
      } catch (error) {
        //
      }

      const filteredMembersId = member.party.members.filter(({ id }) =>
        TaxiService._accounts.has(id),
      )

      if (filteredMembersId.size > 1) {
        /**
         * Only one client at a time can be on the team
         */
        const randomMember = filteredMembersId.random()
        const removeThisMembers = filteredMembersId
          .filter(({ id }) => randomMember?.id !== id)
          .map((item) => item.id)

        await Promise.allSettled(
          removeThisMembers.map(async (item) => {
            const currentClient = TaxiService._services.get(item)

            if (currentClient) {
              try {
                await currentClient.client.party?.leave()
              } catch (error) {
                //
              }

              clearCurrentTimeout()

              currentClient.status = AccountPresence.Active
              currentClient.client.setStatus(
                defaultStatuses.active(),
                'away',
              )
            }
          }),
        )

        return
      }

      let members = member.party.members
        .map((item) => ({
          accountId: item.id,
          displayName: item.displayName,
          isLeader: item.isLeader,
          isSender: false,
        }))
        .filter((item) => item.accountId !== account.accountId)

      if (
        members.length === 0 ||
        (members.length === 1 &&
          members[0]?.accountId === account.accountId)
      ) {
        return
      }

      members = await Promise.all(
        members.map(async (item) => {
          if (typeof item.displayName !== 'string') {
            const result = await LookupManager.searchUserByDisplayName({
              account,
              displayName: item.accountId,
            })

            if (result.success) {
              return {
                ...item,
                displayName: result.data.displayName ?? item.accountId,
              }
            }
          }

          return {
            ...item,
            displayName: item.displayName ?? item.accountId,
          }
        }),
      )

      const data = {
        members,
        id: crypto.randomUUID(),
        createdAt: getExtendedDateFormat(),
        me: {
          accountId: account.accountId,
          displayName: parseCustomDisplayName(account),
        },
        type: TaxiServiceNotificationType.PartyMemberJoined,
      } as TaxiServiceNotificationEventPartyMemberJoined

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.TaxiServiceServiceNotifications,
        data,
      )
    })

    accountService.client.on('party:invite', async (invitation) => {
      const data = {
        id: crypto.randomUUID(),
        createdAt: getExtendedDateFormat(),
        me: {
          accountId: account.accountId,
          displayName: parseCustomDisplayName(account),
        },
        friend: {
          accountId: invitation.sender.id,
          displayName: invitation.sender.displayName,
        },
        type: TaxiServiceNotificationType.PartyInvite,
      } as TaxiServiceNotificationEventPartyInvite

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.TaxiServiceServiceNotifications,
        data,
      )

      /**
       * Client can not join if presence is DnD
       */
      const isDnD = accountService.status === AccountPresence.DnD
      /**
       * Client can not join to a team when total maximum members is full
       */
      const maxMembers = invitation.party.members.size >= 4
      /**
       * If client is in a team, decline invitation
       */
      const currentMembers =
        (invitation.client.party?.members.size ?? 1) > 1

      if (isDnD || maxMembers || currentMembers) {
        invitation.decline().catch(() => {})

        return
      }

      /**
       * Client can join if other client still not joined yet
       */
      const accountsId = TaxiService._accounts.map(
        ({ accountId }) => accountId,
      )
      const filteredMembersId = invitation.party.members
        .filter(({ id }) => accountsId.includes(id))
        .map(({ id }) => id)
      const otherClientHasPreviouslyJoined = filteredMembersId.length > 0

      if (otherClientHasPreviouslyJoined) {
        invitation.decline().catch(() => {})

        return
      }

      try {
        /**
         * Client can not join if matchmaking is changing
         */
        const { isPlaying, sessionId } = invitation.sender.presence ?? {}

        if (isPlaying || Boolean(sessionId)) {
          invitation.decline().catch(() => {})

          return
        }
      } catch (error) {
        //
      }

      try {
        accountService.status = AccountPresence.DnD

        await invitation.accept()

        accountService.client.setStatus(defaultStatuses.busy(), 'away')

        await new Promise((resolve) => {
          setTimeout(resolve, 1000)
        })

        TaxiService.updatePatch(accountService)

        accountService.currentTimeout = accountService.client.setTimeout(
          () => {
            try {
              accountService.client.leaveParty().catch(() => {})

              accountService.currentTimeout = null

              accountService.status = AccountPresence.Active
              accountService.client.setStatus(
                defaultStatuses.active(),
                'away',
              )
            } catch (_error) {
              //
            }
          },
          1000 * 60 * 2,
        ) // 2 minutes

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        accountService.status = AccountPresence.Active
        accountService.client.setStatus(defaultStatuses.active(), 'away')

        TaxiService._reJoinTo.set(account.accountId, invitation.sender.id)
        reAuth(error)
      }
    })

    accountService.client.on(
      'party:member:matchstate:updated',
      async (member, value, previousValue) => {
        const previousLocation = `${previousValue?.location}`
        const currentLocation = `${value?.location}`

        if (
          previousLocation === 'Lobby' &&
          currentLocation === 'JoiningGame'
        ) {
          accountService.client.setTimeout(() => {
            member.client.leaveParty().catch(() => {})
            clearCurrentTimeout()

            accountService.status = AccountPresence.Active
            member.client.setStatus(defaultStatuses.active(), 'away')
          }, 1000 * 10) // 10 seconds

          return
        }
      },
    )

    accountService.client.on('friend:added', (friend) => {
      const data = {
        id: crypto.randomUUID(),
        createdAt: getExtendedDateFormat(),
        me: {
          accountId: account.accountId,
          displayName: parseCustomDisplayName(account),
        },
        friend: {
          accountId: friend.id,
          displayName: friend.displayName,
        },
        type: TaxiServiceNotificationType.FriendAdded,
      } as TaxiServiceNotificationEventFriendAdded

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.TaxiServiceServiceNotifications,
        data,
      )
    })

    accountService.client.login()

    TaxiService._services.set(accountService.accountId, accountService)
  }

  static async reload(ids: Array<string>) {
    ids.forEach(async (accountId) => {
      const account = TaxiService.getAccountById(accountId)
      const current = TaxiService.getServiceByAccountId(accountId)

      if (!current || !account) {
        return
      }

      const setNewStatus = (status: AutomationStatusType) => {
        TaxiService.updateAccountData(current.accountId, {
          status,
        })
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.TaxiServiceServiceStartNotification,
          {
            accountId: current.accountId,
            status,
          } as TaxiServiceServiceStatusResponse,
        )
      }

      setNewStatus(AutomationStatusType.LOADING)

      if (
        current.currentTimeout !== null &&
        current.currentTimeout !== undefined
      ) {
        current.client.clearTimeout(current.currentTimeout)
      }

      current.client.removeAllListeners()
      current.client.xmpp.disconnect()
      current.client.logout()

      TaxiService._accounts.delete(accountId)
      TaxiService._services.delete(accountId)

      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })

      const result = await DataDirectory.getTaxiServiceFile()
      const data = {
        accountId,
        actions: {
          high: account.actions.high,
          denyFriendsRequests: account.actions.denyFriendsRequests,
          activeStatus: account.actions.activeStatus,
          busyStatus: account.actions.busyStatus,
        },
      }

      await DataDirectory.updateTaxiServiceFile({
        ...result.taxiService,
        [accountId]: data,
      })
      TaxiService._accounts.set(data.accountId, {
        ...data,
        status: AutomationStatusType.LOADING,
      })
      TaxiService.start(data)
    })
  }

  static getAccountById(
    accountId: string,
  ): TaxiServiceAccountServerData | undefined {
    return TaxiService._accounts.get(accountId)
  }

  static getServices() {
    return TaxiService._services.clone()
  }

  static getServiceByAccountId(accountId: string) {
    return TaxiService._services.find(
      (accountService) => accountService.accountId === accountId,
    )
  }

  private static updatePatch(accountService: AccountService) {
    const isHigh =
      TaxiService._accounts.get(accountService.accountId)?.actions.high ??
      true
    const currentStat = isHigh ? FORTStatsNumber.HIGH : FORTStatsNumber.LOW

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mpLoadoutInfo: any =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (accountService.client.party?.me.meta.schema as any)?.[
        'Default:MpLoadout_j'
      ] ?? {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMetaInfo: Record<string, any> = {
      'Default:AthenaBannerInfo_j': JSON.stringify({
        AthenaBannerInfo: {
          bannerIconId: 'FounderTier4Banner3',
          bannerColorId: 'defaultcolor2',
        },
      }),
      'Default:AthenaCosmeticLoadout_j': JSON.stringify({
        AthenaCosmeticLoadout: {
          characterPrimaryAssetId:
            'AthenaCharacter:Character_SuperNovaTaro',
        },
      }),
    }

    if (mpLoadoutInfo?.MpLoadout?.d !== undefined) {
      newMetaInfo['Default:MpLoadout_j'] = JSON.stringify({
        MpLoadout: {
          d: JSON.stringify({
            ac: {
              i: 'Character_SuperNovaTaro',
              v: [],
            },
          }),
        },
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaInfo: Record<string, any> = {
      'Default:FORTStats_j': JSON.stringify({
        FORTStats: {
          fortitude: currentStat,
          offense: currentStat,
          resistance: currentStat,
          tech: currentStat,
          teamFortitude: 0,
          teamOffense: 0,
          teamResistance: 0,
          teamTech: 0,
          fortitude_Phoenix: currentStat,
          offense_Phoenix: currentStat,
          resistance_Phoenix: currentStat,
          tech_Phoenix: currentStat,
          teamFortitude_Phoenix: 0,
          teamOffense_Phoenix: 0,
          teamResistance_Phoenix: 0,
          teamTech_Phoenix: 0,
        },
      }),
      ...newMetaInfo,
    }

    if (isHigh) {
      metaInfo['Default:CampaignCommanderLoadoutRating_d'] = '999.00'
      metaInfo['Default:CampaignBackpackRating_d'] = '999.000000'
    }

    accountService.client.party?.me?.sendPatch(metaInfo).catch(() => {})
  }

  private static async refreshData(
    accountId: string,
    removeAccount?: boolean,
  ) {
    const automation = TaxiService._accounts
      .filter((account) => account.accountId !== accountId)
      .map((account) => account)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .reduce((accumulator, { status, ...account }) => {
        accumulator[account.accountId] = account

        return accumulator
      }, {} as TaxiServiceAccountFileDataList)

    if (removeAccount) {
      TaxiService._accounts.delete(accountId)
      TaxiService._services.delete(accountId)
    }

    await DataDirectory.updateTaxiServiceFile(automation)

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.TaxiServiceServiceResponseData,
      automation,
      true,
    )
  }

  private static updateAccountData(
    accountId: string,
    data: Partial<{
      actions: Partial<TaxiServiceAccountData['actions']>
      status: Partial<TaxiServiceAccountData['status']>
    }>,
  ) {
    const automationAccount = TaxiService.getAccountById(accountId)

    if (automationAccount) {
      const accountService = TaxiService._services.get(
        automationAccount.accountId,
      )

      const actionsNewValueHigh =
        data.actions?.high ?? automationAccount.actions.high
      const actionsNewValueDenyFriendsRequests =
        data.actions?.denyFriendsRequests ??
        automationAccount.actions.denyFriendsRequests
      const actionsNewValueActiveStatus =
        data.actions?.activeStatus ??
        automationAccount.actions.activeStatus
      const actionsNewValueBusyStatus =
        data.actions?.busyStatus ?? automationAccount.actions.busyStatus

      TaxiService._accounts.set(accountId, {
        accountId,
        actions: {
          high: actionsNewValueHigh,
          denyFriendsRequests: actionsNewValueDenyFriendsRequests,
          activeStatus: actionsNewValueActiveStatus.trim(),
          busyStatus: actionsNewValueBusyStatus.trim(),
        },
        status: data.status ?? automationAccount.status,
      })

      if (accountService) {
        if (automationAccount.actions.high !== actionsNewValueHigh) {
          TaxiService.updatePatch({
            accountId: accountService.accountId,
            client: accountService.client,
            status: accountService.status,
            currentTimeout: accountService.currentTimeout,
          })
        }

        if (
          automationAccount.actions.activeStatus !==
            actionsNewValueActiveStatus &&
          accountService.status === AccountPresence.Active
        ) {
          accountService.client.setStatus(
            actionsNewValueActiveStatus.trim().length > 0
              ? actionsNewValueActiveStatus.trim()
              : 'Libre',
            'away',
          )
        } else if (
          automationAccount.actions.busyStatus !==
            actionsNewValueBusyStatus &&
          accountService.status === AccountPresence.DnD
        ) {
          accountService.client.setStatus(
            actionsNewValueBusyStatus.trim().length > 0
              ? actionsNewValueBusyStatus.trim()
              : 'Ocupado',
            'away',
          )
        }

        if (
          !automationAccount.actions.denyFriendsRequests &&
          actionsNewValueDenyFriendsRequests
        ) {
          const account = AccountsManager.getAccountById(accountId)!

          Authentication.verifyAccessToken(account).then((accessToken) => {
            if (!accessToken) {
              return
            }

            const pendingList =
              accountService.client.friend.pendingList.filter(
                (item) => item.direction === 'INCOMING',
              )

            pendingList.forEach((pending) => {
              removeFriend({
                accessToken,
                accountId: account.accountId,
                friendId: pending.id,
              })
            })
          })
        }
      }
    }
  }
}
