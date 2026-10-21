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
    claimParty: boolean
    kick: boolean
    transferMats: boolean
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

export type AutomationServiceActionConfig = {
  type: keyof AutomationAccountData['actions']
  value: boolean
}

export type AutomationLogFileSettings = {
  logPath: string
  kick: boolean
  claim: boolean
  claimParty: boolean
  transferMats: boolean
}

export type AutomationLogFilePlayer = {
  file: string
  displayName: string | null
  accountId?: string | null
}

export type AutomationLogFileStatus = AutomationLogFileSettings & {
  fortniteRunning: boolean
  instanceCount: number
  players: Array<AutomationLogFilePlayer>
  lastEvent: string | null
  stamp: number
}
