import type { ResourceData } from '../../types/data/resources'

import data from '../../data/resources.json'

export enum RarityType {
  Common = 'c',
  Uncommon = 'uc',
  Rare = 'r',
  Epic = 'vr',
  Legendary = 'sr',
}

export const rarities = {
  [RarityType.Common]: 'Common',
  [RarityType.Uncommon]: 'Uncommon',
  [RarityType.Rare]: 'Rare',
  [RarityType.Epic]: 'Epic',
  [RarityType.Legendary]: 'Legendary',
}

export const resourcesJson = data as Record<string, ResourceData>
