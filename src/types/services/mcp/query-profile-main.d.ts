import { StringUnion } from '../../utils.d'

export type MCPQueryProfileMainProfile = {
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
          attributes: {
            current_mtx_platform: StringUnion<'EpicPC'>
            weekly_purchases: {
              lastInterval: string
              purchaseList: Record<string, number>
            }
            daily_purchases?: {
              lastInterval: string
              purchaseList?: Record<string, number>
            }
            in_app_purchases?: {
              receipts: Array<string>
              ignoredReceipts: Array<unknown>
              fulfillmentCounts?: Record<string, number>
              refreshTimers: {
                EpicPurchasingService: {
                  nextEntitlementRefresh: string
                }
              }
              version: number
            }
            forced_intro_played: StringUnion<'Coconut'>
            rmt_purchase_history: {
              purchases: Array<{
                fulfillmentId: string
                purchaseDate: string
                lootResult: [
                  {
                    itemType: string
                    itemGuid: string
                    itemProfile: StringUnion<'athena'>
                    attributes: Record<string, unknown>
                    quantity: number
                  },
                ]
              }>
            }
            undo_timeout: StringUnion<'min'>
            monthly_purchases: {
              lastInterval: string
              purchaseList: Record<string, number>
            }
            item_sync: {
              lastCheckSum: string
            }
            allowed_to_send_gifts: boolean
            mfa_enabled: boolean
            gift_history: {
              num_sent: number
              sentTo: Record<string, string>
              num_received: number
              receivedFrom: Record<string, string>
              gifts: Array<{
                date: string
                offerId: string
                toAccountId: string
              }>
            }
          }
        }
        commandRevision: number
        items: Record<
          string,
          {
            templateId: string
            attributes: Partial<{
              event_purchases: Record<string, number>
              event_instance_id: string
              creation_time: StringUnion<'min'>
              level: number
              item_seen: boolean
              platform: StringUnion<'Shared'>
            }>
            quantity: number
          }
        >
      }
    },
  ]
  profileCommandRevision: number
  serverTime: string
  responseVersion: number
}
