import { z } from 'zod'
import { AutomationStatusType } from '../config/constants/automation'

import {
  taxiServiceFileDataSchema,
  taxiServiceFileSchema,
  taxiServiceServerDataSchema,
  taxiServiceServerSchema,
} from '../lib/validations/schemas/taxi-service'

export type TaxiServiceAccountData = {
  accountId: string
  actions: {
    high: boolean
    denyFriendsRequests: boolean
    activeStatus: string
    busyStatus: string
  }
  submittings: {
    connecting: boolean
    removing: boolean
  }
  status: AutomationStatusType | null
}

export type TaxiServiceAccountDataList = Record<
  string,
  TaxiServiceAccountData
>

export type TaxiServiceAccountFileData = z.infer<
  typeof taxiServiceFileDataSchema
>

export type TaxiServiceAccountFileDataList = z.infer<
  typeof taxiServiceFileSchema
>

export type TaxiServiceAccountServerData = z.infer<
  typeof taxiServiceServerDataSchema
>

export type TaxiServiceAccountServerDataList = z.infer<
  typeof taxiServiceServerSchema
>

export type TaxiServiceServiceStatusResponse = {
  accountId: string
  status: TaxiServiceStatusType
}

export type TaxiServiceServiceActionConfig = {
  type: keyof TaxiServiceAccountData['actions']
  value: boolean | string
}
