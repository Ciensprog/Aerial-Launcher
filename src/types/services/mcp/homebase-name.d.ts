import type { StringUnion } from '../../utils'

export type MCPHomebaseNameResponse = {
  profileRevision: number
  profileId: StringUnion<'common_public'>
  profileChangesBaseRevision: number
  profileChanges: Array<{
    changeType: StringUnion<'fullProfileUpdate'>
    profile: {
      created: string
      updated: string
      rvn: number
      wipeNumber: number
      accountId: string
      profileId: StringUnion<'common_public'>
      version: StringUnion<'outpost_name_wipe_march_2023'>
      stats: {
        attributes: {
          banner_color: StringUnion<'defaultcolor18'>
          homebase_name: string
          banner_icon: StringUnion<'standardbanner22'>
        }
      }
      commandRevision: number
      _id: string
      items: Record<string, unknown>
    }
  }>
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}

export type MCPHomebaseNameError = {
  errorCode: StringUnion<
    | 'errors.com.epicgames.fortnite.town_name_validation'
    | 'errors.com.epicgames.validation.validation_failed'
  >
  errorMessage: string
  messageVars: Array<'[homebaseName]'>
  numericErrorCode: number
  originatingService: StringUnion<'fortnite'>
  intent: StringUnion<'prod-live'>
}
