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
        const leader = members.find(
          (member) =>
            member.account_id === selectedAccount.accountId &&
            member.role === PartyRole.CAPTAIN
        )

        let total = 0

        if (leader) {
          /**
           * As leader, kick out all members
           */

          const _members = members.filter(
            (member) => member.account_id !== leader?.account_id
          )

          await Promise.allSettled(
            _members.map(({ account_id }) =>
              Party.kickMember({
                party,
                account: {
                  ...selectedAccount,
                  token: accessToken,
                },
                accountIdToKick: account_id,
              })
            )
          )

          try {
            await Party.kickMember({
              party,
              account: {
                ...selectedAccount,
                token: accessToken,
              },
              accountIdToKick: selectedAccount.accountId,
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

          const filteredMembers = accounts.filter((member) =>
            members.find(
              (myAccount) => member.accountId === myAccount.account_id
            )
          )

          await Promise.allSettled(
            filteredMembers.map((account) =>
              Party.kickMember({
                account,
                party,
                accountIdToKick: account.accountId,
              })
            )
          )

          total += filteredMembers.length
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
