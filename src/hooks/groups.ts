import { useShallow } from 'zustand/react/shallow'

import { useGroupsStore } from '../state/settings/groups'

export function useGetGroups() {
  const { groupList, updateGroupTags } = useGroupsStore(
    useShallow((state) => ({
      groupList: state.groups,

      updateGroupTags: state.updateGroupTags,
    }))
  )

  const getGroupTagsByAccountId = (accountId: string) => {
    return groupList[accountId] ?? []
  }

  return {
    groupList,

    getGroupTagsByAccountId,
    updateGroupTags,
  }
}
