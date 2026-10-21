import type { PartyData } from '../../types/services/party'
import type {
  AccountBasicInfo,
  AccountData,
  AccountDataList,
} from '../../types/accounts'
import type { FriendRecord } from '../../types/friends'
import type {
  AddNewFriendNotification,
  InviteNotification,
  PartyIncomingFriendRequest,
  PartyPlayerExternalAuth,
  PartyPlayerFriendship,
  PartyPlayerMutualFriend,
  PartyPlayerLookupResponse,
  PartyStatusAccountData,
  PartyStatusAction,
  PartyStatusActionResponse,
  PartyStatusMember,
} from '../../types/party'

import { PartyRole } from '../../config/constants/fortnite/party'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { AccountsManager } from '../startup/accounts'
import { Automation } from '../startup/automation'
import { DataDirectory } from '../startup/data-directory'
import { MCPStorageTransfer } from './mcp/storage-transfer'
import { Authentication } from './authentication'
import { ClaimRewards } from './claim-rewards'
import { LookupManager } from './lookup'

import {
  addFriend,
  getFriend,
  getFriendsSummary,
} from '../../services/endpoints/friends'
import { findUsersByAccountIds } from '../../services/endpoints/lookup'
import { getLastOnline } from '../../services/endpoints/presence'
import {
  removeInvite,
  fetchParty,
  invite,
  kick,
  promote,
} from '../../services/endpoints/party'

import {
  localeCompareForSorting,
  parseCustomDisplayName,
} from '../../lib/utils'

