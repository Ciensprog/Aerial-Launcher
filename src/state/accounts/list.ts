import type { AccountData, AccountDataRecord } from '../../types/accounts'

import { create } from 'zustand'

import { sortAccounts } from '../../lib/utils'

export type AccountListState = {
  accounts: AccountDataRecord
  selected: string | null

  addOrUpdate: (accountId: string, account: AccountData) => void
  changeSelected: (accountId: string | null) => void
  getSelected: () => AccountData | null
  register: (accounts: AccountDataRecord) => void
  remove: (accountId: string) => AccountDataRecord
}

export const useAccountListStore = create<AccountListState>()(
  (set, get) => ({
    accounts: {},
    selected: null,

    addOrUpdate: (accountId, account) => {
      const accounts = get().accounts
      const current = accounts[accountId]

      if (current !== undefined) {
        set({
          accounts: sortAccounts({
            ...accounts,
            [accountId]: account,
          }),
        })
      }
    },
    changeSelected: (accountId) => {
      if (accountId === null) {
        return set(() => ({
          selected: null,
        }))
      }

      const current = get().accounts[accountId] as AccountData | undefined

      set(() => ({
        selected: current?.accountId ?? null,
      }))
    },
    getSelected: () => {
      const selected = get().selected
      const accounts = Object.values(get().accounts)
      const current = accounts.find(
        ({ accountId }) => accountId === selected
      )

      return current ?? null
    },
    register: (accounts) => {
      set((state) => ({
        accounts: sortAccounts({
          ...state.accounts,
          ...accounts,
        }),
      }))
    },
    remove: (accountId) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [accountId]: _current, ...accounts } = get().accounts
      const newSelected = Object.values(accounts)[0] as
        | AccountData
        | undefined

      set({
        selected: newSelected?.accountId ?? null,
        accounts,
      })

      return accounts
    },
  })
)
