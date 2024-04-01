export type AccountInformation = {
  accountId: string
  deviceId: string
  displayName: string
  secret: string
}

export type AccountInformationDetailed = AccountInformation & {
  provider?: string | null
}

export type AccountList = Record<string, AccountInformation>

export type AccountListDetailed = Record<
  string,
  AccountInformationDetailed
>