export class Party {
  static async kickPartyMembers(
    selectedAccount: AccountData,
    accounts: AccountDataList,
    claimState: boolean,
    config?: Partial<{
      force: boolean
      useGlobalNotification: boolean
    }>
  ) {
    const kickNotification = config?.useGlobalNotification
      ? ElectronAPIEventKeys.PartyKickActionGlobalNotification
      : ElectronAPIEventKeys.PartyKickActionNotification

    try {
      const accessToken =
        await Authentication.verifyAccessToken(selectedAccount)

      if (!accessToken) {
        MainWindow.instance.webContents.send(kickNotification, 0)

        return
      }

      const result = await fetchParty({
        accessToken,
        accountId: selectedAccount.accountId,
      })
      const party = result.data.current[0]

      if (party) {
        const members = party.members

        const memberListId = members.map(({ account_id }) => account_id)
        // const accountListId = accounts.map(({ accountId }) => accountId)

        const filteredMyAccountsInParty = accounts.filter((account) =>
          memberListId.includes(account.accountId)
        )
        const filteredMyAccountIdsInParty = filteredMyAccountsInParty.map(
          ({ accountId }) => accountId
        )

        const filteredMyAccounts = members.filter((member) =>
          filteredMyAccountIdsInParty.includes(member.account_id)
        )
        const leader = filteredMyAccounts.find(
          (member) => member.role === PartyRole.CAPTAIN
        )

        let total = 0

        const membersWithAutoKick = memberListId.filter((accountId) => {
          const automationAccount = Automation.getAccountById(accountId)

          if (automationAccount) {
            return automationAccount.actions.kick
          }

          return false
        })
        const membersWithAutoClaim = memberListId.filter((accountId) => {
          const automationAccount = Automation.getAccountById(accountId)

          if (automationAccount) {
            return automationAccount.actions.claim
          }

          return false
        })

        if (leader) {
          /**
           * As leader, kick out all members
           */

          const accountLeader = filteredMyAccountsInParty.find(
            ({ accountId }) => accountId === leader.account_id
          )!
          const _members = config?.force
            ? members.filter(
                (member) => member.account_id !== leader.account_id
              )
            : members.filter(
                (member) =>
                  member.account_id !== selectedAccount.accountId &&
                  !membersWithAutoKick.includes(member.account_id)
              )
          const newAccountLeader = config?.force
            ? accountLeader
            : selectedAccount

          const kickStatuses = await Promise.allSettled(
            _members.map(({ account_id }) =>
              Party.kickMember({
                party,
                account: accountLeader,
                accountIdToKick: account_id,
              })
            )
          )

          kickStatuses.forEach((item) => {
            if (item.status === 'fulfilled' && item.value === true) {
              total += 1
            }
          })

          try {
            /**
             * Leader
             */

            const kickStatus = await Party.kickMember({
              party,
              account: newAccountLeader,
              accountIdToKick: newAccountLeader.accountId,
            })

            if (kickStatus) {
              total += 1
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            //
          }
        } else {
          /**
           * Leave the party for each account within
           */

          const filteredMyAccountsInPartyToKick = config?.force
            ? filteredMyAccountsInParty
            : filteredMyAccountsInParty.filter(
                (account) =>
                  selectedAccount.accountId === account.accountId ||
                  !membersWithAutoKick.includes(account.accountId)
              )

          const kickStatuses = await Promise.allSettled(
            filteredMyAccountsInPartyToKick.map((account) =>
              Party.kickMember({
                account,
                party,
                accountIdToKick: account.accountId,
              })
            )
          )

          kickStatuses.forEach((item) => {
            if (item.status === 'fulfilled' && item.value === true) {
              total += 1
            }
          })
        }

        if (claimState) {
          const filteredMyAccountsInPartyToClaimRewards = config?.force
            ? filteredMyAccountsInParty
            : filteredMyAccountsInParty.filter(
                (account) =>
                  selectedAccount.accountId === account.accountId ||
                  !membersWithAutoClaim.includes(account.accountId)
              )

          ClaimRewards.core(filteredMyAccountsInPartyToClaimRewards).then(
            (response) => {
              if (response) {
                MainWindow.instance.webContents.send(
                  config?.useGlobalNotification
                    ? ElectronAPIEventKeys.ClaimRewardsClientGlobalSyncNotification
                    : ElectronAPIEventKeys.ClaimRewardsClientNotification,
                  response
                )
              }
            }
          )
        }

        MainWindow.instance.webContents.send(kickNotification, total)

        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(kickNotification, 0)
  }

  static async claimPartyMembers(
    selectedAccount: AccountData,
    accounts: AccountDataList,
    config?: Partial<{
      useGlobalNotification: boolean
    }>
  ) {
    try {
      const accessToken =
        await Authentication.verifyAccessToken(selectedAccount)

      if (!accessToken) {
        await ClaimRewards.start(
          [selectedAccount],
          config?.useGlobalNotification
        )

        return
      }

      const result = await fetchParty({
        accessToken,
        accountId: selectedAccount.accountId,
      })
      const party = result.data.current[0]

      if (!party) {
        await ClaimRewards.start(
          [selectedAccount],
          config?.useGlobalNotification
        )

        return
      }

      const memberListId = party.members.map(
        ({ account_id }) => account_id
      )
      const inParty = accounts.filter((account) =>
        memberListId.includes(account.accountId)
      )

      await ClaimRewards.start(
        inParty.length > 0 ? inParty : [selectedAccount],
        config?.useGlobalNotification
      )
    } catch {
      await ClaimRewards.start(
        [selectedAccount],
        config?.useGlobalNotification
      )
    }
  }

  static async leaveParty(
    selectedAccounts: AccountDataList,
    _accounts: AccountDataList,
    claimState: boolean
  ) {
    let total = 0

    const tmpParties: Record<
      string,
      {
        party: PartyData
        members: Array<string>
      }
    > = {}
    const selectedAccountsIds = selectedAccounts.map(
      ({ accountId }) => accountId
    )

    for (const account of selectedAccounts) {
      try {
        const accessToken = await Authentication.verifyAccessToken(account)

        if (!accessToken) {
          continue
        }

        const fetchAndSaveNewPartyInCache = async () => {
          const result = await fetchParty({
            accessToken,
            accountId: account.accountId,
          })

          const party = result.data.current[0]

          if (party) {
            tmpParties[party.id] = {
              party,
              members: party.members
                .filter(({ account_id }) =>
                  selectedAccountsIds.includes(account_id)
                )
                .map(({ account_id }) => account_id),
            }
          }
        }

        if (Object.keys(tmpParties).length > 0) {
          // Get it from cache

          const findParty = Object.entries(tmpParties).find(
            ([, tmpParty]) => tmpParty.members.includes(account.accountId)
          )

          if (!findParty) {
            await fetchAndSaveNewPartyInCache()
          }
        } else {
          // Save new party in cache

          await fetchAndSaveNewPartyInCache()
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //
      }
    }

    const parsedAccounts = Object.values(tmpParties).reduce(
      (accumulator, current) => {
        const tmpValues = [...accumulator]

        current.members.forEach((memberId) => {
          const currentAccount = selectedAccounts.find(
            ({ accountId }) => memberId === accountId
          )

          if (currentAccount) {
            tmpValues.push({
              account: currentAccount,
              party: current.party,
            })
          }
        })

        return tmpValues
      },
      [] as Array<{
        account: AccountBasicInfo
        party: PartyData
      }>
    )

    const kickStatuses = await Promise.allSettled(
      parsedAccounts.map(async ({ account, party }) => {
        return await Party.kickMember(
          {
            account,
            party,
            accountIdToKick: account.accountId,
          },
          true
        )
      })
    )

    kickStatuses.forEach((item) => {
      if (item.status === 'fulfilled' && item.value === true) {
        total += 1
      }
    })

    if (claimState) {
      ClaimRewards.core(selectedAccounts).then((response) => {
        if (response) {
          MainWindow.instance.webContents.send(
            ElectronAPIEventKeys.ClaimRewardsClientNotification,
            response
          )
        }
      })
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartyLeaveActionNotification,
      total
    )
  }

  static async requestStatus(accounts: Array<AccountData>) {
    try {
      const responses = await Promise.allSettled(
        accounts.map((account) => Party.buildStatus(account))
      )
      const data = responses
        .filter(
          (response): response is PromiseFulfilledResult<PartyStatusAccountData> =>
            response.status === 'fulfilled'
        )
        .map((response) => response.value)

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.PartyStatusNotification,
        data
      )

      return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartyStatusNotification,
      []
    )
  }

  static async kickStatusMember(
    account: AccountData,
    memberAccountId: string
  ) {
    await Party.runStatusAction(
      account,
      'kick',
      memberAccountId,
      async (accessToken, party) => {
        const you = party.members.find(
          (member) => member.account_id === account.accountId
        )

        if (you?.role !== PartyRole.CAPTAIN) {
          throw new Error('Need party leader')
        }

        if (memberAccountId === account.accountId) {
          throw new Error('Need party leader')
        }

        await kick({
          accessToken,
          accountId: memberAccountId,
          partyId: party.id,
        })
      }
    )
  }

  static async promoteStatusMember(
    account: AccountData,
    memberAccountId: string
  ) {
    await Party.runStatusAction(
      account,
      'promote',
      memberAccountId,
      async (accessToken, party) => {
        const you = party.members.find(
          (member) => member.account_id === account.accountId
        )

        if (you?.role !== PartyRole.CAPTAIN) {
          throw new Error('Need party leader')
        }

        if (memberAccountId === account.accountId) {
          throw new Error('Need party leader')
        }

        await promote({
          accessToken,
          accountId: memberAccountId,
          partyId: party.id,
        })
      }
    )
  }

  static async leaveStatus(account: AccountData) {
    await Party.runStatusAction(
      account,
      'leave',
      account.accountId,
      async (accessToken, party) => {
        await kick({
          accessToken,
          accountId: account.accountId,
          partyId: party.id,
        })
      }
    )
  }

  private static emptyStatus(
    accountId: string,
    extra?: Partial<PartyStatusAccountData>
  ): PartyStatusAccountData {
    return {
      accountId,
      available: true,
      inParty: false,
      isLeader: false,
      partyId: null,
      memberCount: 0,
      maxSize: 0,
      members: [],
      ...extra,
    }
  }

  private static async buildStatus(
    account: AccountData
  ): Promise<PartyStatusAccountData> {
    const result = Party.emptyStatus(account.accountId)

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.available = false
        result.errorMessage = 'Unknown Error'

        return result
      }

      const response = await fetchParty({
        accessToken,
        accountId: account.accountId,
      })
      const party = response.data.current[0]

      if (!party) {
        return result
      }

      const names = await resolvePartyMemberNames(accessToken, party.members)
      const you = party.members.find(
        (member) => member.account_id === account.accountId
      )

      result.inParty = true
      result.partyId = party.id
      result.isLeader = you?.role === PartyRole.CAPTAIN
      result.memberCount = party.members.length
      result.maxSize = party.config?.max_size ?? 16
      result.members = party.members
        .map((member): PartyStatusMember => ({
          accountId: member.account_id,
          displayName:
            names.get(member.account_id) ?? member.account_id.slice(0, 8),
          role:
            member.role === PartyRole.CAPTAIN
              ? 'CAPTAIN'
              : 'MEMBER',
          isYou: member.account_id === account.accountId,
        }))
        .toSorted((itemA, itemB) => {
          if (itemA.role === 'CAPTAIN' && itemB.role !== 'CAPTAIN') {
            return -1
          }

          if (itemB.role === 'CAPTAIN' && itemA.role !== 'CAPTAIN') {
            return 1
          }

          if (itemA.isYou !== itemB.isYou) {
            return itemA.isYou ? -1 : 1
          }

          return localeCompareForSorting(itemA.displayName, itemB.displayName)
        })

      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      result.available = false
      result.errorMessage =
        error?.response?.data?.errorMessage ?? 'Unknown Error'
    }

    return result
  }

  private static async runStatusAction(
    account: AccountData,
    action: PartyStatusAction,
    memberAccountId: string | null,
    run: (accessToken: string, party: PartyData) => Promise<void>
  ) {
    const send = (payload: PartyStatusActionResponse) => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.PartyStatusActionNotification,
        payload
      )
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        send({
          accountId: account.accountId,
          success: false,
          action,
          errorMessage: 'Unknown Error',
        })

        return
      }

