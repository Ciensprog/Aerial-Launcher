import { z } from 'zod'

import {
  accountBasicInformationSchema,
  accountDataListSchema,
  accountDataSchema,
  accountListSchema,
} from '../lib/validations/schemas/accounts'

export type AccountBasicInfo = z.infer<
  typeof accountBasicInformationSchema
>
export type AccountData = z.infer<typeof accountDataSchema>
export type AccountList = z.infer<typeof accountListSchema>
export type AccountDataList = z.infer<typeof accountDataListSchema>
export type AccountDataRecord = Record<string, AccountData>
