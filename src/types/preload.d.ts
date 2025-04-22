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
        displayName: string
        provider: string | null
      }>
      error: null
    }
  | {
      account: AccountData
      data: null
      error: string
    }

export type CommonNotificationCallbackResponseParam<
  Extra = Record<string, unknown>,
> = {
  account: AccountData
  status: boolean
} & Extra

export type LauncherNotificationCallbackResponseParam =
  CommonNotificationCallbackResponseParam

export type EpicGamesSettingsNotificationCallbackResponseParam =
  CommonNotificationCallbackResponseParam & {
    code?: string
  }

export type GenerateExchangeCodeNotificationCallbackResponseParam =
  | {
      account: AccountData
      code: string
      status: true
    }
  | {
      account: AccountData
      code: null
      status: false
    }

export type NewVersionStatusCallbackResponseParam = {
  link: string
  version: string
} | null
