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
} from '../../types/party'

import { PartyRole } from '../../config/constants/fortnite/party'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { AccountsManager } from '../startup/accounts'
import { Automation } from '../startup/automation'
import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'
import { ClaimRewards } from './claim-rewards'
import { LookupManager } from './lookup'

import { addFriend, getFriend } from '../../services/endpoints/friends'
import {
  removeInvite,
  fetchParty,
  invite,
  kick,
} from '../../services/endpoints/party'

import { localeCompareForSorting } from '../../lib/utils'

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
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(kickNotification, 0)
  }

  static async leaveParty(
    selectedAccounts: AccountDataList,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.PartyInviteActionNotification,
      defaultResponse
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

    return true
  }
}
