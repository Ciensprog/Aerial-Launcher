import { z } from 'zod'

export const matchmakingSchema = z.unknown()
export const matchmakingsSchema = z.array(matchmakingSchema)
