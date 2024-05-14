import { useShallow } from 'zustand/react/shallow'

import { useGroupsStore } from '../state/settings/groups'

export function useGetGroups() {
  const { groupList, registerGroups, updateGroupTags } = useGroupsStore(
    useShallow((state) => ({
      groupList: state.groups,

      registerGroups: state.registerGroups,
      updateGroupTags: state.updateGroupTags,
    }))
  )
  const groupsArray = Object.entries(groupList)

  const getGroupTagsByAccountId = (accountId: string) => {
    return groupList[accountId] ?? []
  }

  return {
    groupsArray,
    groupList,

    getGroupTagsByAccountId,
    registerGroups,
    updateGroupTags,
  }
}
