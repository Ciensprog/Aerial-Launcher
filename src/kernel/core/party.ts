import type { PartyData } from '../../types/services/party'
import type { AccountData, AccountList } from '../../types/accounts'

import { BrowserWindow } from 'electron'

import { PartyRole } from '../../config/constants/fortnite/party'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

// import { DataDirectory } from '../startup/data-directory'

import { Authentication } from './authentication'

import { fetchParty, kick } from '../../services/endpoints/party'

export class Party {
  static async kickPartyMembers(
    currentWindow: BrowserWindow,
    selectedAccount: AccountData,
    accounts: AccountList
  ) {
    try {
      const accessToken =
        await Authentication.verifyAccessToken(selectedAccount)

      if (!accessToken) {
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
                party,
                account: accountLeader,
                accountIdToKick: account_id,
              })
            )
          )

          try {
            await Party.kickMember({
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
                party,
                accountIdToKick: account.accountId,
              })
            )
          )

          total += filteredMyAccountsInParty.length
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

  static async leaveParty(
    currentWindow: BrowserWindow,
    selectedAccounts: AccountList,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accounts: AccountList
  ) {
    await Promise.allSettled(
      selectedAccounts.map(async (account) => {
        const accessToken = await Authentication.verifyAccessToken(account)

        if (!accessToken) {
          return
        }

        const result = await fetchParty({
          accessToken,
          accountId: account.accountId,
        })
        const party = result.data.current[0]

        if (!party) {
          return
        }

        const member = party.members.find(
          (member) => account.accountId === member.account_id
        )

        if (!member) {
          return
        }

        if (party.meta['Default:PartyState_s'] !== 'PostMatchmaking') {
          return
        }

        return await Party.kickMember({
          party,
          account: {
            ...account,
            token: accessToken,
          },
          accountIdToKick: account.accountId,
        })
      })
    )

    currentWindow.webContents.send(
      ElectronAPIEventKeys.PartyLeaveActionNotification,
      selectedAccounts.length
    )
  }

  /**
   * With optimization (avoid party re-fetching)
   */
  // static async leaveParty(
  //   currentWindow: BrowserWindow,
  //   selectedAccounts: AccountList,

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   _accounts: AccountList
  // ) {
  //   const tmpParties: Record<
  //     string,
  //     {
  //       party: PartyData
  //       members: Array<string>
  //     }
  //   > = {}
  //   const selectedAccountsIds = selectedAccounts.map(
  //     ({ accountId }) => accountId
  //   )

  //   for (const account of selectedAccounts) {
  //     try {
  //       const accessToken = await Authentication.verifyAccessToken(account)

  //       if (!accessToken) {
  //         continue
  //       }

  //       const fetchAndSaveNewPartyInCache = async () => {
  //         const result = await fetchParty({
  //           accessToken,
  //           accountId: account.accountId,
  //         })

  //         const party = result.data.current[0]

  //         if (party) {
  //           tmpParties[party.id] = {
  //             party,
  //             members: party.members
  //               .filter(({ account_id }) =>
  //                 selectedAccountsIds.includes(account_id)
  //               )
  //               .map(({ account_id }) => account_id),
  //           }
  //         }
  //       }

  //       if (Object.keys(tmpParties).length > 0) {
  //         // Get it from cache

  //         const findParty = Object.entries(tmpParties).find(
  //           ([, tmpParty]) => tmpParty.members.includes(account.accountId)
  //         )

  //         if (!findParty) {
  //           await fetchAndSaveNewPartyInCache()
  //         }
  //       } else {
  //         // Save new party in cache

  //         await fetchAndSaveNewPartyInCache()
  //       }
  //     } catch (error) {
  //       //
  //     }
  //   }

  //   const parsedAccounts = Object.values(tmpParties).reduce(
  //     (accumulator, current) => {
  //       const tmpValues = [...accumulator]

  //       current.members.forEach((memberId) => {
  //         const currentAccount = selectedAccounts.find(
  //           ({ accountId }) => memberId === accountId
  //         )

  //         if (currentAccount) {
  //           tmpValues.push({
  //             account: currentAccount,
  //             party: current.party,
  //           })
  //         }
  //       })

  //       return tmpValues
  //     },
  //     [] as Array<{
  //       account: AccountBasicInfo
  //       party: PartyData
  //     }>
  //   )

  //   await Promise.allSettled(
  //     parsedAccounts.map(async ({ account, party }) => {
  //       return await Party.kickMember({
  //         account,
  //         party,
  //         accountIdToKick: account.accountId,
  //       })
  //     })
  //   )

  //   currentWindow.webContents.send(
  //     ElectronAPIEventKeys.PartyLeaveActionNotification,
  //     selectedAccounts.length
  //   )
  // }

  private static async kickMember({
    account,
    accountIdToKick,
    party,
  }: {
    account: AccountData
    accountIdToKick: string
    party: PartyData
  }) {
    let newAccessToken: string | null = null

    try {
      newAccessToken = await Authentication.verifyAccessToken(account)

      if (!newAccessToken) {
        return false
      }
    } catch (error) {
      //
    }

    if (!newAccessToken) {
      return false
    }

    return await kick({
      partyId: party.id,
      accessToken: newAccessToken,
      accountId: accountIdToKick,
    })
  }
}
