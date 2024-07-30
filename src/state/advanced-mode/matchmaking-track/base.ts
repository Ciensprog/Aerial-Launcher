import type { MatchmakingTrackPath } from '../../../types/data/advanced-mode/matchmaking'

import { create } from 'zustand'

export type MatchmakingPathState = {
  path: MatchmakingTrackPath

  setPath: (value: MatchmakingTrackPath) => void
}

export const useMatchmakingPathStore = create<MatchmakingPathState>()(
  (set) => ({
    path: null,

    setPath: (files) => set({ path: files }),
  })
)
