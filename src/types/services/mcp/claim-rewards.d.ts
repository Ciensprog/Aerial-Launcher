export type ProfileId = 'campaign' | (string & Record<string, unknown>)

export type MCPCommonNotification = Array<{
  type:
    | 'cardPackResult'
    | 'missionAlertComplete'
    | (string & Record<string, unknown>)
  primary: boolean
  client_request_id: string
  displayLevel?: number
  tier?: number
  overrideTier?: number
  lootGranted: {
    items: Array<{
      itemType: string
      itemGuid?: string
      itemProfile: 'campaign' | (string & Record<string, unknown>)
      quantity: number
      attributes?: {
        Alteration: {
          Tier: number
          LootTierGroup: string
        }
      }
    }>
  }
}>

export type MCPCommonProfileChanges = Array<{
  changeType:
    | 'itemAdded'
    | 'itemRemoved'
    | 'itemAttrChanged'
    | 'itemQuantityChanged'
  itemId?: string
  item?: {
    templateId: string
    attributes: {
      level: number
      alterations: Array<string>
    }
    quantity: number
  }
  name?: string
  attributeName?: string
  attributeValue?:
    | number
    | string
    | Array<{
        matchmakingSessionId: string
        totalSecondsInMatch: number
        primaryMissionName: string
        partyEligibility: 'User' | (string & Record<string, unknown>)
        accoladesToGrant: Array<{
          templateToGrant: string
          numToGrant: number
          realXPGranted: number
          rawXPGranted: number
        }>
        totalMissionXPEarnedInMatch: number
        totalQuestXPEarnedInMatch: number
        totalRestSpentInMatch: number
      }>
  value?: {
    claimData: Array<{
      missionAlertId: string
      redemptionDateUtc: string
      evictClaimDataAfterUtc: string
    }>
  }
  quantity?: number
}>

export type MCPOpenCardPackBatchPayload = {
  cardPackItemIds: Array<string>
}

export type MCPOpenCardPackBatchResponse = {
  profileRevision: number
  profileId: ProfileId
  profileChangesBaseRevision: number
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
  profileChanges: MCPCommonProfileChanges
  notifications?: MCPCommonNotification
}

export type MCPClaimMissionAlertRewardsResponse = {
  profileRevision: number
  profileId: ProfileId
  profileChangesBaseRevision: number
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
  profileChanges: MCPCommonProfileChanges
  notifications?: MCPCommonNotification
}

export type MCPClaimDifficultyIncreaseRewardsResponse = {
  profileRevision: number
  profileId: ProfileId
  profileChangesBaseRevision: number
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
  profileChanges: MCPCommonProfileChanges
  notifications?: MCPCommonNotification
}

export type MCPRedeemSTWAccoladeTokensResponse = {
  profileRevision: number
  profileId: 'athena' | (string & Record<string, unknown>)
  profileChangesBaseRevision: string
  profileChanges: Array<{
    changeType: string
    name: string
    value: number
  }>
  notifications: Array<{
    type:
      | 'redeemStwTokensNotification'
      | (string & Record<string, unknown>)
    primary: boolean
    client_request_id: string
    totalMissionXPRedeemed: number
    totalQuestXPRedeemed: number
  }>
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}
