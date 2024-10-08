import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type VBucksInformationCurrency = {
  platform: string
  quantity: string
}

export type VBucksInformationData = {
  accountId: string
  currency: Record<string, VBucksInformationCurrency>
}

export type VBucksInformationState = {
  accounts: Array<string>
  isLoading: boolean
  data: Record<string, VBucksInformationData>
  tags: Array<string>

  updateAccounts: (accountIds: Array<string>) => void
  updateLoading: (state: boolean) => void
  updateTags: (tags: Array<string>) => void
}

export const useVBucksInformationStore = create<VBucksInformationState>()(
  immer((set) => ({
    accounts: [],
    isLoading: false,
    data: {},
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
)
