import type { AccountData, AccountDataRecord } from '../../types/accounts'

import { create } from 'zustand'

export type AccountListState = {
  accounts: AccountDataRecord
  selected: string | null

  addOrUpdate: (accountId: string, account: AccountData) => void
  changeSelected: (accountId: string | null) => void
  getSelected: () => AccountData | null
  register: (accounts: AccountDataRecord) => void
}

export const useAccountListStore = create<AccountListState>()(
  (set, get) => ({
    accounts: {},
    selected: null,

    addOrUpdate: (accountId, account) => {
      set((state) => ({
        accounts: {
          ...state.accounts,
          [accountId]: account,
        },
      }))
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
        accounts: {
          ...state.accounts,
          ...accounts,
        },
      }))
    },
  })
)
