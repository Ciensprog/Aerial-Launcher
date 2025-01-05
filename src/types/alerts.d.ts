import type { LookupFindOneByDisplayNameResponse } from './services/lookup'
import type { MCPQueryProfileChanges } from './services/mcp'
import type { AccountData } from './accounts'

export type AlertsDoneSearchPlayerConfig = {
  accounts: Array<AccountData>
  inputSearch: string
}

export type AlertsDoneSearchPlayerResponse =
  | {
      data:
        | (Pick<AlertsDoneSearchPlayerData, 'lookup'> &
            Partial<Pick<AlertsDoneSearchPlayerData, 'profileChanges'>>)
        | null
      errorMessage: string | null
      isPrivate: boolean
      success: false
    }
  | {
      data: AlertsDoneSearchPlayerData
      errorMessage: null
      isPrivate: false
      success: true
    }

export type AlertsDoneSearchPlayerData = {
  lookup: LookupFindOneByDisplayNameResponse &
    Partial<{
      externalAuthType: 'psn' | 'xbl'
    }>
  profileChanges: MCPQueryProfileChanges
}
