import { useTagsStore } from '../state/settings/tags'

export function useGetTags() {
  const tagList = useTagsStore((state) => state.tags)
  const tagsArray = Object.entries(tagList)

  return { tagsArray, tagList }
}
