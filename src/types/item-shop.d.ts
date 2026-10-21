import type { AccountData } from './accounts'

export type ItemShopOffer = {
  offerId: string
  title: string
  description: string
  section: string
  storefront: string
  type: string
  rarity: string
  imageUrl: string | null
  iconFile?: string | null
  searchNames?: Array<string>
  price: number
  regularPrice: number
  currencyType: string
  currencySubType: string
  giftable: boolean
  inDate?: string | null
  outDate?: string | null
  grants: Array<{
    templateId: string
    quantity: number
  }>
}

export type ItemShopCatalogResponse = {
  shopDate: string | null
  expiration: string | null
  fetchedAt: string | null
  newShopAvailable: boolean
  offers: Array<ItemShopOffer>
  sections: Array<string>
  fromCache?: boolean
}

export type ItemShopAccountInfo = {
  accountId: string
  vbucks: number
  affiliate: string
  canSendGifts: boolean
  error?: string
}

export type ItemShopActionResult = {
  accountId: string
  success: boolean
  error?: string
  errorMessage?: string
}

export type ItemShopPurchaseRequest = {
  accounts: Array<AccountData>
  offerId: string
  offerTitle: string
  imageUrl: string | null
  expectedTotalPrice: number
  currencyType: string
  currencySubType: string
}

export type ItemShopGiftRequest = {
  accounts: Array<AccountData>
  offerId: string
  offerTitle: string
  imageUrl: string | null
  iconFile?: string | null
  expectedTotalPrice: number
  currencyType: string
  currencySubType: string
  receiverAccountId: string
  receiverDisplayName: string
  personalMessage?: string
}

export type ItemShopHistoryKind = 'gift' | 'purchase'

export type ItemShopGiftHistoryEntry = {
  id: string
  kind?: ItemShopHistoryKind
  createdAt: string
  fromAccountId: string
  fromDisplayName: string
  toAccountId: string
  toDisplayName: string
  offerId: string
  title: string
  imageUrl: string | null
  iconFile?: string | null
  price: number
  creatorCode: string
}

export type ItemShopGiftResultPayload = {
  results: Array<ItemShopActionResult>
  gifts: Array<ItemShopGiftHistoryEntry>
}

export type ItemShopCreatorCodeRequest = {
  accounts: Array<AccountData>
  code: string
}
