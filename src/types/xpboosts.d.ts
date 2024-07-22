import type { LookupFindOneByDisplayNameResponse } from './services/lookup'
import type { MCPQueryProfileChanges } from './services/mcp'
import type { AccountData } from './accounts'

export type XPBoostType = 'personal' | 'teammate'

export type XPBoostsData = {
  accountId: string
  available: boolean
  items: Record<XPBoostType, XPBoostItem>
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

export type XPBoostsSearchUserConfig = {
  account: AccountData
  displayName: string
}

export type XPBoostsSearchUserResponse =
  | {
      data: Pick<XPBoostsSearchUserData, 'lookup'> | null
      errorMessage: string | null
      isPrivate: boolean
      success: false
    }
  | {
      data: XPBoostsSearchUserData
      errorMessage: null
      isPrivate: false
      success: true
    }

export type XPBoostsSearchUserData = {
  lookup: LookupFindOneByDisplayNameResponse
  profileChanges: MCPQueryProfileChanges
}
