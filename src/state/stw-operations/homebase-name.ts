import { create } from 'zustand'

export type HomebaseNameState = {
  accounts: Array<string>
  tags: Array<string>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
}

export const useHomebaseNameStore = create<HomebaseNameState>()((set) => ({
  accounts: [],
  tags: [],

  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
}))
