import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type EULAAccountStatus = {
  correctiveAction: string | null
  isLoading: boolean
  status: boolean | null
  url: string | null
}

export type EULAState = {
  data: Record<string, EULAAccountStatus>

  updateEULAAccountStatus: (
    accounts: Record<string, Partial<EULAAccountStatus>>
  ) => void
}

export const defaultEULAAccountStatus = {
  isLoading: false,
  status: null,
  url: null,
}

export const useEULAStatusStore = create<EULAState>()(
  immer((set, get) => ({
    data: {},

    updateEULAAccountStatus: (accounts) => {
      const data = get().data

      set((state) => {
        Object.entries(accounts).forEach(([accountId, value]) => {
          const current = data[accountId] ?? defaultEULAAccountStatus

          state.data[accountId] = {
            correctiveAction:
              value.correctiveAction ?? current?.correctiveAction,
            isLoading: value.isLoading ?? current?.isLoading,
            status: value.status ?? current?.status,
            url: value.url ?? current?.url,
          }
        })
      })
    },
  }))
)
