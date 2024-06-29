import { create } from 'zustand'

export type UISidebarHistoryState = {
  visibility: boolean

  changeVisibility: (value: boolean) => void
}

export const useUISidebarHistoryStore = create<UISidebarHistoryState>()(
  (set) => ({
    visibility: false,

    changeVisibility: (visibility) => set({ visibility }),
  })
)
