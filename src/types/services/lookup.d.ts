export type LookupExternalAuthType = 'psn' | 'xbl' | 'nintendo' | 'steam'

export type LookupExternalAuth = {
  accountId?: string
  type?: string
  externalAuthId?: string
  externalAuthIdType?: string
  externalDisplayName?: string
  authIds?: Array<unknown>
}

export type LookupFindOneByDisplayNameResponse = {
  id: string
  displayName: string
  externalAuths?: Partial<Record<string, LookupExternalAuth>>
}

export type LookupFindManyByDisplayNameResponse =
  Array<LookupFindManyByDisplayName>

export type LookupFindManyByDisplayName = {
  id: string
  displayName: string
  externalAuths: Partial<
    Record<LookupExternalAuthType, LookupExternalAuth> &
      Record<string, LookupExternalAuth>
  >
}
