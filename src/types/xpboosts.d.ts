import type { AccountData } from './accounts'

export type XPBoostsData = {
  accountId: string
  available: boolean
  items: {
    personal: XPBoostItem
    teammate: XPBoostItem
  }
}

export type XPBoostsDataWithAccountData = XPBoostsData & {
  account?: AccountData
}

export type XPBoostItem = {
  itemId: string | null
  quantity: number
}

export type XPBoostsConsumePersonalData = {
  accounts: Array<XPBoostsDataWithAccountData>
  originalAccounts: Array<AccountData>
  total: number
}

export type XPBoostsConsumePersonalResponse = {
  total: {
    accounts: number
    xpBoosts: {
      current: number
      expected: number
    }
  }
}
