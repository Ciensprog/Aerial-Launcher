import type { WorldInfoFileData } from '../../../types/data/advanced-mode/world-info'

import { create } from 'zustand'

export type WorldInfoFilesState = {
  files: Array<WorldInfoFileData>

  setFiles: (value: Array<WorldInfoFileData>) => void
}

export const useWorldInfoFilesStore = create<WorldInfoFilesState>()(
  (set) => ({
    files: [],

    setFiles: (files) => set({ files }),
  })
)
