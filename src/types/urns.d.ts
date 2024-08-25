import type {
  autoPinUrnsDataSchema,
  autoPinUrnsServerDataSchema,
} from '../lib/validations/schemas/auto-pin-urns-data'

import { z } from 'zod'

export type AutoPinUrnDataList = z.infer<typeof autoPinUrnsDataSchema>
export type AutoPinUrnDataValue = z.infer<
  typeof autoPinUrnsServerDataSchema
>
