import type { AlertsDoneCheckAccountData } from '../../types/alerts'

import { create } from 'zustand'

export type AlertsDoneCheckState = {
  accounts: Array<string>
  tags: Array<string>
  selectedAlertIds: Array<string>
  useAllVbucks: boolean
  isLoading: boolean
  results: Array<AlertsDoneCheckAccountData>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setSelectedAlertIds: (ids: Array<string>) => void
  setUseAllVbucks: (value: boolean) => void
  setLoading: (isLoading: boolean) => void
  setResults: (value: Array<AlertsDoneCheckAccountData>) => void
}

export const useAlertsDoneCheckStore = create<AlertsDoneCheckState>()(
  (set) => ({
    accounts: [],
    tags: [],
    selectedAlertIds: [],
    useAllVbucks: true,
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
    setSelectedAlertIds: (selectedAlertIds) =>
      set({
        selectedAlertIds: [...new Set(selectedAlertIds)],
      }),
    setUseAllVbucks: (useAllVbucks) => set({ useAllVbucks }),
    setLoading: (isLoading) => set({ isLoading }),
    setResults: (results) => set({ results }),
  }),
)
