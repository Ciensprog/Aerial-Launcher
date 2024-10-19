import { z } from 'zod'

import {
  defaultMissionInterval,
  missionIntervalRange,
} from '../../../config/constants/automation'
import {
  claimingRewardsDelayRange,
  defaultClaimingRewardsDelay,
} from '../../../config/constants/mcp'

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
