import type { GroupRecord } from '../../types/groups'

import { create } from 'zustand'

export type GroupsState = {
  groups: GroupRecord

  registerGroups: (groups: GroupRecord) => void
  updateGroupTags: (accountId: string, tags: Array<string>) => void
}

export const useGroupsStore = create<GroupsState>()((set) => ({
  groups: {},

  registerGroups: (groups) => set({ groups }),
  updateGroupTags: (accountId, tags) =>
    set((state) => {
      const data = {
        groups: {
          ...state.groups,
          [accountId]: [...new Set(tags)],
        },
      }

      window.electronAPI.updateGroups(data.groups)

      return data
    }),
}))
