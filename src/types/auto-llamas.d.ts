import { z } from 'zod'

import {
  autoLlamasDataRecordSchema,
  autoLlamasDataSchema,
} from '../lib/validations/schemas/auto-llamas'

export type AutoLlamasData = z.infer<typeof autoLlamasDataSchema>
export type AutoLlamasRecord = z.infer<typeof autoLlamasDataRecordSchema>
