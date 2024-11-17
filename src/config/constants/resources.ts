import type {
  IngredientData,
  ResourceData,
  SurvivorData,
  SurvivorUniqueLeadData,
  TrapData,
} from '../../types/data/resources'

import resources from '../../data/resources.json'
import survivors from '../../data/survivors.json'
import survivorsMythicLeads from '../../data/survivors-mythic-leads.json'
import ingredients from '../../data/ingredients.json'
import traps from '../../data/traps.json'

export enum RarityType {
  Common = 'c',
  Uncommon = 'uc',
  Rare = 'r',
  Epic = 'vr',
  Legendary = 'sr',
  Mythic = 'ur',
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

export const raritiesColor: Record<RarityType, string> = {
  [RarityType.Common]: RarityColor.Common,
  [RarityType.Uncommon]: RarityColor.Uncommon,
  [RarityType.Rare]: RarityColor.Rare,
  [RarityType.Epic]: RarityColor.Epic,
  [RarityType.Legendary]: RarityColor.Legendary,
  [RarityType.Mythic]: RarityColor.Mythic,
}

export const resourcesJson = resources as Record<string, ResourceData>
export const survivorsJson = survivors as Record<string, SurvivorData>
export const survivorsMythicLeadsJson = survivorsMythicLeads as Record<
  string,
  SurvivorUniqueLeadData
>
export const ingredientsJson = ingredients as Record<
  string,
  IngredientData
>
export const trapsJson = traps as Record<string, TrapData>
