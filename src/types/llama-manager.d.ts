export type LlamaManagerShopOffer = {
  offerId: string
  devName: string
  title: string
  storefront: string
  displayAssetPath: string
  dailyLimit: number
  weeklyLimit: number
  monthlyLimit: number
  purchasedToday: number
  remaining: number | null
  price: number
  currencyType: string
  currencySubType: string
  regularPrice: number
  isFree: boolean
  isXRay: boolean
  itemGrants: Array<{
    templateId: string
    quantity: number
  }>
  prerollItems: Array<{
    itemType: string
    quantity: number
  }>
}

export type LlamaManagerInventoryPack = {
  itemId: string
  templateId: string
  name: string
  quantity: number
  packSource?: string
  isChoicePack: boolean
  choiceOptions: Array<{
    itemType: string
    quantity: number
    index: number
  }>
}

export type LlamaManagerCurrency = {
  templateId: string
  quantity: number
  name: string
}

export type LlamaManagerAccountData = {
  accountId: string
  shop: Array<LlamaManagerShopOffer>
  inventory: Array<LlamaManagerInventoryPack>
  currencies: Array<LlamaManagerCurrency>
  error?: string
}

export type LlamaManagerPurchaseRequest = {
  accountId: string
  offerId: string
  quantity: number
  currencySubType: string
  expectedTotalPrice: number
  currencyType?: string
}

/** mini = Mini Reward Llama tokens; upgrade = Upgrade/X-Ray llama (50 tickets or bronze token) */
export type LlamaManagerBulkKind = 'mini' | 'upgrade'

/** Buy llamas on many accounts at once (one button). */
export type LlamaManagerBulkPurchaseRequest = {
  accountIds: Array<string>
  quantity: number
  kind: LlamaManagerBulkKind
}

export type LlamaManagerBulkPurchaseResult = {
  success: boolean
  kind: LlamaManagerBulkKind
  totalPurchased: number
  accountsOk: number
  accountsFailed: number
  perAccount: Array<{
    accountId: string
    purchased: number
    error?: string
  }>
  error?: string
}

/** @deprecated use LlamaManagerBulkPurchaseRequest */
export type LlamaManagerBulkMiniPurchaseRequest = LlamaManagerBulkPurchaseRequest
/** @deprecated use LlamaManagerBulkPurchaseResult */
export type LlamaManagerBulkMiniPurchaseResult = LlamaManagerBulkPurchaseResult

export type LlamaManagerOpenRequest = {
  accountId: string
  itemIds: Array<string>
}

export type LlamaManagerOpenChoiceRequest = {
  accountId: string
  /** Single pack (legacy / dialog) */
  cardPackItemId?: string
  /** Bulk open all with same selection index */
  cardPackItemIds?: Array<string>
  selectionIdx: number
}

export type LlamaManagerActionResult = {
  accountId: string
  success: boolean
  opened?: number
  purchased?: number
  error?: string
  rewards?: Record<string, number>
}
