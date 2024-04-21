import { z } from 'zod'

import { settingsSchema } from '../lib/validations/schemas/settings'

export type Settings = z.infer<typeof settingsSchema>
