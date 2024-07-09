import type { WorldInfoData } from '../../../types/services/advanced-mode/world-info'

import { baseGameService } from '../../config/base-game'

export function getWorldInfoData({
  accessToken,
}: {
  accessToken: string
}) {
  return baseGameService.get<WorldInfoData>('/world/info', {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  })
}
