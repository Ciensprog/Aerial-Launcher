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
  managerSynergy: string
  personality: string
  portrait: string
}

export type IngredientData = {
  name: string
}
