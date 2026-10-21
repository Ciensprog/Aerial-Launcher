import type { DqWeaponsAccountData } from '../../types/dq-weapons'

import { create } from 'zustand'

export type DqWeaponsState = {
  accounts: Array<string>
  tags: Array<string>
  isLoading: boolean
  isFavoriting: boolean
  results: Array<DqWeaponsAccountData>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setLoading: (isLoading: boolean) => void
  setFavoriting: (isFavoriting: boolean) => void
  setResults: (value: Array<DqWeaponsAccountData>) => void
}

export const useDqWeaponsStore = create<DqWeaponsState>()((set) => ({
  accounts: [],
  tags: [],
  isLoading: false,
  isFavoriting: false,
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
  setFavoriting: (isFavoriting) => set({ isFavoriting }),
  setResults: (results) => set({ results }),
}))
