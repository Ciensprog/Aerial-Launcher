import type { DailyQuestsAccountData } from '../../types/daily-quests'

import { create } from 'zustand'

export type DailyQuestsState = {
  accounts: Array<string>
  tags: Array<string>
  isLoading: boolean
  rerollingQuest: {
    accountId: string
    questId: string
  } | null
  dailyQuests: Array<DailyQuestsAccountData>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setLoading: (isLoading: boolean) => void
  setRerollingQuest: (
    value: DailyQuestsState['rerollingQuest'],
  ) => void
  setDailyQuests: (value: Array<DailyQuestsAccountData>) => void
  patchAccountQuests: (value: DailyQuestsAccountData) => void
}

export const useDailyQuestsStore = create<DailyQuestsState>()((set) => ({
  accounts: [],
  tags: [],
  isLoading: false,
  rerollingQuest: null,
  dailyQuests: [],

  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setRerollingQuest: (rerollingQuest) => set({ rerollingQuest }),
  setDailyQuests: (dailyQuests) => set({ dailyQuests }),
  patchAccountQuests: (value) =>
    set((state) => ({
      dailyQuests: state.dailyQuests.map((item) =>
        item.accountId === value.accountId ? value : item,
      ),
    })),
}))
