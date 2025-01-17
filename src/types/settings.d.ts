import { z } from 'zod'

import {
  appLanguageSchema,
  customizableMenuSettingsSchema,
  devSettingsSchema,
  settingsSchema,
} from '../lib/validations/schemas/settings'

export type AppLanguageSettings = z.infer<typeof appLanguageSchema>
export type Settings = z.infer<typeof settingsSchema>
export type DevSettings = z.infer<typeof devSettingsSchema>

export type CustomizableMenuSettings = z.infer<
  typeof customizableMenuSettingsSchema
>

export type LanguageResponse = {
  language: Language
  generatedFile: boolean
}
