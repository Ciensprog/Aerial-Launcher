import { useShallow } from 'zustand/react/shallow'

import { useMatchmakingPathStore } from '../../state/advanced-mode/matchmaking-track/base'
import { useMatchmakingRecentlyPlayersStore } from '../../state/advanced-mode/matchmaking-track/temp-players'

export function useMatchmakingPath() {
  return useMatchmakingPathStore(
    useShallow((state) => ({
      path: state.path,
      setPath: state.setPath,
    }))
  )
}

export function useMatchmakingPlayersPath() {
  return useMatchmakingRecentlyPlayersStore(
    useShallow((state) => ({
      players: state.players,
      updateRecentlyPlayers: state.updateRecentlyPlayers,
    }))
  )
}
