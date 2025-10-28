import { StringUnion } from '../utils.d'

export type LookupFindOneByDisplayNameResponse = {
  id: string
  displayName?: string
  externalAuths?: {
    psn?: {
      accountId: string
      type: StringUnion<'psn'>
      externalAuthId: string
      externalAuthIdType: StringUnion<'psn_user_id'>
      externalDisplayName: string
      authIds: Array<{
        id: string
        type: StringUnion<'psn_user_id'>
      }>
    }
    xbl?: {
      accountId: string
      type: StringUnion<'xbl'>
      externalAuthIdType: StringUnion<'xuid'>
      externalDisplayName: string
      authIds: Array<unknown>
    }
  }
}

export type LookupFindManyByDisplayNameResponse =
  Array<LookupFindManyByDisplayName>

export type LookupFindManyByDisplayName = {
  id: string
  displayName?: string
  externalAuths: {
    psn?: {
      accountId: string
      type: StringUnion<'psn'>
      externalAuthId: string
      externalAuthIdType: StringUnion<'psn_user_id'>
      externalDisplayName: string
      authIds: Array<{
        id: string
        type: StringUnion<'psn_user_id'>
      }>
    }
    xbl?: {
      accountId: string
      type: StringUnion<'xbl'>
      externalAuthIdType: StringUnion<'xuid'>
      externalDisplayName: string
      authIds: Array<unknown>
    }
  }
}
