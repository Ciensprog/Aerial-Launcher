import { z } from 'zod'

export const storefrontCatalogSchema = z.object({
  refreshIntervalHrs: z.number(),
  dailyPurchaseHrs: z.number(),
  expiration: z.string().datetime(),
  storefronts: z.array(
    z.object({
      name: z.union([
        z.string().and(z.object({})),
        z.enum([
          'CardPackStoreGameplay',
          'CardPackStorePreroll',
          'FoundersPack',
          'STWRotationalEventStorefront',
          'STWSpecialEventStorefront',
        ]),
      ]),
      catalogEntries: z.array(
        z.object({
          offerId: z.string(),
          devName: z.string(),
          offerType: z.union([
            z.string().and(z.object({})),
            z.enum(['StaticPrice']),
          ]),
          prices: z.array(
            z.object({
              currencyType: z.union([
                z.string().and(z.object({})),
                z.enum(['GameItem', 'MtxCurrency', 'RealMoney']),
              ]),
              currencySubType: z.string(),
              regularPrice: z.number(),
              dynamicRegularPrice: z.number(),
              finalPrice: z.number(),
              saleType: z.union([
                z.string().and(z.object({})),
                z.enum(['PercentOff', 'Strikethrough']).optional(),
              ]),
              saleExpiration: z.string().datetime(),
              basePrice: z.number(),
            })
          ),
          // categories: z.array(z.unknown()),
          dailyLimit: z.number(),
          weeklyLimit: z.number(),
          monthlyLimit: z.number(),
          refundable: z.boolean(),
          // appStoreId: z.array(z.string()),
          // requirements: z.array(z.unknown()),
          meta: z
            .object({
              PurchaseLimitingEventId: z.string(),
              EventLimit: z.string(),
              open_cardpacks: z.union([
                z.string().and(z.object({})),
                z.enum(['true', 'false']),
              ]),
            })
            .partial()
            .optional(),
          metaInfo: z
            .array(
              z.object({
                key: z.string(),
                value: z.string(),
              })
            )
            .optional(),
          // catalogGroup: z.union([
          //   z.string().and(z.object({})),
          //   z.enum(['Upgrade', 'Shared']),
          // ]),
          // catalogGroupPriority: z.number(),
          sortPriority: z.number(),
          title: z.string().optional(),
          // shortDescription: z.string(),
          // description: z.string(),
          displayAssetPath: z.string(),
          itemGrants: z.array(
            z.object({
              templateId: z.string(),
              quantity: z.number(),
              attributes: z.record(z.string(), z.unknown()).optional(),
            })
          ),
        })
      ),
    })
  ),
})
