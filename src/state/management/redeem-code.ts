import { create } from 'zustand'

export type RedeemCodesState = {
  accounts: Array<string>
  isLoading: boolean
  tags: Array<string>

  updateAccounts: (accountIds: Array<string>) => void
  updateLoading: (state: boolean) => void
  updateTags: (tags: Array<string>) => void
}

export const useRedeemCodesStore = create<RedeemCodesState>()((set) => ({
  accounts: [],
  isLoading: false,
  tags: [],

  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateLoading: (state) => set({ isLoading: state }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
}))
