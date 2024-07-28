import { z } from 'zod'

import {
  friendSchema,
  friendsSchema,
} from '../lib/validations/schemas/friends'

export type Friend = z.infer<typeof friendSchema>
export type FriendRecord = z.infer<typeof friendsSchema>
