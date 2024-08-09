import { z } from 'zod'
import { AutomationStatusType } from '../config/constants/automation'

import {
  automationFileDataSchema,
  automationFileSchema,
  automationServerDataSchema,
  automationServerSchema,
} from '../lib/validations/schemas/automation'

export type AutomationAccountData = {
  accountId: string
  actions: {
    claim: boolean
    kick: boolean
  }
  submittings: {
    connecting: boolean
    removing: boolean
  }
  status: AutomationStatusType | null
}

export type AutomationAccountDataList = Record<
  string,
  AutomationAccountData
>

export type AutomationAccountFileData = z.infer<
  typeof automationFileDataSchema
>

export type AutomationAccountFileDataList = z.infer<
  typeof automationFileSchema
>

export type AutomationAccountServerData = z.infer<
  typeof automationServerDataSchema
>

export type AutomationAccountServerDataList = z.infer<
  typeof automationServerSchema
>

export type AutomationServiceStatusResponse = {
  accountId: string
  status: AutomationStatusType
}
