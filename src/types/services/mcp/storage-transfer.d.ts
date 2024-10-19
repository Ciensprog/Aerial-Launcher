export type MCPStorageTransferItem = {
  itemId: string
  quantity: number
  toStorage: boolean
  newItemIdHint: ''
}

export type MCPStorageTransferResponse = {
  profileRevision: number
  profileId: 'theater0'
  profileChangesBaseRevision: number
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
  profileChanges: Array<unknown>
  multiUpdate: Array<unknown>
}
