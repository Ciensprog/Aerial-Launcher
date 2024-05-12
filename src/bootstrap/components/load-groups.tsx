import type { GroupRecord } from '../../types/groups'

import { useEffect } from 'react'

import { useGroupsStore } from '../../state/settings/groups'
import { useTagsStore } from '../../state/settings/tags'

export function LoadGroups() {
  const tags = useTagsStore((state) => state.tags)
  const registerGroups = useGroupsStore((state) => state.registerGroups)

  useEffect(() => {
    const listener = window.electronAPI.responseGroups(async (groups) => {
      const tagsArray = Object.keys(tags)

      const filteredGroups = Object.entries(groups).reduce(
        (accumulator, [accountId, tags]) => {
          accumulator[accountId] = tags.filter((tagName) =>
            tagsArray.includes(tagName)
          )

          return accumulator
        },
        {} as GroupRecord
      )

      registerGroups(filteredGroups)
    })

    window.electronAPI.requestGroups()

    return () => {
      listener.removeListener()
    }
  }, [tags])

  return null
}
