import type { TagRecord } from '../../types/tags'

import { create } from 'zustand'

import { sortTags } from '../../lib/utils'

export type TagsState = {
  tags: TagRecord
  updateTags: (tags: TagRecord, overwrite?: boolean) => void
}

export const useTagsStore = create<TagsState>()((set) => ({
  tags: {},

  updateTags: (tags, overwrite) =>
    set((state) => ({
      tags: sortTags(
        overwrite
          ? tags
          : {
              ...state.tags,
              ...tags,
            }
      ),
    })),
}))
