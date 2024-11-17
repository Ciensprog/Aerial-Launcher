export type ResourceType =
  | 'construction'
  | 'currency'
  | 'evo'
  | 'perk'
  | 'sc'
  | 'token'
  | 'voucher'
  | 'xp'
  | 'xpboost'

export type ResourceData = {
  name: string
  type: ResourceType
}

export type SurvivorData = {
  gender: number
  name: string | null
  portrait: string | null
}

export type SurvivorUniqueLeadData = {
  managerSynergy: string
  personality: string
  portrait: string
}

export type IngredientData = {
  name: string
}

export type TrapData = {
  name: string
}

export type ParseModifierData =
  WorldInfoMission['ui']['mission']['modifiers'][number]
export type ParseResourceData = {
  imgUrl: string
  itemType: string
  key: string
  name: string
  rarity: RarityType
  type:
    | 'defender'
    | 'hero'
    | 'melee'
    | 'ranged'
    | 'resource'
    | 'ingredient'
    | 'trap'
    | 'worker'
    | null
  quantity: number
}
export type RewardsSummary = Record<
  string,
  {
    imageUrl: string
    quantity: number
  }
>
