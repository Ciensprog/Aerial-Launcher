import type { AccountData, AccountDataRecord } from './accounts'

export type AuthCallbackResponseParam =
  | {
      accessToken: string
      data: {
        currentAccount: AccountData
        accounts: AccountDataRecord
      }
      error: null
    }
  | {
      accessToken: null
      data: null
      error: string
    }

export type AuthCallbackFunction = (
  response: AuthCallbackResponseParam
) => Promise<void>
