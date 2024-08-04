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

import { BrowserWindow } from 'electron'

import { PartyRole } from '../../config/constants/fortnite/party'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

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
    currentWindow: BrowserWindow,
    selectedAccount: AccountData,
    accounts: AccountDataList,
    claimState: boolean
  ) {
    try {
      const accessToken = await Authentication.verifyAccessToken(
        selectedAccount,
        currentWindow
      )

      if (!accessToken) {
        currentWindow.webContents.send(
          ElectronAPIEventKeys.PartyKickActionNotification,
          0
        )

        return
      }

      const result = await fetchParty({
        accessToken,
        accountId: selectedAccount.accountId,
      })
      const party = result.data.current[0]

      if (party) {
        const { members } = party

        const memberListId = members.map(({ account_id }) => account_id)
        // const accountListId = accounts.map(({ accountId }) => accountId)

        const filteredMyAccountsInParty = accounts.filter((account) =>
          memberListId.includes(account.accountId)
        )
        const filteredMyAccountsInPartyIds = filteredMyAccountsInParty.map(
          ({ accountId }) => accountId
        )

        const filteredMyAccounts = members.filter((member) =>
          filteredMyAccountsInPartyIds.includes(member.account_id)
        )
        const leader = filteredMyAccounts.find(
          (member) => member.role === PartyRole.CAPTAIN
        )

        let total = 0

        if (leader) {
          /**
           * As leader, kick out all members
           */

          const accountLeader = filteredMyAccountsInParty.find(
            ({ accountId }) => accountId === leader.account_id
          )!
          const _members = members.filter(
            (member) => member.account_id !== leader.account_id
          )

          await Promise.allSettled(
            _members.map(({ account_id }) =>
              Party.kickMember({
                currentWindow,
                party,
                account: accountLeader,
                accountIdToKick: account_id,
              })
            )
          )

          try {
            await Party.kickMember({
              currentWindow,
              party,
              account: accountLeader,
              accountIdToKick: accountLeader.accountId,
            })
          } catch (error) {
            //
          }

          total += _members.length
          total += 1 // Leader
        } else {
          /**
           * Leave the party for each account within
           */

          await Promise.allSettled(
            filteredMyAccountsInParty.map((account) =>
              Party.kickMember({
                account,
                currentWindow,
                party,
                accountIdToKick: account.accountId,
              })
            )
          )

          total += filteredMyAccountsInParty.length
        }

        if (claimState) {
          ClaimRewards.core(currentWindow, filteredMyAccountsInParty).then(
            (response) => {
              if (response) {
                currentWindow.webContents.send(
                  ElectronAPIEventKeys.ClaimRewardsClientNotification,
                  response
                )
              }
            }
          )
        }

        currentWindow.webContents.send(
          ElectronAPIEventKeys.PartyKickActionNotification,
          total
        )

        return
      }
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.PartyKickActionNotification,
      0
    )
  }

  // static async leaveParty(
  //   currentWindow: BrowserWindow,
  //   selectedAccounts: AccountDataList,

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   _accounts: AccountDataList,

  //   claimState: boolean
  // ) {
  //   await Promise.allSettled(
  //     selectedAccounts.map(async (account) => {
  //       account

  //       const accessToken = await Authentication.verifyAccessToken(
  //         account,
  //         currentWindow
  //       )

  //       if (!accessToken) {
  //         return
  //       }

  //       const result = await fetchParty({
  //         accessToken,
  //         accountId: account.accountId,
  //       })
  //       const party = result.data.current[0]

  //       if (!party) {
  //         return
  //       }

  //       const member = party.members.find(
  //         (member) => account.accountId === member.account_id
  //       )

  //       if (!member) {
  //         return
  //       }

  //       return await Party.kickMember({
  //         party,
  //         // currentWindow,
  //         account: {
  //           ...account,
  //           accessToken: accessToken,
  //         },
  //         accountIdToKick: account.accountId,
  //       })
  //     })
  //   )

  //   if (claimState) {
  //     ClaimRewards.core(currentWindow, selectedAccounts).then(
  //       (response) => {
  //         if (response) {
  //           currentWindow.webContents.send(
  //             ElectronAPIEventKeys.ClaimRewardsClientNotification,
  //             response
  //           )
  //         }
  //       }
  //     )
  //   }

  //   currentWindow.webContents.send(
  //     ElectronAPIEventKeys.PartyLeaveActionNotification,
  //     selectedAccounts.length
  //   )
  // }

  /**
   * With optimization (avoid party re-fetching)
   */
  static async leaveParty(
    currentWindow: BrowserWindow,
    selectedAccounts: AccountDataList,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accounts: AccountDataList,

    claimState: boolean
  ) {
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
        const accessToken = await Authentication.verifyAccessToken(
          account,
          currentWindow
        )

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

    await Promise.allSettled(
      parsedAccounts.map(async ({ account, party }) => {
        return await Party.kickMember(
          {
            account,
            currentWindow,
            party,
            accountIdToKick: account.accountId,
          },
          true
        )
      })
    )

    if (claimState) {
      ClaimRewards.core(currentWindow, selectedAccounts).then(
        (response) => {
          if (response) {
            currentWindow.webContents.send(
              ElectronAPIEventKeys.ClaimRewardsClientNotification,
              response
            )
          }
        }
      )
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.PartyLeaveActionNotification,
      selectedAccounts.length
    )
  }

  static async loadFriends(currentWindow: BrowserWindow) {
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

      currentWindow.webContents.send(
        ElectronAPIEventKeys.PartyLoadFriendsNotification,
        orderedData
      )
    } catch (error) {
      //
    }
  }

  static async addNewFriend(
    currentWindow: BrowserWindow,
    account: AccountData,
    displayName: string
  ) {
    const defaultResponse: AddNewFriendNotification = {
      displayName,
      data: null,
      errorMessage: null,
      success: false,
    }
    const sendResponse = () => {
      currentWindow.webContents.send(
        ElectronAPIEventKeys.PartyAddNewFriendActionNotification,
        defaultResponse
      )
    }

    try {
      const response = await LookupManager.searchUserByDisplayName({
        account,
        currentWindow,
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
        await Party.loadFriends(currentWindow)

        currentWindow.webContents.send(
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

  static async invite(
    currentWindow: BrowserWindow,
    account: AccountData,
    accountIds: Array<string>
  ) {
    const defaultResponse: Array<InviteNotification> = []

    try {
      const accessToken = await Authentication.verifyAccessToken(
        account,
        currentWindow
      )

      if (!accessToken) {
        currentWindow.webContents.send(
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
              //   currentWindow
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
                    await Authentication.verifyAccessToken(
                      account,
                      currentWindow
                    )

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
                const accessToken = await Authentication.verifyAccessToken(
                  account,
                  currentWindow
                )

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
          await Party.loadFriends(currentWindow)
        }
      }
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.PartyInviteActionNotification,
      defaultResponse
    )
  }

  static async removeFriend(
    currentWindow: BrowserWindow,
    data: {
      accountId: string
      displayName: string
    }
  ) {
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
      await Party.loadFriends(currentWindow)

      status = true
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
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
      currentWindow,
      party,
    }: {
      account: AccountData
      accountIdToKick: string
      currentWindow: BrowserWindow
      party: PartyData
    },
    generateNewAccessToken?: boolean
  ) {
    let newAccessToken: string | null = null

    if (generateNewAccessToken) {
      try {
        newAccessToken = await Authentication.verifyAccessToken(
          account,
          currentWindow
        )

        // if (!newAccessToken) {
        //   return false
        // }
      } catch (error) {
        //
      }

      // if (!newAccessToken) {
      //   return false
      // }
    }

    return await kick({
      partyId: party.id,
      accessToken: (generateNewAccessToken
        ? newAccessToken ?? account.accessToken
        : account.accessToken) as string,
      accountId: accountIdToKick,
    })
  }
}
