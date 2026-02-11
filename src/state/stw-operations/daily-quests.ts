import { create } from 'zustand'

export type DailyQuestsState = {
  accounts: Array<string>
  tags: Array<string>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
}

export const useDailyQuestsStore = create<DailyQuestsState>()((set) => ({
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
