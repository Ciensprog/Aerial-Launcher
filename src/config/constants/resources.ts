import type { ResourceData } from '../../types/data/resources'

import data from '../../data/resources.json'

export enum RarityType {
  Common = 'c',
  Uncommon = 'uc',
  Rare = 'r',
  Epic = 'vr',
  Legendary = 'sr',
  Mythic = 'er',
}

export enum RarityColor {
  Common = '#bfbaba',
  Uncommon = '#04c577',
  Rare = '#51a1db',
  Epic = '#d076f6',
  Legendary = '#ed7e39',
  Mythic = '#cdab47',
}

export const rarities = {
  [RarityType.Common]: 'Common',
  [RarityType.Uncommon]: 'Uncommon',
  [RarityType.Rare]: 'Rare',
  [RarityType.Epic]: 'Epic',
  [RarityType.Legendary]: 'Legendary',
  [RarityType.Mythic]: 'Mythic',
}

export const resourcesJson = data as Record<string, ResourceData>
