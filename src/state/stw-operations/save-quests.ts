import { create } from 'zustand'

export type SaveQuestsState = {
  accounts: Array<string>
  claimState: boolean
  tags: Array<string>

  changeClaimState: (claimState: boolean) => void
  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
}

export const useSaveQuestsStore = create<SaveQuestsState>()((set) => ({
  accounts: [],
  claimState: false,
  tags: [],

  changeClaimState: (claimState) => set({ claimState }),
  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
}))
