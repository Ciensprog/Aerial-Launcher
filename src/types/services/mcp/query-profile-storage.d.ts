export type MCPQueryProfileStorageItem = {
  templateId: string
  attributes: Partial<{
    loadedAmmo: number
    inventory_overflow_date: boolean
    level: number
    alterationDefinitions: Array<number>
    durability: number
    itemSource: string
  }>
  quantity: number
}

export type MCPQueryProfileStorageProfile = {
  profileRevision: number
  profileId: 'common_core'
  profileChangesBaseRevision: number
  profileChanges: [
    {
      changeType: 'fullProfileUpdate'
      profile: {
        _id: string
        created: string
        updated: string
        rvn: number
        wipeNumber: number
        accountId: string
        profileId: 'common_core'
        version: string
        stats: {
          attributes: Record<string, unknown>
        }
        profileLockExpiration: string
        commandRevision: number
        items: Record<string, MCPQueryProfileStorageItem>
      }
    },
  ]
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}
