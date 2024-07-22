export type LookupFindOneByDisplayNameResponse = {
  id: string
  displayName: string
  externalAuths: Partial<Record<string, unknown>>
}
