import type { WorldInfo } from '../../types/data/advanced-mode/world-info'
import type { WorldInfoData } from '../../types/services/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'

import { worlInfoParser } from './world-info'
import { worldInfoSchema } from '../validations/schemas/world-info'

export function parseWorldInfoFile(raw: unknown): {
  raw: WorldInfoData
  worldInfo: WorldInfo
} {
  const parsed = worldInfoSchema.safeParse(raw)
  const data = (
    parsed.success ? parsed.data : raw
  ) as WorldInfoData
  const { worldInfo } = worlInfoParser(data)

  if (worldInfo.size <= 0) {
    return {
      raw: data,
      worldInfo: new Collection(),
    }
  }

  return {
    raw: raw as WorldInfoData,
    worldInfo,
  }
}

export function fileBasename(filePath: string) {
  return filePath.replace(/[/\\]+$/, '').split(/[/\\]/).pop() ?? filePath
}
