export type CollectionBookSectionId =
  | 'heroes-soldiers'
  | 'heroes-constructors'
  | 'heroes-ninjas'
  | 'heroes-outlanders'
  | 'personnel-defenders'
  | 'personnel-survivors'
  | 'personnel-leads'
  | 'ranged-assault'
  | 'ranged-shotgun'
  | 'ranged-sniper'
  | 'ranged-pistol'
  | 'ranged-explosive'
  | 'melee-sword'
  | 'melee-axe'
  | 'melee-scythe'
  | 'melee-spear'
  | 'melee-hardware'
  | 'traps-wall'
  | 'traps-ceiling'
  | 'traps-floor'
  | 'starter-packs'
  | 'event-people'
  | 'event-schematics'
  | 'expansion-people'
  | 'expansion-schematics'
  | 'other'

export type CollectionBookCostKind =
  | 'hero'
  | 'defender'
  | 'survivor'
  | 'lead'
  | 'weapon'
  | 'trap'

export type CollectionBookItemState = 'book' | 'armory' | 'missing'

export type CollectionBookItem = {
  itemId: string
  cardKey: string
  templateId: string
  name: string
  type: 'hero' | 'schematic' | 'defender' | 'worker' | 'other'
  costKind: CollectionBookCostKind
  sectionId: CollectionBookSectionId
  level: number
  maxLevel: number
  starTier: number
  /** Rarity code: c, uc, r, vr, sr, ur */
  rarity: string
  favorite: boolean
  state: CollectionBookItemState
  profileId: string
  armoryCount: number
  imageUrl?: string
  fallbackUrl?: string
}

export type CollectionBookSection = {
  id: CollectionBookSectionId
  itemCount: number
  belowTarget: number
  items: Array<CollectionBookItem>
}

export type CollectionBookResources = {
  peopleXp: number
  schematicXp: number
  rain: number
  lightning: number
  eye: number
  shard: number
  trainingManuals: number
  schematicManuals: number
  heroSupercharger: number
  survivorSupercharger: number
  weaponSupercharger: number
  trapSupercharger: number
}

export type CollectionBookAccountData = {
  accountId: string
  collectionBookLevel: number
  accountLevel: number
  accountXp: number
  resources: CollectionBookResources
  items: Array<CollectionBookItem>
  sections: Array<CollectionBookSection>
  error?: string
}

export type CollectionBookUpgradeRequest = {
  accountId: string
  /** Specific item IDs. One card upgrades one copy. */
  itemIds?: Array<string>
  /** A page id, a parent tab id, or all */
  sectionId?: string
  targetLevel: number
}

export type CollectionBookSlotRequest = {
  accountId: string
  itemIds: Array<string>
}

export type CollectionBookActionResult = {
  accountId: string
  success: boolean
  upgraded?: number
  skipped?: number
  failed?: number
  slotted?: number
  error?: string
}
