import { z } from 'zod'

export const groupSchema = z.array(z.string().min(1))
export const groupsSchema = z.record(z.string().min(1), groupSchema)
