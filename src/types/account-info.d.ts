import type { SchematicRarity } from '../lib/stw/dq-weapons'
import type { VentureTrack } from '../lib/stw/ventures'

export type AccountInfoKind = 'weapon' | 'trap' | 'resource' | 'gadget'

export type AccountInfoRarity = SchematicRarity | 'er'

export type AccountInfoProfileId =
  | 'campaign'
  | 'theater0'
  | 'outpost0'
  | 'theater2'

export type AccountInfoItem = {
  itemId: string
  templateId: string
  kind: AccountInfoKind
  name: string
  meta: string
  rarity: AccountInfoRarity
  power: number
  quantity: number
  level: number
  durability: number
  maxDurability: number
  loadedAmmo: number | null
  favorite: boolean
  imageUrl: string
  fallbackUrl: string
  alterations: Array<string>
  profileId: AccountInfoProfileId
}

export type AccountInfoResource = {
  templateId: string
  name: string
  quantity: number
  imageUrl: string
  fallbackUrl: string
  rarity: AccountInfoRarity
}

export type AccountInfoXpBar = {
  current: number
  cap: number
}

export type AccountInfoXp = {
  level: number
  levelXp: number
  xpPerLevel: number
  br: AccountInfoXpBar
  creative: AccountInfoXpBar
  stw: AccountInfoXpBar
}

export type AccountInfoAccountData = {
  accountId: string
  available: boolean
  errorMessage?: string
  xp: AccountInfoXp
  commander: {
    baseLevel: number
    postLevel: number
    total: number
  }
  xpBoosts: {
    personal: number
    teammate: number
    applied: number
    boostedXP: number
  }
  resources: Array<AccountInfoResource>
  backpack: Array<AccountInfoItem>
  storage: Array<AccountInfoItem>
  ventures: Array<AccountInfoItem>
  venturesTrack: VentureTrack
}

export type AccountInfoActionResult = {
  accountId: string
  success: boolean
  action: 'recycle' | 'upgrade'
  errorMessage?: string
  data?: AccountInfoAccountData
}
