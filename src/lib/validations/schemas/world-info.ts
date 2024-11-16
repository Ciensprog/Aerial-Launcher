import { z } from 'zod'

export const worldInfoSchema = z.object({
  missions: z.array(
    z.object({
      availableMissions: z.array(
        z.object({
          missionGuid: z.string(),
          missionRewards: z.object({
            tierGroupName: z.string(),
            items: z.array(
              z.object({
                itemType: z.string(),
                quantity: z.number(),
              })
            ),
          }),
          overrideMissionRewards: z.record(z.string(), z.unknown()),
          missionGenerator: z.string(),
          missionDifficultyInfo: z.object({
            dataTable: z.string(),
            rowName: z.string(),
          }),
          tileIndex: z.number(),
          availableUntil: z.string(),
        })
      ),
      nextRefresh: z.string(),
      theaterId: z.string(),
    })
  ),
  missionAlerts: z.array(
    z.object({
      availableMissionAlerts: z.array(
        z.object({
          name: z.string(),
          categoryName: z.string(),
          spreadDataName: z.string(),
          missionAlertGuid: z.string(),
          tileIndex: z.number(),
          availableUntil: z.string(),
          totalSpreadRefreshes: z.number(),
          missionAlertRewards: z.object({
            tierGroupName: z.string(),
            items: z.array(
              z.object({
                attributes: z
                  .object({
                    Alteration: z
                      .object({
                        LootTierGroup: z.string().optional(),
                        Tier: z.number().optional(),
                      })
                      .partial()
                      .optional(),
                  })
                  .partial()
                  .optional(),
                itemType: z.string(),
                quantity: z.number(),
              })
            ),
          }),
          missionAlertModifiers: z
            .object({
              tierGroupName: z.string(),
              items: z.array(
                z.object({
                  itemType: z.string(),
                  quantity: z.number(),
                })
              ),
            })
            .optional(),
        })
      ),
      nextRefresh: z.string(),
      theaterId: z.string(),
    })
  ),
  theaters: z.array(
    z.object({
      missionRewardNamedWeightsRowName: z.string(),
      uniqueId: z.string(),
      regions: z.array(
        z.object({
          uniqueId: z.string(),
          missionData: z.object({
            difficultyWeights: z.array(
              z.object({
                difficultyInfo: z.object({
                  rowName: z.string(),
                }),
              })
            ),
          }),
          tileIndices: z.array(z.number()),
        })
      ),
    })
  ),
})
