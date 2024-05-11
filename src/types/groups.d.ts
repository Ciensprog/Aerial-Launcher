import { z } from 'zod'

import {
  groupSchema,
  groupsSchema,
} from '../lib/validations/schemas/groups'

export type Group = z.infer<typeof groupSchema>
export type GroupRecord = z.infer<typeof groupsSchema>
