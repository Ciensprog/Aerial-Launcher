import { z } from 'zod'

import {
  defaultMissionInterval,
  missionIntervalRange,
} from '../../../config/constants/automation'
import {
  claimingRewardsDelayRange,
  defaultClaimingRewardsDelay,
} from '../../../config/constants/mcp'

import { Language } from '../../../locales/resources'

export const appLanguageSchema = z.object({
  i18n: z
    .enum([Language.English, Language.Spanish, Language.Chinese])
    .default(Language.English),
})

export const settingsSchema = z.object({
  claimingRewards: createRangeValidation({
    defaultValue: defaultClaimingRewardsDelay,
    range: claimingRewardsDelayRange,
  }),
  missionInterval: createRangeValidation({
    decimals: 0,
    defaultValue: defaultMissionInterval,
    range: missionIntervalRange,
  }),
  path: z.string().trim().min(1),
  systemTray: z.boolean().default(false),
  userAgent: z.string().trim().min(1),
})

export const devSettingsSchema = z
  .object({
    transfer: z.boolean().default(false),
  })
  .partial()

export const customizableMenuSettingsSchema = z
  .object({
    stwOperations: z.boolean().default(true),
    autoKick: z.boolean().default(true),
    party: z.boolean().default(true),
    saveQuests: z.boolean().default(true),
    homebaseName: z.boolean().default(true),
    xpBoosts: z.boolean().default(true),
    autoPinUrns: z.boolean().default(true),
    autoLlamas: z.boolean().default(true),
    unlock: z.boolean().default(true),

    accountManagement: z.boolean().default(true),
    vbucksInformation: z.boolean().default(true),
    redeemCodes: z.boolean().default(true),
    devicesAuth: z.boolean().default(true),
    epicGamesSettings: z.boolean().default(true),
    eula: z.boolean().default(true),

    advancedMode: z.boolean().default(true),
    matchmakingTrack: z.boolean().default(true),
    worldInfo: z.boolean().default(true),

    myAccounts: z.boolean().default(true),
    showTotalAccounts: z.boolean().default(true),
    authorizationCode: z.boolean().default(true),
    exchangeCode: z.boolean().default(true),
    deviceAuth: z.boolean().default(true),
    removeAccount: z.boolean().default(true),
  })
  .partial()

function createRangeValidation(config: {
  defaultValue: number
  decimals?: number
  range: { max: number; min: number }
}) {
  const currentConfig = z
    .string()
    .default(`${config.defaultValue}`)
    .transform((value, context) => {
      let newValue = config.defaultValue

      try {
        newValue = Number(
          (Number.isNaN(+value) ? config.defaultValue : +value).toFixed(
            config.decimals ?? 1
          )
        )

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //
      }

      if (newValue < config.range.min || newValue > config.range.max) {
        context.addIssue({
          message: `Delay value must between ${config.range.min} and ${config.range.max}`,
          code: 'custom',
        })
      }

      return `${newValue}`
    })

  return currentConfig
}
