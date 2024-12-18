import type { WorldInfoData } from '../../services/advanced-mode/world-info'
import type { ParseResourceData } from '../resources'

import { Collection } from '@discordjs/collection'
import { z } from 'zod'

import {
  World,
  zonesCategories,
} from '../../../config/constants/fortnite/world-info'
import { RarityType } from '../../../config/constants/resources'

import { worldInfoSchema } from '../../../lib/validations/schemas/world-info'

export type WorldInfoResponse =
  | {
      data: WorldInfoData
      status: true
    }
  | {
      data: null
      status: false
    }

export type WorldInfoDeleteResponse = {
  filename: string
  status: boolean
}

export type WorldInfoExportResponse = {
  status: 'canceled' | 'error' | 'success'
}

export type WorldInfoOpenResponse = {
  filename: string
  status: boolean
}

export type WorldInfoFileData = {
  createdAt: Date
  data: WorldInfoData | null
  date: Date
  filename: string
  id: string
  size: number
}

export type SaveWorldInfoData = {
  data: WorldInfoData
  filename: string
}

export type WorldInfoParsed = z.infer<typeof worldInfoSchema>

export type WorldInfo = Collection<
  World,
  Collection<string, WorldInfoMission>
>

export type WorldInfoMission = {
  raw: {
    alert:
      | WorldInfoParsed['missionAlerts'][number]['availableMissionAlerts'][number]
      | null
    mission: WorldInfoParsed['missions'][number]['availableMissions'][number]
  }

  filters: Array<string>

  ui: {
    alert: {
      rewards: Array<
        {
          itemId: string
          imageUrl: string
          quantity: number
          rarity: RarityType
        } & Pick<ParseResourceData, 'type'>
      >
    }
    mission: {
      modifiers: Array<{
        id: string
        imageUrl: string
      }>
      rewards: Array<{
        imageUrl: string
        itemId: string
        isBad: boolean
        key: string
        quantity: number
      }>
      zone: {
        color: string
        iconUrl?: string
        letter: string
        theme: {
          id: string
        }
        type: {
          id: keyof typeof zonesCategories | 'unknown'
          imageUrl: string
        }
      }
    }
    powerLevel: number
  }
}
