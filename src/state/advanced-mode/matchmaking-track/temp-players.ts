import type { LookupFindOneByDisplayNameResponse } from '../../../types/services/lookup'

import { create } from 'zustand'

import { localeCompareForSorting } from '../../../lib/utils'

export type MatchmakingRecentlyPlayersState = {
  players: Array<LookupFindOneByDisplayNameResponse>

  updateRecentlyPlayers: (
    value: LookupFindOneByDisplayNameResponse
  ) => void
}

export const useMatchmakingRecentlyPlayersStore =
  create<MatchmakingRecentlyPlayersState>()((set, get) => ({
    players: [],

    updateRecentlyPlayers: (player) => {
      const currentPlayers = get().players
      const excludeIds = currentPlayers.map(({ id }) => id)
      const addNewPlayer = !excludeIds.includes(player.id)

      if (addNewPlayer) {
        set({
          players: [...currentPlayers, player].toSorted((itemA, itemB) =>
            localeCompareForSorting(
              itemA.displayName ??
                itemA.externalAuths?.xbl?.externalDisplayName ??
                itemA.externalAuths?.psn?.externalDisplayName ??
                itemA.id,
              itemB.displayName ??
                itemB.externalAuths?.xbl?.externalDisplayName ??
                itemB.externalAuths?.psn?.externalDisplayName ??
                itemB.id
            )
          ),
        })

        return
      }

      set({
        players: currentPlayers
          .map((current) => ({
            ...current,
            displayName:
              current.id === player.id
                ? player.displayName
                : current.displayName,
          }))
          .toSorted((itemA, itemB) =>
            localeCompareForSorting(
              itemA.displayName ??
                itemA.externalAuths?.xbl?.externalDisplayName ??
                itemA.externalAuths?.psn?.externalDisplayName ??
                itemA.id,
              itemB.displayName ??
                itemB.externalAuths?.xbl?.externalDisplayName ??
                itemB.externalAuths?.psn?.externalDisplayName ??
                itemB.id
            )
          ),
      })
    },
  }))
