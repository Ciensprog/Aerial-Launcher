import type { StringUnion } from '../../utils'

type ProfileId = StringUnion<'campaign'>

export type MCPCommonNotification = Array<{
  type: StringUnion<
    | 'cardPackResult'
    | 'claimedDifficultyIncreaseReward'
    | 'missionAlertComplete'
    | 'phoenixLevelUp'
    | 'questClaim'
  >
  primary: boolean
  client_request_id: string
  displayLevel?: number
  level?: number
  tier?: number
  overrideTier?: number
  questId?: string
  loot?: {
    type?: StringUnion<'lootGrant'>
    primary?: boolean
    client_request_id?: string
    lootSource?: StringUnion<'PhoenixLevelUp'>
    lootSourceInstance?: string
    lootGranted?: {
      items: Array<{
        itemType: string
        itemGuid?: string
        itemProfile?: StringUnion<'campaign'>
        quantity: number
      }>
    }
    items?: Array<{
      itemType: string
      itemGuid?: string
      itemProfile?: StringUnion<'campaign'>
      quantity: number
    }>
  }
  lootGranted?: {
    items: Array<{
      itemType: string
      itemGuid?: string
      itemProfile: StringUnion<'campaign'>
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
        partyEligibility: StringUnion<'User'>
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

export type MCPClaimQuestRewardResponse = {
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

export type MCPRecordCampaignMatchEndedResponse = {
  profileRevision: number
  profileId: StringUnion<'athena'>
  profileChangesBaseRevision: number
  profileChanges: Array<unknown>
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}

export type MCPRedeemSTWAccoladeTokensResponse = {
  profileRevision: number
  profileId: StringUnion<'athena'>
  profileChangesBaseRevision: string
  profileChanges: Array<{
    changeType: string
    name: string
    value: number
  }>
  notifications: Array<{
    type: StringUnion<'redeemStwTokensNotification'>
    primary: boolean
    client_request_id: string
    totalMissionXPRedeemed: number
    totalQuestXPRedeemed: number
  }>
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}

export type MCPSetPinnedQuestsResponse = {
  profileRevision: number
  profileId: ProfileId
  profileChangesBaseRevision: number
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
  profileChanges: MCPCommonProfileChanges
  notifications?: MCPCommonNotification
}

export type MCPSetPinnedQuestsPayload = {
  pinnedQuestIds: Array<string>
}
