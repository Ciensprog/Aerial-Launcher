import { z } from 'zod'

import {
  customizableMenuSettingsSchema,
  devSettingsSchema,
  settingsSchema,
} from '../lib/validations/schemas/settings'

export type Settings = z.infer<typeof settingsSchema>
export type DevSettings = z.infer<typeof devSettingsSchema>

export type CustomizableMenuSettings = z.infer<
  typeof customizableMenuSettingsSchema
>
