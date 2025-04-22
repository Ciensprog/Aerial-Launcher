// import type { StringUnion } from '../../utils'
import type { MCPCommonNotification } from './claim-rewards'

export type MCPPurchaseCatalogEntryResponse = {
  profileRevision: number
  profileId: 'common_core'
  profileChangesBaseRevision: number
  profileChanges: Array<unknown>
  // notifications: Array<{
  //   type: StringUnion<'CatalogPurchase'>
  //   primary?: boolean
  //   client_request_id?: string
  //   lootResult: {
  //     items: Array<
  //       | {
  //           itemType: string
  //           itemGuid: string
  //           itemProfile: StringUnion<'campaign'>
  //           attributes?: Record<string, unknown>
  //           quantity: number
  //         }
  //       | {
  //           itemType: `Schematic:${string}`
  //           itemGuid: string
  //           itemProfile: StringUnion<'campaign'>
  //           attributes: {
  //             Alteration: {
  //               LootTierGroup: string
  //               Tier: number
  //             }
  //             alterations: Array<string>
  //           }
  //           quantity: number
  //         }
  //     >
  //   }
  // }>
  notifications: MCPCommonNotification
  profileCommandRevision: number
  serverTime: string
  multiUpdate: Array<unknown>
  responseVersion: number
}
