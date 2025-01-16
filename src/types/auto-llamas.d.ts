import { z } from 'zod'

import { autoLlamasDataSchema } from '../lib/validations/schemas/auto-llamas'

export type AutoLlamasData = z.infer<typeof autoLlamasDataSchema>
