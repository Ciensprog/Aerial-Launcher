import type { AccountExportAccountResult } from '../../types/account-export'

import { create } from 'zustand'

export type AccountExportState = {
  accounts: Array<string>
  tags: Array<string>
  isExporting: boolean
  results: Array<AccountExportAccountResult>
  directory: string | null
  stamp: number

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setExporting: (isExporting: boolean) => void
  setResults: (
    results: Array<AccountExportAccountResult>,
    directory?: string | null,
  ) => void
}

export const useAccountExportStore = create<AccountExportState>()((set) => ({
  accounts: [],
  tags: [],
  isExporting: false,
  results: [],
  directory: null,
  stamp: 0,

  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
  setExporting: (isExporting) => set({ isExporting }),
  setResults: (results, directory) =>
    set({
      results,
      ...(directory !== undefined ? { directory } : {}),
      isExporting: false,
      stamp: Date.now(),
    }),
}))
