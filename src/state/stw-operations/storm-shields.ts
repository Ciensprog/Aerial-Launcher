import type { StormShieldsAccountData } from '../../types/storm-shields'

import { create } from 'zustand'

export type StormShieldsState = {
  accounts: Array<string>
  tags: Array<string>
  isLoading: boolean
  results: Array<StormShieldsAccountData>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setLoading: (isLoading: boolean) => void
  setResults: (value: Array<StormShieldsAccountData>) => void
}

export const useStormShieldsStore = create<StormShieldsState>()((set) => ({
  accounts: [],
  tags: [],
  isLoading: false,
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
  setResults: (results) => set({ results }),
}))
