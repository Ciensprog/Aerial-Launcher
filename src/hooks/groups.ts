import { useShallow } from 'zustand/react/shallow'

import { useGroupsStore } from '../state/settings/groups'

export function useGetGroups() {
  const { groupList, updateGroupTags } = useGroupsStore(
    useShallow((state) => ({
      groupList: state.groups,

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
    updateGroupTags,
  }
}
