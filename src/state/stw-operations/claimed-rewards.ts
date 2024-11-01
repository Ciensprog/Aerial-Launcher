import type { RewardsNotification } from '../../types/notifications'

import { create } from 'zustand'

export type ClaimedRewardsState = {
  data: Array<RewardsNotification>

  updateData: (value: Array<RewardsNotification>) => void
}

export const useClaimedRewardsStore = create<ClaimedRewardsState>()(
  (set) => ({
    data: [],

    updateData: (data) =>
      set((state) => ({ data: [...state.data, ...data] })),
  })
)
