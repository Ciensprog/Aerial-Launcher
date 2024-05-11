import { z } from 'zod'

import { tagSchema, tagsSchema } from '../lib/validations/schemas/tags'

export type Tag = z.infer<typeof tagSchema>
export type TagRecord = z.infer<typeof tagsSchema>
