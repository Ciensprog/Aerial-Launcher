import type { AccountInfoAccountData } from '../../types/account-info'

import { create } from 'zustand'

export type AccountInfoState = {
  accounts: Array<string>
  tags: Array<string>
  isLoading: boolean
  isActing: boolean
  results: Array<AccountInfoAccountData>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setLoading: (isLoading: boolean) => void
  setActing: (isActing: boolean) => void
  setResults: (value: Array<AccountInfoAccountData>) => void
}

export const useAccountInfoStore = create<AccountInfoState>()((set) => ({
  accounts: [],
  tags: [],
  isLoading: false,
  isActing: false,
  results: [],

  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setActing: (isActing) => set({ isActing }),
  setResults: (results) => set({ results }),
}))
