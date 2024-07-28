import { z } from 'zod'

export const friendSchema = z.object({
  accountId: z.string().min(1),
  displayName: z.string().min(1),
  invitations: z.number().transform((value) => {
    const newValue = parseInt(`${value}`)

    if (newValue <= 0 || Number.isNaN(newValue)) {
      return 0
    }

    if (newValue > Number.MAX_SAFE_INTEGER) {
      return Number.MAX_SAFE_INTEGER
    }

    return newValue
  }),
})
export const friendsSchema = z.record(z.string().min(1), friendSchema)
