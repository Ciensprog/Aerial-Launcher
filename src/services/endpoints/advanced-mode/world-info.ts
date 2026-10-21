import { randomUUID } from 'node:crypto'

import type { WorldInfoData } from '../../../types/services/advanced-mode/world-info'

import { baseGameService } from '../../config/base-game'

export function getWorldInfoData({
  accessToken,
}: {
  accessToken: string
}) {
  return baseGameService.get<WorldInfoData>('/world/info', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-EpicGames-Language': 'en',
      'X-Epic-Correlation-ID': `FN-${randomUUID().replace(/-/g, '').slice(0, 22)}`,
      'X-Epic-Debug-ID': randomUUID().toUpperCase(),
    },
  })
}
