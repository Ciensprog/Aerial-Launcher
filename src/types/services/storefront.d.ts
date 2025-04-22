import { z } from 'zod'

import { storefrontCatalogSchema } from '../../lib/validations/schemas/storefront'

export type StorefrontCatalogResponse = z.infer<
  typeof storefrontCatalogSchema
>
