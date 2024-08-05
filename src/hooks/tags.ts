import { useMemo } from 'react'

import { BulkTags, getBulkTags } from '../config/constants/tags'

import { useTagsStore } from '../state/settings/tags'

export function useGetTags() {
  const tagList = useTagsStore((state) => state.tags)
  const bulkTags = getBulkTags()

  const { newTagsArray } = useMemo(() => {
    const tagsArray = Object.entries(tagList)
    const tagNameRawArray = tagsArray.map(([tagName]) => tagName)
    const tagNameArray = tagsArray.map(([tagName]) =>
      tagName.trim().toLowerCase()
    )
    const newTagsArray = tagsArray.filter(([tagName]) => {
      const newTagName = tagName.trim().toLowerCase() as BulkTags

      return !bulkTags.includes(newTagName)
    })
    const items = [BulkTags.BULK, BulkTags.ALL_ACCOUNTS, BulkTags.ALL]

    items.forEach((item) => {
      if (tagNameArray.includes(item)) {
        const value = tagNameRawArray.at(
          tagNameArray.findIndex((tagName) => tagName === item)
        )

        if (value) {
          newTagsArray.unshift([value, null])
        }
      }
    })

    return {
      newTagsArray,
    }
  }, [tagList])

  return {
    tagList,
    tagsArray: newTagsArray,
  }
}
