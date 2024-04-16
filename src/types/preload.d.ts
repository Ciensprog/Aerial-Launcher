import type { AccountData, AccountDataRecord } from './accounts'

export type AuthCallbackFunction = (
  response:
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
) => Promise<void>
