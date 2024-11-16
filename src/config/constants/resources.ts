import type {
  IngredientData,
  ResourceData,
  SurvivorData,
} from '../../types/data/resources'

import resources from '../../data/resources.json'
import survivorsMythicLeads from '../../data/survivors-mythic-leads.json'
import ingredients from '../../data/ingredients.json'

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

export const rarities: Record<RarityType, string> = {
  [RarityType.Common]: 'Common',
  [RarityType.Uncommon]: 'Uncommon',
  [RarityType.Rare]: 'Rare',
  [RarityType.Epic]: 'Epic',
  [RarityType.Legendary]: 'Legendary',
  [RarityType.Mythic]: 'Mythic',
}

export const resourcesJson = resources as Record<string, ResourceData>
export const survivorsMythicLeadsJson = survivorsMythicLeads as Record<
  string,
  SurvivorData
>
export const ingredientsJson = ingredients as Record<
  string,
  IngredientData
>
