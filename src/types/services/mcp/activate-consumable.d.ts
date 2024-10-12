import { StringUnion } from '../../utils.d'

export type MCPActivateConsumableResponse = {
  profileRevision: number
  profileId: StringUnion<'campaign'>
  profileChangesBaseRevision: number
  profileChanges: Array<{
    changeType: StringUnion<'itemAdded' | 'itemQuantityChanged'>
    item?: {
      templateId: StringUnion<'Token:xpboost'>
      attributes: {
        level: number
      }
      quantity: number
    }
    itemId: string
    quantity?: number
  }>
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}

export type MCPActivateConsumableError = {
  errorCode: StringUnion<string>
  errorMessage: string
  messageVars: Array<string>
  numericErrorCode: number
  originatingService: StringUnion<'fortnite'>
  intent: StringUnion<'prod-live'>
}
