import type { PartyStatusAccountData } from '../../types/party'

import { create } from 'zustand'

export type PartyStatusState = {
  accounts: Array<string>
  tags: Array<string>
  isLoading: boolean
  busyAccountId: string | null
  results: Array<PartyStatusAccountData>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setLoading: (isLoading: boolean) => void
  setBusyAccountId: (accountId: string | null) => void
  setResults: (value: Array<PartyStatusAccountData>) => void
  patchResult: (value: PartyStatusAccountData) => void
}

export const usePartyStatusStore = create<PartyStatusState>()((set) => ({
  accounts: [],
  tags: [],
  isLoading: false,
  busyAccountId: null,
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
  setBusyAccountId: (busyAccountId) => set({ busyAccountId }),
  setResults: (results) => set({ results }),
  patchResult: (value) =>
    set((state) => {
      const exists = state.results.some(
        (item) => item.accountId === value.accountId
      )

      if (!exists) {
        return {
          results: [...state.results, value],
        }
      }

      return {
        results: state.results.map((item) =>
          item.accountId === value.accountId ? value : item
        ),
      }
    }),
}))
