import type { AccountData } from './accounts'

export type AccountExportRequest = {
  accounts: Array<AccountData>
}

export type AccountExportAccountResult = {
  accountId: string
  ok: boolean
  path: string | null
  errorMessage?: string
}

export type AccountExportResult = {
  canceled: boolean
  directory: string | null
  results: Array<AccountExportAccountResult>
}