      const result = await fetchParty({
        accessToken,
        accountId: account.accountId,
      })
      const party = result.data.current[0]

      if (!party) {
        send({
          accountId: account.accountId,
          success: false,
          action,
          errorMessage: 'Unknown Error',
          data: Party.emptyStatus(account.accountId),
        })

        return
      }

      const names = await resolvePartyMemberNames(
        accessToken,
        party.members
      )
      const memberName =
        memberAccountId === null
          ? undefined
          : names.get(memberAccountId) ?? memberAccountId.slice(0, 8)

      await run(accessToken, party)

      const data = await Party.buildStatus(account)

      send({
        accountId: account.accountId,
        success: true,
        action,
        memberName,
        data,
      })

      return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let data: PartyStatusAccountData | undefined

      try {
        data = await Party.buildStatus(account)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (statusError) {
        //
      }

      send({
        accountId: account.accountId,
        success: false,
        action,
        errorMessage:
          error?.response?.data?.errorMessage ??
          error?.message ??
          'Unknown Error',
        data,
      })
    }
  }

  static async loadFriends() {
    try {
      const fileJson = await DataDirectory.getFriendsFile()
      const orderedData = Object.entries(fileJson.friends)
        .toSorted(([, itemA], [, itemB]) =>
          localeCompareForSorting(itemA.displayName, itemB.displayName)
        )
        .reduce((accumulator, [accountId, data]) => {
          accumulator[accountId] = data

          return accumulator
        }, {} as FriendRecord)

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.PartyLoadFriendsNotification,
        orderedData
      )

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }

  static async addNewFriend(account: AccountData, displayName: string) {
    const defaultResponse: AddNewFriendNotification = {
      displayName,
      data: null,
      errorMessage: null,
      success: false,
    }
    const sendResponse = () => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.PartyAddNewFriendActionNotification,
        defaultResponse
      )
    }

    try {
      const response = await LookupManager.searchUserByDisplayName({
        account,
        displayName,
      })

      if (response.success) {
        const fileJson = await DataDirectory.getFriendsFile()
        const newData: FriendRecord = {
          ...fileJson.friends,
          [response.data.id]: {
            accountId: response.data.id,
            displayName: response.data.displayName,
            invitations: 0,
          },
        }
        const orderedData = Object.entries(newData)
          .toSorted(([, itemA], [, itemB]) =>
            localeCompareForSorting(itemA.displayName, itemB.displayName)
          )
          .reduce((accumulator, [accountId, data]) => {
            accumulator[accountId] = data

            return accumulator
          }, {} as FriendRecord)

        await DataDirectory.updateFriendsFile(orderedData)
        await Party.loadFriends()

        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.PartyAddNewFriendActionNotification,
          {
            data: {
              accountId: response.data.id,
              displayName: response.data.displayName,
            },
            displayName: response.data.displayName,
            errorMessage: null,
            success: true,
          } as AddNewFriendNotification
        )

        return
      } else {
        defaultResponse.errorMessage = response.errorMessage
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    sendResponse()
  }

  static async invite(account: AccountData, accountIds: Array<string>) {
    const defaultResponse: Array<InviteNotification> = []

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.PartyInviteActionNotification,
          defaultResponse
        )

        return
      }

      const partyResponse = await fetchParty({
        accessToken,
        accountId: account.accountId,
      })
      const party = partyResponse.data.current[0]

      if (party) {
        const response = await Promise.allSettled(
          accountIds.map(async (accountId) => {
            try {
              // const accessToken = await Authentication.verifyAccessToken(
              //   account,
              // )

              // if (!accessToken) {
              //   return null
              // }

              await getFriend({
                accessToken,
                accountId: account.accountId,
                friendId: accountId,
              })

              try {
                await invite({
                  accessToken,
                  friendAccountId: accountId,
                  partyId: party.id,
                })

                return {
                  accountId,
                  type: 'invite',
                } as const

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (error: any) {
                if (
                  error?.response?.data?.errorCode ===
                  'errors.com.epicgames.social.party.invite_already_exists'
                ) {
                  const accessToken =
                    await Authentication.verifyAccessToken(account)

                  if (!accessToken) {
                    return null
                  }

                  try {
                    await removeInvite({
                      accessToken,
                      friendAccountId: accountId,
                      partyId: party.id,
                    })

                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  } catch (error) {
                    //
                  }

                  try {
                    await invite({
                      accessToken,
                      friendAccountId: accountId,
                      partyId: party.id,
                    })

                    return {
                      accountId,
                      type: 'invite',
                    } as const

                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  } catch (error) {
                    //
                  }
                }
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              if (
                error?.response?.data.errorCode ===
                'errors.com.epicgames.friends.friendship_not_found'
              ) {
                const accessToken =
                  await Authentication.verifyAccessToken(account)

                if (!accessToken) {
                  return null
                }

                try {
                  await addFriend({
                    accessToken,
                    accountId: account.accountId,
                    friendId: accountId,
                  })

                  return {
                    accountId,
                    type: 'friend-request',
                  } as const

                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                  //
                }
              }
            }

            return null
          })
        )

        const accountIdsToIncrease: Array<string> = []

        response.forEach((item) => {
          if (item.status === 'fulfilled' && item.value !== null) {
            defaultResponse.push(item.value)

            if (item.value.type === 'invite') {
              accountIdsToIncrease.push(item.value.accountId)
            }
          }
        })

        if (accountIdsToIncrease.length > 0) {
          const data = await DataDirectory.getFriendsFile()

          accountIdsToIncrease.forEach((accountId) => {
            if (data.friends[accountId]) {
              data.friends[accountId].invitations++
            }
          })

          await DataDirectory.updateFriendsFile(data.friends)
          await Party.loadFriends()
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartyInviteActionNotification,
      defaultResponse
    )
  }

  static async lookupPlayer(
    accounts: AccountDataList,
    displayName: string
  ) {
    const sendResponse = (value: PartyPlayerLookupResponse) => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.PartyLookupPlayerActionNotification,
        value
      )
    }

    const defaultResponse: PartyPlayerLookupResponse = {
      data: null,
      errorMessage: null,
      success: false,
    }

    if (accounts.length <= 0 || displayName.trim() === '') {
      sendResponse(defaultResponse)

      return
    }

    try {
      let lookup: Awaited<
        ReturnType<typeof LookupManager.searchUserByDisplayName>
      > | null = null

      for (const account of accounts) {
        lookup = await LookupManager.searchUserByDisplayName({
          account,
          displayName,
        })

        if (lookup.success) {
          break
        }
      }

      if (!lookup?.success) {
        sendResponse({
          data: null,
          errorMessage:
            lookup?.errorMessage === null || lookup?.errorMessage === undefined
              ? null
              : `${lookup.errorMessage}`,
          success: false,
        })

        return
      }

      const targetId = lookup.data.id
      const friendLists: Array<Array<string>> = []
      let presenceAccount: AccountData | null = null

      const friendships = await Promise.all(
        accounts.map(async (account) => {
          const item: PartyPlayerFriendship = {
            accountId: account.accountId,
            displayName: parseCustomDisplayName(account),
            status: 'not-friends',
            created: null,
          }

          try {
            const accessToken =
              await Authentication.verifyAccessToken(account)

            if (!accessToken) {
              return item
            }

            try {
              const summary = await getFriendsSummary({
                accessToken,
                accountId: account.accountId,
              })
              const friends = summary.data.friends ?? []
              const incoming = summary.data.incoming ?? []
              const outgoing = summary.data.outgoing ?? []

              const accepted = friends.find(
                (entry) => entry.accountId === targetId
              )
              const sent = outgoing.find(
                (entry) => entry.accountId === targetId
              )
              const received = incoming.find(
                (entry) => entry.accountId === targetId
              )

              if (accepted) {
                item.status = 'friends'
                item.created = accepted.created ?? null
                friendLists.push(
                  friends
                    .map((entry) => entry.accountId)
                    .filter((accountId) => accountId !== targetId)
                )
                presenceAccount = presenceAccount ?? account
              } else if (received) {
                item.status = 'incoming'
                item.created = received.created ?? null
              } else if (sent) {
                item.status = 'outgoing'
                item.created = sent.created ?? null
              }

              return item
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (summaryError) {
              const friend = await getFriend({
                accessToken,
                accountId: account.accountId,
                friendId: targetId,
              })

              item.status = 'friends'
              item.created = friend.data.created ?? null
              presenceAccount = presenceAccount ?? account

              return item
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            return item
          }
        })
      )

      let lastOnline: string | null = null
      const lastOnlineAccount = presenceAccount ?? accounts[0]

      try {
        if (lastOnlineAccount) {
          const accessToken =
            await Authentication.verifyAccessToken(lastOnlineAccount)

          if (accessToken) {
            const presence = await getLastOnline({
              accessToken,
              accountId: targetId,
            })

            lastOnline = extractLastOnlineTimestamp(presence.data)
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //
      }

      const { mutualFriends, mutualFriendsTotal } = lastOnlineAccount
        ? await resolveMutualFriends({
            account: lastOnlineAccount,
            friendLists,
          })
        : { mutualFriends: [], mutualFriendsTotal: 0 }

      sendResponse({
        data: {
          lookup: {
            id: lookup.data.id,
            displayName: lookup.data.displayName,
            externalAuthType: lookup.data.externalAuthType,
            externalAuths: extractExternalAuths(lookup.data.externalAuths),
          },
          friendships,
          lastOnline,
          mutualFriends,
          mutualFriendsTotal,
        },
        errorMessage: null,
        success: true,
      })

      return

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    sendResponse(defaultResponse)
  }

  static async sendFriendRequests(
    accounts: AccountDataList,
    friendId: string
  ) {
    const defaultResponse: Array<InviteNotification> = []
    const alreadyDoneErrorCodes = new Set([
      'errors.com.epicgames.friends.duplicate_friendship',
      'errors.com.epicgames.friends.friend_request_already_sent',
      'errors.com.epicgames.friends.incoming_friendship_request_exists',
    ])

    try {
      const uniqueAccounts = accounts.filter(
        (account, index, list) =>
          account.accountId !== friendId &&
          list.findIndex((item) => item.accountId === account.accountId) ===
            index
      )

      const response = await Promise.allSettled(
        uniqueAccounts.map(async (account) => {
          const accessToken =
            await Authentication.verifyAccessToken(account)

          if (!accessToken) {
            return null
          }

          try {
            await addFriend({
              accessToken,
              accountId: account.accountId,
              friendId,
            })

            return {
              accountId: account.accountId,
              type: 'friend-request',
            } as const

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            const errorCode = error?.response?.data?.errorCode as
              | string
              | undefined

            if (errorCode && alreadyDoneErrorCodes.has(errorCode)) {
              return {
                accountId: account.accountId,
                type: 'friend-request',
              } as const
            }

            return null
          }
        })
      )

      response.forEach((item) => {
        if (item.status === 'fulfilled' && item.value !== null) {
          defaultResponse.push(item.value)
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartySendFriendRequestActionNotification,
      defaultResponse
    )
  }

  static async listIncomingFriendRequests(accounts: AccountDataList) {
    const uniqueAccounts = accounts.filter(
      (account, index, list) =>
        list.findIndex((item) => item.accountId === account.accountId) ===
        index
    )
    const requests: Array<PartyIncomingFriendRequest> = []
    let lookupToken: string | null = null

    for (const account of uniqueAccounts) {
      try {
        const accessToken = await Authentication.verifyAccessToken(account)

        if (!accessToken) {
          continue
        }

        lookupToken = lookupToken ?? accessToken

        const summary = await getFriendsSummary({
          accessToken,
          accountId: account.accountId,
        })
        const incoming = summary.data.incoming ?? []
        const accountDisplayName = parseCustomDisplayName(account)

        incoming.forEach((entry) => {
          if (!entry.accountId) {
            return
          }

          requests.push({
            accountDisplayName,
            accountId: account.accountId,
            created: entry.created ?? null,
            friendDisplayName: entry.accountId.slice(0, 8),
            friendId: entry.accountId,
          })
        })
      } catch {
        // skip account
      }
    }

    if (lookupToken && requests.length > 0) {
      const names = await lookupAccountNames(
        lookupToken,
        requests.map((item) => item.friendId),
      )

      requests.forEach((item) => {
        const name = names.get(item.friendId)

        if (name) {
          item.friendDisplayName = name
        }
      })
    }

    const accountOrder = new Map(
      uniqueAccounts.map((account, index) => [account.accountId, index]),
    )

    requests.sort((itemA, itemB) => {
      const accountDiff =
        (accountOrder.get(itemA.accountId) ?? 0) -
        (accountOrder.get(itemB.accountId) ?? 0)

      if (accountDiff !== 0) {
        return accountDiff
      }

      return (itemB.created ?? '').localeCompare(itemA.created ?? '')
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartyIncomingFriendRequestsNotification,
      requests,
    )
  }

  static async acceptIncomingFriendRequests(
    items: Array<{ account: AccountData; friendId: string }>,
  ) {
    let total = 0

    const uniqueItems = items.filter(
      (item, index, list) =>
        item.account.accountId !== item.friendId &&
        list.findIndex(
          (entry) =>
            entry.account.accountId === item.account.accountId &&
            entry.friendId === item.friendId,
        ) === index,
    )

    const results = await Promise.allSettled(
      uniqueItems.map(async ({ account, friendId }) => {
        const accessToken = await Authentication.verifyAccessToken(account)

        if (!accessToken) {
          return false
        }

        try {
          await addFriend({
            accessToken,
            accountId: account.accountId,
            friendId,
          })

          return true
        } catch (error: unknown) {
          const errorCode = (
            error as { response?: { data?: { errorCode?: string } } }
          )?.response?.data?.errorCode

          return (
            errorCode ===
              'errors.com.epicgames.friends.duplicate_friendship' ||
            errorCode ===
              'errors.com.epicgames.friends.friend_request_already_sent' ||
            errorCode ===
              'errors.com.epicgames.friends.incoming_friendship_request_exists'
          )
        }
      }),
    )

    results.forEach((item) => {
      if (item.status === 'fulfilled' && item.value) {
        total += 1
      }
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartyAcceptIncomingFriendRequestsNotification,
      total,
    )
  }

  static async removeFriend(data: {
    accountId: string
    displayName: string
  }) {
    let status = false

    try {
      const fileJson = await DataDirectory.getFriendsFile()
      const newList = Object.entries(fileJson.friends).reduce(
        (accumulator, [accountId, current]) => {
          if (data.accountId !== accountId) {
            accumulator[accountId] = current
          }

          return accumulator
        },
        {} as FriendRecord
      )

      await DataDirectory.updateFriendsFile(newList)
      await Party.loadFriends()

      status = true

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartyRemoveFriendActionNotification,
      {
        status,
        displayName: data.displayName,
      }
    )
  }

  private static async kickMember(
    {
      account,
      accountIdToKick,
      party,
    }: {
      account: AccountData
      accountIdToKick: string
      party: PartyData
    },
    generateNewAccessToken = false
  ) {
    const currentAccount = AccountsManager.getAccountById(
      account.accountId
    )

    if (!currentAccount) {
      return false
    }

    const useNewAccessToken =
      !currentAccount.accessToken || generateNewAccessToken
    let newAccessToken: string | null = null

    if (useNewAccessToken) {
      try {
        newAccessToken =
          await Authentication.verifyAccessToken(currentAccount)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //
      }

      if (!newAccessToken) {
        return false
      }
    }

    await kick({
      partyId: party.id,
      accessToken: (useNewAccessToken
        ? newAccessToken ?? currentAccount.accessToken
        : currentAccount.accessToken) as string,
      accountId: accountIdToKick,
    })

    const automationAccount = Automation.getAccountById(accountIdToKick)
    const accountToTransfer = AccountsManager.getAccountById(
      automationAccount?.accountId ?? ''
    )

    if (
      automationAccount &&
      accountToTransfer &&
      automationAccount.actions.transferMats === true
    ) {
      MCPStorageTransfer.buildingMaterials(accountToTransfer).catch(
        () => {}
      )
    }

    return true
  }
}

function extractExternalAuths(
  externalAuths?: Partial<Record<string, { externalDisplayName?: string }>>
): Array<PartyPlayerExternalAuth> {
  if (!externalAuths) {
    return []
  }

  return Object.entries(externalAuths)
    .map(([type, data]) => ({
      type,
      displayName: data?.externalDisplayName?.trim() ?? '',
    }))
    .filter((item) => item.displayName !== '')
}

async function resolveMutualFriends({
  account,
  friendLists,
}: {
  account: AccountData
  friendLists: Array<Array<string>>
}): Promise<{
  mutualFriends: Array<PartyPlayerMutualFriend>
  mutualFriendsTotal: number
}> {
  const empty = {
    mutualFriends: [] as Array<PartyPlayerMutualFriend>,
    mutualFriendsTotal: 0,
  }

  if (friendLists.length < 2) {
    return empty
  }

  const [firstList, ...rest] = friendLists
  const sharedIds = firstList.filter((accountId) =>
    rest.every((list) => list.includes(accountId))
  )

  if (sharedIds.length <= 0) {
    return empty
  }

  try {
    const accessToken = await Authentication.verifyAccessToken(account)

    if (!accessToken) {
      return {
        mutualFriends: [],
        mutualFriendsTotal: sharedIds.length,
      }
    }

    const previewIds = sharedIds.slice(0, 8)
    const response = await findUsersByAccountIds({
      accessToken,
      accountIds: previewIds,
    })
    const names = new Map(
      (response.data ?? []).map((item) => [item.id, item.displayName])
    )

    return {
      mutualFriends: previewIds.map((accountId) => ({
        accountId,
        displayName: names.get(accountId) ?? accountId.slice(0, 8),
      })),
      mutualFriendsTotal: sharedIds.length,
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      mutualFriends: [],
      mutualFriendsTotal: sharedIds.length,
    }
  }
}

const FRIEND_LOOKUP_CHUNK = 50

async function lookupAccountNames(
  accessToken: string,
  accountIds: Array<string>,
) {
  const names = new Map<string, string>()
  const unique = [...new Set(accountIds)].filter(Boolean)

  for (let index = 0; index < unique.length; index += FRIEND_LOOKUP_CHUNK) {
    const chunk = unique.slice(index, index + FRIEND_LOOKUP_CHUNK)

    try {
      const response = await findUsersByAccountIds({
        accessToken,
        accountIds: chunk,
      })
      const rows = Array.isArray(response.data) ? response.data : []

      rows.forEach((row) => {
        if (row?.id && row.displayName) {
          names.set(row.id, row.displayName)
        }
      })
    } catch {
      // keep ids without names
    }
  }

  return names
}

function extractLastOnlineTimestamp(data: unknown): string | null {
  const timestamps: Array<string> = []

  const walk = (value: unknown) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      timestamps.push(value)

      return
    }

    if (value && typeof value === 'object') {
      Object.values(value).forEach(walk)
    }
  }

  walk(data)

  if (timestamps.length <= 0) {
    return null
  }

  return timestamps.toSorted().at(-1) ?? null
}

async function resolvePartyMemberNames(
  accessToken: string,
  members: PartyData['members']
): Promise<Map<string, string>> {
  const names = new Map<string, string>()

  for (const member of members) {
    const fromMeta = partyMemberDisplayName(member)

    if (fromMeta) {
      names.set(member.account_id, fromMeta)
    }

    const local = AccountsManager.getAccountById(member.account_id)

    if (local) {
      names.set(member.account_id, parseCustomDisplayName(local))
    }
  }

  const missing = members
    .map((member) => member.account_id)
    .filter((accountId) => !names.has(accountId))

  if (missing.length > 0) {
    try {
      const response = await findUsersByAccountIds({
        accessToken,
        accountIds: missing,
      })

      for (const item of response.data ?? []) {
        if (item.id && item.displayName) {
          names.set(item.id, item.displayName)
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }
  }

  for (const member of members) {
    if (!names.has(member.account_id)) {
      names.set(member.account_id, member.account_id.slice(0, 8))
    }
  }

  return names
}

function partyMemberDisplayName(
  member: PartyData['members'][number]
): string | null {
  const raw = member.meta?.['urn:epic:member:dn_s']

  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim()
  }

  return null
}
