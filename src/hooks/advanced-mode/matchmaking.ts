import { useShallow } from 'zustand/react/shallow'

import { useMatchmakingPathStore } from '../../state/advanced-mode/matchmaking-track/base'

export function useMatchmakingPath() {
  return useMatchmakingPathStore(
    useShallow((state) => ({
      path: state.path,
      setPath: state.setPath,
    }))
  )
}
