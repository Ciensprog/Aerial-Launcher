import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type UnlockStatus = {
  status: boolean | null
}

export type UnlockStatusState = {
  data: Record<string, UnlockStatus>

  updateUnlockStatus: (
    accounts: Record<string, Partial<UnlockStatus>>
  ) => void
  clearData: () => void
}

export const defaultUnlockStatus = {
  isLoading: false,
  status: null,
}

export const useUnlockStatusStore = create<UnlockStatusState>()(
  immer((set, get) => ({
    data: {},

    updateUnlockStatus: (accounts) => {
      const data = get().data

      set((state) => {
        Object.entries(accounts).forEach(([accountId, value]) => {
          const current = data[accountId] ?? defaultUnlockStatus

          state.data[accountId] = {
            status:
              value.status === null || typeof value.status === 'boolean'
                ? value.status
                : current?.status,
          }
        })
      })
    },
    clearData: () => {
      set((state) => {
        state.data = {}
      })
    },
  }))
)
