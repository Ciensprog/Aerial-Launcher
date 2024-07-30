import type { MatchmakingTrackResponse } from '../../types/data/advanced-mode/matchmaking'

import { matchmakingService } from '../config/matchmaking'

export function findPlayer({
  accessToken,
  accountId,
}: {
  accessToken: string
  accountId: string
}) {
  return matchmakingService.get<MatchmakingTrackResponse>(
    `/findPlayer/${accountId}`,
    {
      headers: {
        Authorization: `bearer ${accessToken}`,
      },
    }
  )
}
