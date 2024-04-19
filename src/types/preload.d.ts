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

export type AntiCheatProviderCallbackResponseParam =
  | {
      account: AccountData
      data: Partial<{
        accessToken: string
        provider: string | null
      }>
      error: null
    }
  | {
      account: AccountData
      data: null
      error: string
    }

export type LauncherNotificationCallbackResponseParam = {
  account: AccountData
  status: boolean
}
